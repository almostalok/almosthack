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
    <div className={cn('w-full border border-[#DCDDD3] bg-[#FFFDF8] rounded-[12px] overflow-hidden font-mono text-xs shadow-xs text-left', className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#DCDDD3] bg-[#F7F4EA]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#DCDDD3]" />
          {filename && <span className="text-[#171914] font-semibold text-[11px]">{filename}</span>}
          {language && <span className="text-[#6D7068] text-[10px] uppercase font-mono">{language}</span>}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="text-[#6D7068] hover:text-[#171914] flex items-center gap-1 transition-colors text-[11px] font-mono p-1 rounded hover:bg-[#FFFDF8]"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#355C45]" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="p-4 overflow-x-auto bg-[#FFFDF8]">
        <pre className="text-[#171914] font-mono leading-relaxed">
          <code>
            {lines.map((line, idx) => (
              <div key={idx} className="table-row">
                {showLineNumbers && (
                  <span className="table-cell pr-4 text-right text-[#9A9C94] select-none text-[11px]">
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
