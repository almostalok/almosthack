import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@almosthack/utils';

export type MascotVariant =
  | 'default'
  | 'waving'
  | 'working'
  | 'confused'
  | 'judging'
  | 'running'
  | 'celebrating'
  | 'sleeping';

export interface MascotRobotProps {
  className?: string;
  speechText?: string;
  showBubble?: boolean;
  variant?: MascotVariant;
}

export const MascotRobot: React.FC<MascotRobotProps> = ({
  className,
  speechText = 'Spreadsheets called.\nThey quit.',
  showBubble = true,
  variant = 'default',
}) => {
  // Variant-specific screen visuals
  const renderEyes = () => {
    switch (variant) {
      case 'celebrating':
        // Happy arch eyes ^^
        return (
          <>
            <path d="M29 34C29 31 34 31 34 34" stroke="#03A066" strokeWidth="2" strokeLinecap="round" />
            <path d="M45 34C45 31 50 31 50 34" stroke="#03A066" strokeWidth="2" strokeLinecap="round" />
            <path d="M37 38H43" stroke="#03A066" strokeWidth="1.5" strokeLinecap="round" />
          </>
        );
      case 'judging':
        // Analytical focus visor + monocle grid
        return (
          <>
            <rect x="28" y="28" width="8" height="8" rx="1" fill="#03A066" />
            <rect x="29" y="29" width="3" height="3" fill="#FFFFFF" />
            <rect x="44" y="28" width="8" height="8" rx="1" fill="#03A066" />
            <circle cx="48" cy="32" r="2" fill="#5EEAD4" />
            <path d="M36 39H44" stroke="#03A066" strokeWidth="1.5" strokeLinecap="round" />
          </>
        );
      case 'sleeping':
        // Sleepy zzz eyes
        return (
          <>
            <path d="M28 32H34" stroke="#03A066" strokeWidth="2" strokeLinecap="round" />
            <path d="M44 32H50" stroke="#03A066" strokeWidth="2" strokeLinecap="round" />
            <text x="54" y="25" fill="#03A066" fontSize="8" fontFamily="monospace" fontWeight="bold">z</text>
          </>
        );
      case 'confused':
        // Asymmetric eyes ?_?
        return (
          <>
            <circle cx="31" cy="32" r="3" fill="#03A066" />
            <rect x="45" y="30" width="6" height="3" rx="1" fill="#03A066" />
            <path d="M36 38C38 36 42 40 44 38" stroke="#03A066" strokeWidth="1.5" strokeLinecap="round" />
          </>
        );
      case 'working':
      case 'waving':
      case 'default':
      default:
        // Classic pixel eyes
        return (
          <>
            <rect x="29" y="29" width="6" height="6" rx="1" fill="#03A066" />
            <rect x="30" y="30" width="2" height="2" fill="#FFFFFF" />
            <rect x="45" y="29" width="6" height="6" rx="1" fill="#03A066" />
            <rect x="46" y="30" width="2" height="2" fill="#FFFFFF" />
            <path d="M36 38H44" stroke="#03A066" strokeWidth="1.5" strokeLinecap="round" />
          </>
        );
    }
  };

  return (
    <div className={cn('relative inline-flex items-center select-none', className)}>
      {/* Speech Bubble */}
      {showBubble && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3, ease: 'easeOut' }}
          className="absolute -top-16 -left-8 sm:-top-14 sm:-left-20 z-20 whitespace-pre-line bg-[#1A1C1A] text-[#EDEDED] border border-[#282C28] px-3 py-1.5 rounded-[10px] shadow-lg text-[11px] font-mono leading-tight text-left"
        >
          <div className="text-[#03A066] font-semibold text-[10px] uppercase tracking-wider mb-0.5">
            [bot-01]
          </div>
          {speechText}
          {/* Tail */}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-[#1A1C1A] border-b border-r border-[#282C28] rotate-45" />
        </motion.div>
      )}

      {/* Mascot SVG Character */}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
        className="w-16 h-16 sm:w-20 sm:h-20"
      >
        <svg
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter drop-shadow-[0_4px_12px_rgba(2,128,81,0.25)]"
        >
          {/* Antenna */}
          <line x1="40" y1="8" x2="40" y2="18" stroke="#028051" strokeWidth="3" strokeLinecap="round" />
          <circle cx="40" cy="7" r="4" fill="#03A066" className="animate-pulse" />
          <circle cx="40" cy="7" r="2" fill="#FFFFFF" />

          {/* Ears / Side bolts */}
          <rect x="14" y="28" width="4" height="8" rx="1.5" fill="#282C28" stroke="#028051" strokeWidth="1.5" />
          <rect x="62" y="28" width="4" height="8" rx="1.5" fill="#282C28" stroke="#028051" strokeWidth="1.5" />

          {/* Head Body */}
          <rect
            x="18"
            y="18"
            width="44"
            height="32"
            rx="8"
            fill="#161816"
            stroke="#028051"
            strokeWidth="2.5"
          />

          {/* Pixel Visor Screen */}
          <rect
            x="24"
            y="24"
            width="32"
            height="18"
            rx="4"
            fill="#0A1F14"
            stroke="#03A066"
            strokeWidth="1.5"
          />

          {/* Visor Scanlines */}
          <line x1="25" y1="28" x2="55" y2="28" stroke="#028051" strokeWidth="0.5" strokeOpacity="0.4" />
          <line x1="25" y1="33" x2="55" y2="33" stroke="#028051" strokeWidth="0.5" strokeOpacity="0.4" />
          <line x1="25" y1="38" x2="55" y2="38" stroke="#028051" strokeWidth="0.5" strokeOpacity="0.4" />

          {/* Pixel Expressions */}
          {renderEyes()}

          {/* Neck */}
          <rect x="35" y="50" width="10" height="4" rx="1" fill="#282C28" />

          {/* Torso / Shoulders */}
          <path
            d="M24 54C24 52.8954 24.8954 52 26 52H54C55.1046 52 56 52.8954 56 54V66C56 68.2091 54.2091 70 52 70H28C25.7909 70 24 68.2091 24 66V54Z"
            fill="#161816"
            stroke="#028051"
            strokeWidth="2"
          />

          {/* Torso Core Light */}
          <rect x="36" y="58" width="8" height="6" rx="2" fill="#0A1F14" stroke="#03A066" strokeWidth="1" />
          <circle cx="40" cy="61" r="1.5" fill="#03A066" />
        </svg>
      </motion.div>
    </div>
  );
};
