'use client';

export default function SantaHat({ width = 48, height = 44, className = '', style = {} }) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 100 80" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))', ...style }}
      aria-hidden="true"
    >
      {/* Red Velvet Hat Cone with Bend */}
      <path 
        d="M20 62 C 28 35, 52 10, 82 22 C 92 26, 96 38, 88 44 C 80 49, 70 38, 64 28 C 45 32, 30 45, 20 62 Z" 
        fill="url(#velvetGradient)" 
      />
      
      {/* Pom-Pom on the bent tip */}
      <circle cx="89" cy="46" r="10" fill="url(#furGradient)" filter="url(#furShadow)" />
      <circle cx="89" cy="46" r="9" fill="#FFFFFF" />

      {/* Fluffy White Trim at Base */}
      <path 
        d="M12 60 C 14 55, 22 55, 25 59 C 29 55, 37 55, 41 59 C 45 55, 53 55, 57 59 C 61 55, 69 55, 73 59 C 76 56, 84 56, 86 61 C 88 67, 83 72, 78 70 C 74 74, 65 74, 62 70 C 58 74, 49 74, 46 70 C 42 74, 33 74, 30 70 C 26 73, 17 73, 14 68 C 11 65, 11 62, 12 60 Z" 
        fill="url(#furGradient)" 
      />
      <path 
        d="M14 62 C 16 58, 22 58, 25 61 C 29 58, 35 58, 39 61 C 43 58, 49 58, 53 61 C 57 58, 63 58, 67 61 C 71 58, 77 58, 80 62 C 82 66, 78 70, 74 68 C 70 71, 64 71, 61 68 C 57 71, 51 71, 48 68 C 44 71, 38 71, 35 68 C 31 71, 24 71, 21 67 C 18 65, 17 63, 14 62 Z" 
        fill="#FFFFFF" 
      />

      {/* Gradients */}
      <defs>
        <linearGradient id="velvetGradient" x1="20" y1="62" x2="88" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#991b1b" />
          <stop offset="0.3" stopColor="#dc2626" />
          <stop offset="0.7" stopColor="#ef4444" />
          <stop offset="1" stopColor="#b91c1c" />
        </linearGradient>
        <radialGradient id="furGradient" cx="50%" cy="50%" r="50%">
          <stop stopColor="#FFFFFF" />
          <stop offset="0.85" stopColor="#f1f5f9" />
          <stop offset="1" stopColor="#cbd5e1" />
        </radialGradient>
      </defs>
    </svg>
  );
}
