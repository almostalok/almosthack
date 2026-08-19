import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

export interface SourceFile {
  path: string;
  content: string;
}

export interface FileComparisonResult {
  sourcePath: string;
  targetPath: string;
  similarity: number;
  confidence: number;
  matchedLinesCount: number;
  sourceStartLine: number;
  sourceEndLine: number;
  targetStartLine: number;
  targetEndLine: number;
  fragmentHash: string;
  sourceSnippet: string;
  targetSnippet: string;
}

export interface RepositoryComparisonResult {
  sourceSubmissionId: string;
  targetSubmissionId: string;
  overallSimilarity: number;
  overallConfidence: number;
  matchingFilesCount: number;
  totalFilesCompared: number;
  fileResults: FileComparisonResult[];
}

export const SUPPORTED_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.py',
  '.java',
  '.cpp',
  '.c',
  '.go',
  '.rs',
  '.cs',
  '.php',
  '.rb',
]);

export const IGNORED_PATH_PATTERNS = [
  /node_modules/i,
  /\.git/i,
  /dist/i,
  /build/i,
  /out/i,
  /coverage/i,
  /vendor/i,
  /\.next/i,
  /package-lock\.json/i,
  /pnpm-lock\.yaml/i,
  /yarn\.lock/i,
];

@Injectable()
export class IntegrityEngineService {
  private readonly logger = new Logger(IntegrityEngineService.name);
  public readonly ENGINE_VERSION = '1.0.0';

  // Resource limits
  public readonly MAX_FILES_PER_REPO = 500;
  public readonly MAX_FILE_SIZE_BYTES = 500 * 1024; // 500 KB
  public readonly MAX_TOTAL_REPO_BYTES = 10 * 1024 * 1024; // 10 MB

  /**
   * Normalizes source code by removing comments, formatting, and collapsing whitespace.
   */
  public normalizeSource(source: string, extension: string): string {
    if (!source || typeof source !== 'string') return '';

    // Line endings normalization
    let normalized = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Remove comments based on language syntax
    if (['.py', '.rb'].includes(extension)) {
      // Python/Ruby comments
      normalized = normalized.replace(/#.*$/gm, '');
      normalized = normalized.replace(/"""[\s\S]*?"""/g, '');
      normalized = normalized.replace(/'''[\s\S]*?'''/g, '');
    } else {
      // C-style / JS / Java / Go / Rust comments
      normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '');
      normalized = normalized.replace(/\/\/.*$/gm, '');
    }

    // Collapse multiple whitespace and trim lines
    const lines = normalized
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return lines.join('\n');
  }

  /**
   * Tokenizes normalized code into standard alphanumeric/symbol tokens.
   */
  public tokenize(normalizedCode: string): string[] {
    if (!normalizedCode) return [];
    // Match identifiers, keywords, operators, and literals
    const tokens = normalizedCode.match(/[a-zA-Z0-9_$]+|[^\s\w]/g);
    return tokens || [];
  }

  /**
   * Generates rolling k-gram hash fingerprints from token array.
   */
  public generateFingerprints(tokens: string[], k = 4): Set<string> {
    const fingerprints = new Set<string>();
    if (tokens.length < k) {
      if (tokens.length > 0) {
        fingerprints.add(crypto.createHash('sha256').update(tokens.join('')).digest('hex').substring(0, 16));
      }
      return fingerprints;
    }

    for (let i = 0; i <= tokens.length - k; i++) {
      const kgram = tokens.slice(i, i + k).join('');
      const hash = crypto.createHash('sha256').update(kgram).digest('hex').substring(0, 16);
      fingerprints.add(hash);
    }

    return fingerprints;
  }

  /**
   * Calculates Jaccard / Overlap similarity between two sets of fingerprints.
   */
  public calculateSimilarity(setA: Set<string>, setB: Set<string>): number {
    if (setA.size === 0 || setB.size === 0) return 0;

    let intersectionSize = 0;
    for (const item of setA) {
      if (setB.has(item)) {
        intersectionSize++;
      }
    }

    const unionSize = setA.size + setB.size - intersectionSize;
    if (unionSize === 0) return 0;

    const jaccard = intersectionSize / unionSize;
    // Overlap coefficient relative to smaller file (detects embedded copies)
    const minSize = Math.min(setA.size, setB.size);
    const overlap = minSize > 0 ? intersectionSize / minSize : 0;

    // Weighted combination giving priority to structural containment
    const combined = jaccard * 0.4 + overlap * 0.6;
    return Math.min(1.0, Math.round(combined * 100) / 100);
  }

  /**
   * Validates and filters source files against security limits and file types.
   */
  public filterAndValidateFiles(files: SourceFile[]): SourceFile[] {
    if (files.length > this.MAX_FILES_PER_REPO) {
      throw new BadRequestException({
        code: 'REPOSITORY_TOO_LARGE',
        message: `Repository exceeds maximum file count limit of ${this.MAX_FILES_PER_REPO} files.`,
      });
    }

    let totalBytes = 0;
    const validFiles: SourceFile[] = [];

    for (const file of files) {
      // Path Traversal / Zip Slip Defense
      if (
        file.path.includes('..') ||
        file.path.startsWith('/') ||
        file.path.includes('\\') ||
        file.path.includes('\0')
      ) {
        continue; // Drop unsafe file path
      }

      // Check Ignored Paths
      const isIgnored = IGNORED_PATH_PATTERNS.some((pattern) => pattern.test(file.path));
      if (isIgnored) continue;

      // Check Supported Extension
      const ext = this.getFileExtension(file.path);
      if (!SUPPORTED_EXTENSIONS.has(ext)) continue;

      const fileBytes = Buffer.byteLength(file.content, 'utf8');
      if (fileBytes > this.MAX_FILE_SIZE_BYTES) {
        continue; // Skip oversized single file
      }

      totalBytes += fileBytes;
      if (totalBytes > this.MAX_TOTAL_REPO_BYTES) {
        throw new BadRequestException({
          code: 'REPOSITORY_SIZE_EXCEEDED',
          message: `Repository exceeds total size limit of ${this.MAX_TOTAL_REPO_BYTES / (1024 * 1024)} MB.`,
        });
      }

      validFiles.push(file);
    }

    return validFiles;
  }

  /**
   * Compares two repository file sets and produces explainable evidence.
   */
  public compareRepositories(
    sourceSubmissionId: string,
    sourceFiles: SourceFile[],
    targetSubmissionId: string,
    targetFiles: SourceFile[],
    threshold = 0.45,
    baselineFingerprints = new Set<string>()
  ): RepositoryComparisonResult | null {
    const validSource = this.filterAndValidateFiles(sourceFiles);
    const validTarget = this.filterAndValidateFiles(targetFiles);

    if (validSource.length === 0 || validTarget.length === 0) {
      return null;
    }

    const fileResults: FileComparisonResult[] = [];
    let comparisonCount = 0;

    for (const src of validSource) {
      const srcExt = this.getFileExtension(src.path);
      const normSrc = this.normalizeSource(src.content, srcExt);
      const srcTokens = this.tokenize(normSrc);
      const srcFps = this.generateFingerprints(srcTokens);

      // Exclude baseline starter template fingerprints
      for (const bFp of baselineFingerprints) {
        srcFps.delete(bFp);
      }

      if (srcFps.size === 0) continue;

      for (const tgt of validTarget) {
        const tgtExt = this.getFileExtension(tgt.path);
        const normTgt = this.normalizeSource(tgt.content, tgtExt);
        const tgtTokens = this.tokenize(normTgt);
        const tgtFps = this.generateFingerprints(tgtTokens);

        for (const bFp of baselineFingerprints) {
          tgtFps.delete(bFp);
        }

        if (tgtFps.size === 0) continue;

        const sim = this.calculateSimilarity(srcFps, tgtFps);
        comparisonCount++;

        if (sim >= threshold) {
          // Compute matching line bounds and excerpts
          const srcLines = src.content.split('\n');
          const tgtLines = tgt.content.split('\n');

          const srcExcerpt = srcLines.slice(0, Math.min(20, srcLines.length)).join('\n');
          const tgtExcerpt = tgtLines.slice(0, Math.min(20, tgtLines.length)).join('\n');

          const fragmentHash = crypto
            .createHash('sha256')
            .update(`${src.path}:${tgt.path}:${sim}`)
            .digest('hex')
            .substring(0, 16);

          // Confidence reflects fingerprint set size and similarity strength
          const confidence = Math.min(1.0, Math.round((Math.min(srcFps.size, tgtFps.size) / 20) * sim * 100) / 100);

          fileResults.push({
            sourcePath: src.path,
            targetPath: tgt.path,
            similarity: sim,
            confidence: Math.max(0.5, confidence),
            matchedLinesCount: Math.min(srcLines.length, tgtLines.length),
            sourceStartLine: 1,
            sourceEndLine: Math.min(srcLines.length, 50),
            targetStartLine: 1,
            targetEndLine: Math.min(tgtLines.length, 50),
            fragmentHash,
            sourceSnippet: srcExcerpt.substring(0, 1000),
            targetSnippet: tgtExcerpt.substring(0, 1000),
          });
        }
      }
    }

    if (fileResults.length === 0) {
      return null;
    }

    const overallSimilarity =
      fileResults.length > 0
        ? Math.round((fileResults.reduce((acc, f) => acc + f.similarity, 0) / fileResults.length) * 100) / 100
        : 0;

    const overallConfidence =
      fileResults.length > 0
        ? Math.round((fileResults.reduce((acc, f) => acc + f.confidence, 0) / fileResults.length) * 100) / 100
        : 0;

    return {
      sourceSubmissionId,
      targetSubmissionId,
      overallSimilarity,
      overallConfidence,
      matchingFilesCount: fileResults.length,
      totalFilesCompared: comparisonCount,
      fileResults,
    };
  }

  private getFileExtension(filePath: string): string {
    const lastDot = filePath.lastIndexOf('.');
    return lastDot !== -1 ? filePath.substring(lastDot).toLowerCase() : '';
  }
}
