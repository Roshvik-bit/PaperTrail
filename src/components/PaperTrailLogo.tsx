import React from 'react';
import Image from 'next/image';

interface PaperTrailLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const PaperTrailLogo: React.FC<PaperTrailLogoProps> = ({ 
  className = '', 
  size = 32,
  showText = true 
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon: Scholarly open book emblem */}
      <div 
        className="relative flex items-center justify-center rounded-lg bg-[#FDFCF9] border border-[#E3E1D9] p-1 shadow-[0_1px_3px_rgba(37,38,34,0.04)] overflow-hidden flex-shrink-0"
        style={{ width: size + 8, height: size + 8 }}
      >
        <img 
          src="/logo.png" 
          alt="PaperTrail Logo" 
          className="w-full h-full object-contain mix-blend-multiply"
          style={{ width: size, height: size }}
        />
      </div>

      {showText && (
        <div className="flex items-baseline gap-1.5">
          <span className="font-serif text-2xl tracking-normal text-[#252622] font-normal">
            Paper<span className="italic text-[#B96645]">Trail</span>
          </span>
          <span className="text-[10px] font-mono tracking-wider uppercase text-[#777873] border-l border-[#E3E1D9] pl-2 ml-0.5">
            Research Intel
          </span>
        </div>
      )}
    </div>
  );
};

