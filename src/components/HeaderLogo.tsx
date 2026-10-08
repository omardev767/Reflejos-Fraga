import React from 'react';

export default function HeaderLogo() {
  return (
    <div className="flex items-center justify-center py-2 px-4">
      <svg
        className="max-w-[700px] w-full h-auto drop-shadow-sm select-none"
        viewBox="0 0 800 240"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="rfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="marcoGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="glassGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#c7d2fe" />
          </linearGradient>
        </defs>

        {/* Mirror Frame Outer */}
        <rect x="50" y="25" width="190" height="190" rx="95" fill="url(#marcoGrad3)" />
        {/* Mirror Glass Inner */}
        <rect x="65" y="40" width="160" height="160" rx="80" fill="url(#glassGrad3)" />
        {/* Mirror Light Reflection */}
        <path
          d="M 88 64 Q 116 68 126 102 Q 102 136 89 166 Q 81 112 88 64 Z"
          fill="#ffffff"
          opacity="0.65"
        />
        {/* RF Monogram */}
        <text
          x="145"
          y="158"
          textAnchor="middle"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="86"
          fontWeight="900"
          fill="url(#rfGrad)"
        >
          RF
        </text>

        {/* Text REFLEJOS */}
        <text
          x="280"
          y="110"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="58"
          fontWeight="900"
          className="fill-slate-900 dark:fill-slate-100 transition-colors"
          letterSpacing="3"
        >
          REFLEJOS
        </text>

        {/* Text FRAGA */}
        <text
          x="280"
          y="178"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="58"
          fontWeight="900"
          fill="url(#rfGrad)"
          letterSpacing="12"
        >
          FRAGA
        </text>

        {/* Subtitle */}
        <text
          x="284"
          y="208"
          fontFamily="'Inter', sans-serif"
          fontSize="13"
          fontWeight="700"
          className="fill-slate-500 dark:fill-slate-400"
          letterSpacing="6"
        >
          ESPEJOS DE CALIDAD
        </text>
      </svg>
    </div>
  );
}
