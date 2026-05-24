/* SVG-generated cinematic project covers, themed silver/gold (no blue dominance) */

type Props = { kind: string };

export function ProjectVisual({ kind }: Props) {
  switch (kind) {
    case "tower": return <Tower />;
    case "pavilion": return <Pavilion />;
    case "industrial": return <Industrial />;
    case "hospitality": return <Hospitality />;
    case "bridge": return <Bridge />;
    case "atrium": return <Atrium />;
    default: return <Tower />;
  }
}

function Defs() {
  return (
    <defs>
      <linearGradient id="pv-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ECEFF3" />
        <stop offset="60%" stopColor="#DDE1E7" />
        <stop offset="100%" stopColor="#A8AEB8" />
      </linearGradient>
      <linearGradient id="pv-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F8F8F6" />
        <stop offset="100%" stopColor="#6B7280" />
      </linearGradient>
      <linearGradient id="pv-dark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3A3D42" />
        <stop offset="100%" stopColor="#111827" />
      </linearGradient>
      <linearGradient id="pv-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#B8912F" />
        <stop offset="50%" stopColor="#F2DD9C" />
        <stop offset="100%" stopColor="#B8912F" />
      </linearGradient>
      <radialGradient id="pv-sun" cx="0.8" cy="0.2" r="0.4">
        <stop offset="0%" stopColor="#F2DD9C" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#F2DD9C" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

function Tower() {
  return (
    <svg viewBox="0 0 600 400" className="w-full h-full">
      <Defs />
      <rect width="600" height="400" fill="url(#pv-sky)" />
      <circle cx="500" cy="80" r="120" fill="url(#pv-sun)" />
      {/* skyline back */}
      <g opacity="0.7">
        <rect x="20" y="220" width="60" height="180" fill="#A8AEB8" />
        <rect x="100" y="190" width="40" height="210" fill="#8E97A3" />
        <rect x="500" y="240" width="80" height="160" fill="#A8AEB8" />
      </g>
      {/* main tower */}
      <polygon points="220,400 220,80 290,60 290,400" fill="url(#pv-glass)" />
      <polygon points="290,400 290,60 360,80 360,400" fill="url(#pv-dark)" />
      {/* gold spire */}
      <polygon points="252,80 256,20 260,80" fill="url(#pv-gold)" />
      {/* windows grid */}
      {Array.from({ length: 22 }).map((_, r) =>
        Array.from({ length: 4 }).map((_, c) => (
          <rect key={`${r}-${c}`}
            x={228 + c * 16} y={100 + r * 13}
            width="10" height="7"
            fill="#ECEFF3" opacity={0.45 + ((r * c) % 3) * 0.18}
          />
        ))
      )}
      {/* gold band */}
      <rect x="220" y="240" width="140" height="3" fill="url(#pv-gold)" />
      <rect x="220" y="320" width="140" height="3" fill="url(#pv-gold)" opacity="0.6" />
      {/* foreground ground */}
      <rect x="0" y="380" width="600" height="20" fill="#3A3D42" />
    </svg>
  );
}

function Pavilion() {
  return (
    <svg viewBox="0 0 600 400" className="w-full h-full">
      <Defs />
      <rect width="600" height="400" fill="url(#pv-sky)" />
      <circle cx="100" cy="90" r="120" fill="url(#pv-sun)" />
      {/* curved pavilion */}
      <path d="M60,320 Q300,140 540,320 Z" fill="url(#pv-glass)" stroke="#6B7280" />
      <path d="M60,320 Q300,140 540,320" fill="none" stroke="url(#pv-gold)" strokeWidth="2" />
      {/* ribs */}
      {Array.from({ length: 9 }).map((_, i) => {
        const t = (i + 1) / 10;
        const x = 60 + t * 480;
        const y = 320 - Math.sin(t * Math.PI) * 180;
        return <line key={i} x1={x} y1="320" x2={x} y2={y} stroke="#3A3D42" opacity="0.55" />;
      })}
      <ellipse cx="300" cy="320" rx="240" ry="8" fill="#1F2328" opacity="0.3" />
      {/* gold pillar */}
      <rect x="296" y="180" width="8" height="140" fill="url(#pv-gold)" />
      <rect x="0" y="320" width="600" height="80" fill="#3A3D42" />
    </svg>
  );
}

function Industrial() {
  return (
    <svg viewBox="0 0 600 400" className="w-full h-full">
      <Defs />
      <rect width="600" height="400" fill="url(#pv-sky)" />
      {/* warehouse blocks */}
      <polygon points="40,260 240,210 240,360 40,360" fill="url(#pv-glass)" />
      <polygon points="240,210 240,360 320,360 320,225" fill="url(#pv-dark)" />
      <polygon points="40,260 240,210 320,225 120,275" fill="#A8AEB8" />
      {/* second */}
      <polygon points="320,260 540,230 540,360 320,360" fill="url(#pv-glass)" opacity="0.95" />
      <polygon points="320,260 540,230 560,238 340,268" fill="#8E97A3" />
      {/* chimneys */}
      <rect x="180" y="160" width="14" height="100" fill="#3A3D42" />
      <rect x="178" y="158" width="18" height="6" fill="url(#pv-gold)" />
      <rect x="420" y="180" width="14" height="80" fill="#3A3D42" />
      <rect x="418" y="178" width="18" height="6" fill="url(#pv-gold)" />
      {/* doors */}
      <rect x="80" y="290" width="40" height="70" fill="#1F2328" />
      <rect x="380" y="300" width="50" height="60" fill="#1F2328" />
      {/* gold rail */}
      <line x1="0" y1="370" x2="600" y2="370" stroke="url(#pv-gold)" strokeWidth="1.5" />
      <rect x="0" y="372" width="600" height="28" fill="#3A3D42" />
    </svg>
  );
}

function Hospitality() {
  return (
    <svg viewBox="0 0 600 400" className="w-full h-full">
      <Defs />
      <rect width="600" height="400" fill="url(#pv-sky)" />
      <circle cx="480" cy="100" r="140" fill="url(#pv-sun)" />
      {/* boutique facade */}
      <rect x="80" y="120" width="440" height="240" fill="url(#pv-glass)" />
      <rect x="80" y="120" width="440" height="6" fill="url(#pv-gold)" />
      <rect x="80" y="354" width="440" height="6" fill="url(#pv-gold)" />
      {/* arches */}
      {[0,1,2,3,4].map(i => (
        <g key={i}>
          <path d={`M${110 + i*80},340 Q${150 + i*80},250 ${190 + i*80},340 Z`} fill="#1F2328" opacity="0.85" />
          <path d={`M${110 + i*80},340 Q${150 + i*80},250 ${190 + i*80},340`} fill="none" stroke="url(#pv-gold)" />
        </g>
      ))}
      {/* upper windows */}
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x={100 + i*70} y={150} width="50" height="60" fill="#3A3D42" opacity="0.85" />
      ))}
      {/* lamps */}
      <circle cx="100" cy="240" r="4" fill="url(#pv-gold)" />
      <circle cx="500" cy="240" r="4" fill="url(#pv-gold)" />
      <rect x="0" y="358" width="600" height="42" fill="#2B2D31" />
    </svg>
  );
}

function Bridge() {
  return (
    <svg viewBox="0 0 600 400" className="w-full h-full">
      <Defs />
      <rect width="600" height="400" fill="url(#pv-sky)" />
      {/* water */}
      <rect x="0" y="280" width="600" height="120" fill="#6B7280" opacity="0.6" />
      <rect x="0" y="280" width="600" height="3" fill="url(#pv-gold)" opacity="0.7" />
      {/* deck */}
      <rect x="0" y="240" width="600" height="14" fill="url(#pv-dark)" />
      {/* pylons */}
      <polygon points="190,240 200,80 210,240" fill="#3A3D42" />
      <polygon points="390,240 400,80 410,240" fill="#3A3D42" />
      <circle cx="200" cy="80" r="6" fill="url(#pv-gold)" />
      <circle cx="400" cy="80" r="6" fill="url(#pv-gold)" />
      {/* cables */}
      {Array.from({ length: 12 }).map((_, i) => {
        const x = 60 + i * 16;
        return <line key={"l"+i} x1={x} y1="240" x2="200" y2="86" stroke="#C8A24A" strokeOpacity="0.5" />;
      })}
      {Array.from({ length: 12 }).map((_, i) => {
        const x = 350 + i * 16;
        return <line key={"r"+i} x1={x} y1="240" x2="400" y2="86" stroke="#C8A24A" strokeOpacity="0.5" />;
      })}
      {/* reflection */}
      <rect x="195" y="280" width="10" height="60" fill="#3A3D42" opacity="0.4" />
      <rect x="395" y="280" width="10" height="60" fill="#3A3D42" opacity="0.4" />
    </svg>
  );
}

function Atrium() {
  return (
    <svg viewBox="0 0 600 400" className="w-full h-full">
      <Defs />
      <rect width="600" height="400" fill="url(#pv-sky)" />
      {/* big atrium box */}
      <polygon points="100,360 420,360 480,320 160,320" fill="url(#pv-dark)" />
      <polygon points="100,360 100,140 160,100 160,320" fill="url(#pv-glass)" />
      <polygon points="160,100 480,80 480,320 160,320" fill="url(#pv-glass)" opacity="0.85" />
      <polygon points="160,100 480,80 540,120 220,140" fill="#A8AEB8" />
      <polygon points="480,80 540,120 540,320 480,320" fill="url(#pv-dark)" />
      {/* mullions / grid */}
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={"v"+i} x1={160 + i*46} y1={100 + i*-3} x2={160 + i*46} y2="320" stroke="#6B7280" opacity="0.7" />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={"h"+i} x1="160" y1={120 + i*36} x2="480" y2={100 + i*36} stroke="#6B7280" opacity="0.5" />
      ))}
      {/* gold cap */}
      <rect x="160" y="76" width="320" height="6" fill="url(#pv-gold)" />
      <rect x="0" y="358" width="600" height="42" fill="#2B2D31" />
    </svg>
  );
}
