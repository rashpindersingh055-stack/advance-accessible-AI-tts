import React from 'react';

export default function BrandLogo({ size = 'md', showTag = true, className = '' }) {
  const sizeMap = {
    sm: { icon: 'w-8 h-8 rounded-xl', font: 'text-base', tag: 'text-[9px] px-1.5 py-0.2' },
    md: { icon: 'w-10 h-10 rounded-2xl', font: 'text-lg', tag: 'text-[10px] px-2 py-0.5' },
    lg: { icon: 'w-14 h-14 rounded-3xl', font: 'text-2xl', tag: 'text-xs px-2.5 py-1' },
    xl: { icon: 'w-20 h-20 rounded-3xl', font: 'text-3xl', tag: 'text-sm px-3 py-1.5' },
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Glowing Neural Wave Icon Box */}
      <div className={`${current.icon} bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/30 flex items-center justify-center shrink-0`}>
        <div className="w-full h-full bg-[#030712] rounded-[inherit] flex items-center justify-center overflow-hidden p-1.5">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-indigo-400">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="50%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            {/* Equalizer Bars */}
            <rect x="15" y="35" width="8" height="30" rx="4" fill="url(#logoGrad)" opacity="0.85" />
            <rect x="28" y="22" width="8" height="56" rx="4" fill="url(#logoGrad)" opacity="0.9" />
            
            {/* Mic Center */}
            <rect x="42" y="15" width="16" height="40" rx="8" fill="url(#logoGrad)" />
            <path d="M36 42 C 36 60, 64 60, 64 42" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
            <line x1="50" y1="58" x2="50" y2="76" stroke="white" strokeWidth="4" strokeLinecap="round" />
            <line x1="38" y1="76" x2="62" y2="76" stroke="white" strokeWidth="4" strokeLinecap="round" />

            <rect x="64" y="22" width="8" height="56" rx="4" fill="url(#logoGrad)" opacity="0.9" />
            <rect x="77" y="35" width="8" height="30" rx="4" fill="url(#logoGrad)" opacity="0.85" />
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      <div>
        <div className="flex items-center gap-2">
          <span className={`font-black tracking-tight text-white ${current.font}`}>
            VISION MAX
          </span>
          {showTag && (
            <span className={`${current.tag} rounded-full font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 uppercase tracking-widest`}>
              Neural 2.0
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
          Ultra-Natural Synthetic Voice Engine
        </p>
      </div>
    </div>
  );
}
