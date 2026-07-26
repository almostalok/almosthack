import React, { useState } from 'react';
import { cn } from '@almosthack/utils';
import { Check, Copy } from 'lucide-react';

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = true,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split('\n');

  return (
    <div className={cn('w-full border border-zinc-800 bg-zinc-950 rounded-lg overflow-hidden font-code text-xs', className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/80 bg-zinc-900/60">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          {filename && <span className="text-zinc-400 font-mono text-[11px]">{filename}</span>}
          {language && <span className="text-zinc-600 font-mono text-[10px] uppercase">{language}</span>}
        </div>
        <button
          onClick={handleCopy}
          className="text-zinc-400 hover:text-zinc-100 flex items-center gap-1 transition-colors text-[11px] font-mono"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="p-4 overflow-x-auto">
        <pre className="text-zinc-200">
          <code>
            {lines.map((line, idx) => (
              <div key={idx} className="table-row">
                {showLineNumbers && (
                  <span className="table-cell pr-4 text-right text-zinc-600 select-none font-mono text-[11px]">
                    {idx + 1}
                  </span>
                )}
                <span className="table-cell">{line || ' '}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};
