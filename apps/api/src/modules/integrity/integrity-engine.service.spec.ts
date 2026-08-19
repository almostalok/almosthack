import { IntegrityEngineService, SourceFile } from './integrity-engine.service';
import { BadRequestException } from '@nestjs/common';

describe('IntegrityEngineService', () => {
  let service: IntegrityEngineService;

  beforeEach(() => {
    service = new IntegrityEngineService();
  });

  describe('Normalization', () => {
    it('should strip C-style single and multi-line comments and collapse whitespace', () => {
      const code = `
        // Initial comment
        function calculateTotal(items: number[]): number {
          /* Multi-line
             comment */
          let sum = 0;
          for (const item of items) {
            sum += item; // Add item
          }
          return sum;
        }
      `;

      const normalized = service.normalizeSource(code, '.ts');
      expect(normalized).not.toContain('// Initial comment');
      expect(normalized).not.toContain('Multi-line');
      expect(normalized).not.toContain('Add item');
      expect(normalized).toContain('function calculateTotal(items: number[]): number {');
      expect(normalized).toContain('let sum = 0;');
    });

    it('should strip Python comments and docstrings', () => {
      const pyCode = `
        # Main computation module
        def calculate_average(values):
            """Calculate the arithmetic mean
            of given numeric values."""
            total = sum(values)
            return total / len(values) # return mean
      `;

      const normalized = service.normalizeSource(pyCode, '.py');
      expect(normalized).not.toContain('Main computation module');
      expect(normalized).not.toContain('arithmetic mean');
      expect(normalized).not.toContain('return mean');
      expect(normalized).toContain('def calculate_average(values):');
    });
  });

  describe('Tokenization & Fingerprinting Determinism', () => {
    it('should produce identical fingerprints for identical normalized input', () => {
      const code = `function test() { return 42; }`;
      const tokens = service.tokenize(code);
      const fp1 = service.generateFingerprints(tokens, 3);
      const fp2 = service.generateFingerprints(tokens, 3);

      expect(fp1.size).toBeGreaterThan(0);
      expect(Array.from(fp1)).toEqual(Array.from(fp2));
    });
  });

  describe('Similarity Calculation', () => {
    it('should return 1.0 for identical fingerprint sets', () => {
      const setA = new Set(['hash1', 'hash2', 'hash3', 'hash4']);
      const setB = new Set(['hash1', 'hash2', 'hash3', 'hash4']);
      const sim = service.calculateSimilarity(setA, setB);
      expect(sim).toBe(1.0);
    });

    it('should return 0.0 for disjoint fingerprint sets', () => {
      const setA = new Set(['hash1', 'hash2']);
      const setB = new Set(['hash3', 'hash4']);
      const sim = service.calculateSimilarity(setA, setB);
      expect(sim).toBe(0.0);
    });
  });

  describe('Hostile Input & Resource Limits', () => {
    it('should reject zip-slip and path traversal file paths', () => {
      const files: SourceFile[] = [
        { path: '../../etc/passwd', content: 'root:x:0:0' },
        { path: 'src/../../../evil.ts', content: 'console.log(1);' },
        { path: 'src/main.ts', content: 'export const valid = true;' },
      ];

      const validFiles = service.filterAndValidateFiles(files);
      expect(validFiles.length).toBe(1);
      expect(validFiles[0].path).toBe('src/main.ts');
    });

    it('should throw BadRequestException if repository exceeds max file count', () => {
      const files: SourceFile[] = [];
      for (let i = 0; i <= 505; i++) {
        files.push({ path: `src/file_${i}.ts`, content: 'export const x = 1;' });
      }

      expect(() => service.filterAndValidateFiles(files)).toThrow(BadRequestException);
    });
  });

  describe('Controlled Similarity vs Unrelated Comparison', () => {
    it('should detect high similarity for identical and renamed code fragments', () => {
      const sourceFiles: SourceFile[] = [
        {
          path: 'src/algorithm.ts',
          content: `
            export class MatrixSolver {
              solve(matrix: number[][], vector: number[]): number[] {
                const n = matrix.length;
                const result = new Array(n).fill(0);
                for (let i = 0; i < n; i++) {
                  let sum = 0;
                  for (let j = 0; j < n; j++) {
                    sum += matrix[i][j] * vector[j];
                  }
                  result[i] = sum;
                }
                return result;
              }
            }
          `,
        },
      ];

      const targetFiles: SourceFile[] = [
        {
          path: 'src/solver.ts',
          content: `
            // Slightly modified comments
            export class MatrixSolver {
              solve(matrix: number[][], vector: number[]): number[] {
                const n = matrix.length;
                const result = new Array(n).fill(0);
                for (let i = 0; i < n; i++) {
                  let sum = 0;
                  for (let j = 0; j < n; j++) {
                    sum += matrix[i][j] * vector[j];
                  }
                  result[i] = sum;
                }
                return result;
              }
            }
          `,
        },
      ];

      const result = service.compareRepositories('sub1', sourceFiles, 'sub2', targetFiles, 0.45);
      expect(result).not.toBeNull();
      expect(result!.overallSimilarity).toBeGreaterThanOrEqual(0.85);
      expect(result!.fileResults.length).toBe(1);
    });

    it('should return null or low similarity for completely unrelated code', () => {
      const sourceFiles: SourceFile[] = [
        {
          path: 'src/math.ts',
          content: 'export function add(a: number, b: number): number { return a + b; }',
        },
      ];

      const targetFiles: SourceFile[] = [
        {
          path: 'src/database.ts',
          content: 'export class DatabaseClient { connect(uri: string): void { console.log(uri); } }',
        },
      ];

      const result = service.compareRepositories('sub1', sourceFiles, 'sub2', targetFiles, 0.45);
      expect(result).toBeNull();
    });
  });

  describe('Baseline Exclusion', () => {
    it('should exclude starter template boilerplate fingerprints from triggering similarity', () => {
      const boilerplateCode = `
        import express from 'express';
        const app = express();
        app.use(express.json());
        export default app;
      `;

      const norm = service.normalizeSource(boilerplateCode, '.ts');
      const tokens = service.tokenize(norm);
      const baselineFps = service.generateFingerprints(tokens);

      const sourceFiles: SourceFile[] = [{ path: 'src/app.ts', content: boilerplateCode }];
      const targetFiles: SourceFile[] = [{ path: 'src/server.ts', content: boilerplateCode }];

      const result = service.compareRepositories(
        'sub1',
        sourceFiles,
        'sub2',
        targetFiles,
        0.45,
        baselineFps
      );

      expect(result).toBeNull();
    });
  });
});
