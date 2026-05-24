

export function Particles({ count = 24 }: { count?: number }) {
  const items = Array.from({ length: count }).map((_, i) => {
    const left = Math.random() * 100;
    const top = 50 + Math.random() * 50;
    const delay = Math.random() * 7;
    const size = 2 + Math.random() * 4;
    const opacity = 0.3 + Math.random() * 0.6;
    return (
      <span
        key={i}
        style={{
          left: `${left}%`,
          top: `${top}%`,
          width: size,
          height: size,
          opacity,
          animationDelay: `${delay}s`,
        }}
      />
    );
  });
  return <div className="particles absolute inset-0 pointer-events-none">{items}</div>;
}

export function GoldOrb({ className = "" }: { className?: string }) {
  return (
    <div
      className={"pointer-events-none absolute rounded-full blur-3xl " + className}
      style={{
        background:
          "radial-gradient(circle, rgba(214,184,90,0.55) 0%, rgba(200,162,74,0.18) 35%, rgba(200,162,74,0) 70%)",
      }}
    />
  );
}

export function CoolOrb({ className = "" }: { className?: string }) {
  return (
    <div
      className={"pointer-events-none absolute rounded-full blur-3xl " + className}
      style={{
        background:
          "radial-gradient(circle, rgba(191,199,213,0.55) 0%, rgba(191,199,213,0.15) 40%, rgba(191,199,213,0) 70%)",
      }}
    />
  );
}

/* Abstract 3D-style construction object — pure SVG */
export function HeroSculpture() {
  return (
    <svg viewBox="0 0 600 600" className="w-full h-full">
      <defs>
        <linearGradient id="silver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F8F8F6" />
          <stop offset="50%" stopColor="#DDE1E7" />
          <stop offset="100%" stopColor="#A8AEB8" />
        </linearGradient>
        <linearGradient id="silver2" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#6B7280" />
          <stop offset="60%" stopColor="#C1C7D0" />
          <stop offset="100%" stopColor="#F4F5F7" />
        </linearGradient>
        <linearGradient id="goldg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B8912F" />
          <stop offset="50%" stopColor="#D6B85A" />
          <stop offset="100%" stopColor="#B8912F" />
        </linearGradient>
        <linearGradient id="dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A3D42" />
          <stop offset="100%" stopColor="#1F2328" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#D6B85A" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#D6B85A" stopOpacity="0" />
        </radialGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>

      {/* Aurora glow */}
      <circle cx="300" cy="300" r="260" fill="url(#glow)" />

      {/* Floor grid (perspective-ish) */}
      <g opacity="0.35" stroke="#6B7280" strokeWidth="0.5">
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={"h" + i} x1={60 + i * 36} y1="430" x2={300 + (i - 7) * 12} y2="560" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={"v" + i} x1="60" y1={430 + i * 26} x2="540" y2={430 + i * 26} />
        ))}
      </g>

      {/* Big tower block (back) */}
      <g className="anim-float-slow" style={{ transformOrigin: "300px 300px" }}>
        <polygon points="220,120 360,90 360,420 220,440" fill="url(#silver)" stroke="#A8AEB8" strokeWidth="1" />
        <polygon points="360,90 420,110 420,400 360,420" fill="url(#dark)" />
        <polygon points="220,120 360,90 420,110 280,140" fill="url(#silver2)" opacity="0.85" />
        {/* windows */}
        {Array.from({ length: 9 }).map((_, r) =>
          Array.from({ length: 4 }).map((_, c) => (
            <rect
              key={`w${r}-${c}`}
              x={232 + c * 28}
              y={150 + r * 28}
              width="18"
              height="16"
              fill="#ECEFF3"
              opacity={0.5 + ((r + c) % 3) * 0.18}
              stroke="#C8A24A"
              strokeOpacity="0.18"
            />
          ))
        )}
        {/* gold spire */}
        <polygon points="290,90 296,40 302,90" fill="url(#goldg)" />
        <circle cx="296" cy="34" r="4" fill="url(#goldg)" />
      </g>

      {/* Floating glass slab (front) */}
      <g className="anim-float" style={{ transformOrigin: "150px 380px" }}>
        <polygon points="80,360 200,330 220,400 100,430" fill="url(#silver)" opacity="0.92" stroke="#C8A24A" strokeOpacity="0.3" />
        <polygon points="200,330 220,400 240,394 220,326" fill="url(#dark)" opacity="0.8" />
        <line x1="100" y1="395" x2="220" y2="365" stroke="#C8A24A" strokeOpacity="0.4" />
      </g>

      {/* Floating cube (right) */}
      <g className="anim-floatxy" style={{ transformOrigin: "470px 240px" }}>
        <polygon points="430,200 510,180 510,260 430,280" fill="url(#silver2)" />
        <polygon points="510,180 540,200 540,280 510,260" fill="url(#dark)" />
        <polygon points="430,200 510,180 540,200 460,220" fill="#F8F8F6" opacity="0.9" />
        <circle cx="485" cy="225" r="6" fill="url(#goldg)" />
      </g>

      {/* Crane arm */}
      <g opacity="0.92">
        <rect x="295" y="40" width="3" height="80" fill="#3A3D42" />
        <rect x="200" y="80" width="180" height="3" fill="#3A3D42" />
        <rect x="200" y="80" width="3" height="34" fill="#3A3D42" />
        <line x1="220" y1="83" x2="220" y2="115" stroke="#C8A24A" strokeWidth="1" />
        <rect x="214" y="115" width="12" height="10" fill="url(#goldg)" />
      </g>

      {/* Blueprint thin lines (animated draw) */}
      <g className="anim-draw" stroke="#C8A24A" strokeWidth="1" fill="none" opacity="0.65">
        <path d="M40,500 L200,500 L240,460 L420,460 L460,500 L560,500" />
        <path d="M40,520 L560,520" strokeDasharray="4 6" />
        <circle cx="240" cy="460" r="6" />
        <circle cx="420" cy="460" r="6" />
      </g>

      {/* Orbiting gold dot */}
      <g style={{ transformOrigin: "300px 300px" }} className="anim-spin-slow">
        <circle cx="460" cy="300" r="5" fill="url(#goldg)" />
        <circle cx="460" cy="300" r="10" fill="none" stroke="#D6B85A" strokeOpacity="0.4" />
      </g>
    </svg>
  );
}

/* Abstract 3D assembly diagram for the assembly section */
export function AssemblyScene() {
  return (
    <svg viewBox="0 0 800 500" className="w-full h-full">
      <defs>
        <linearGradient id="as-silver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F8F8F6" />
          <stop offset="100%" stopColor="#A8AEB8" />
        </linearGradient>
        <linearGradient id="as-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A3D42" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
        <linearGradient id="as-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B8912F" />
          <stop offset="50%" stopColor="#F2DD9C" />
          <stop offset="100%" stopColor="#B8912F" />
        </linearGradient>
      </defs>

      {/* Ground line */}
      <line x1="60" y1="420" x2="740" y2="420" stroke="#6B7280" strokeOpacity="0.4" />

      {/* Base slab */}
      <g>
        <polygon points="240,420 560,420 600,440 200,440" fill="url(#as-dark)" />
        <polygon points="240,420 560,420 540,410 260,410" fill="url(#as-silver)" />
      </g>

      {/* Stack of floors with offsets — mid-assembly */}
      {[0,1,2,3,4].map((i) => (
        <g key={i} className={i % 2 ? "anim-float" : "anim-float-slow"} style={{ transformOrigin: "400px 300px", animationDelay: `${i*0.4}s` }}>
          <polygon
            points={`${280 + i*4},${380 - i*60} ${520 - i*4},${380 - i*60} ${520 - i*4},${360 - i*60} ${280 + i*4},${360 - i*60}`}
            fill="url(#as-silver)"
            stroke="#C8A24A" strokeOpacity="0.25"
          />
          <polygon
            points={`${520 - i*4},${380 - i*60} ${540 - i*4},${374 - i*60} ${540 - i*4},${354 - i*60} ${520 - i*4},${360 - i*60}`}
            fill="url(#as-dark)"
          />
          {/* exploded marker line */}
          <line x1={400} y1={360 - i*60} x2={620 + i*10} y2={360 - i*60} stroke="#C8A24A" strokeOpacity="0.5" strokeDasharray="3 4" />
          <circle cx={620 + i*10} cy={360 - i*60} r="3" fill="url(#as-gold)" />
          <text x={628 + i*10} y={364 - i*60} fontSize="11" fill="#3A3D42" fontFamily="ui-monospace, monospace">
            LEVEL {String(i+1).padStart(2, "0")}
          </text>
        </g>
      ))}

      {/* Floating beam */}
      <g className="anim-floatxy">
        <rect x="100" y="180" width="120" height="14" fill="url(#as-silver)" stroke="#6B7280" />
        <rect x="100" y="180" width="120" height="3" fill="url(#as-gold)" />
      </g>

      {/* Floating bolt */}
      <g className="anim-float" style={{ transformOrigin: "700px 180px" }}>
        <circle cx="700" cy="180" r="14" fill="url(#as-gold)" />
        <polygon points="688,180 700,168 712,180 700,192" fill="#1F2328" opacity="0.4" />
      </g>

      {/* Blueprint dimension lines */}
      <g stroke="#C8A24A" strokeOpacity="0.55" fill="none">
        <line x1="200" y1="450" x2="600" y2="450" />
        <line x1="200" y1="445" x2="200" y2="455" />
        <line x1="600" y1="445" x2="600" y2="455" />
        <text x="380" y="468" fontSize="11" fill="#6B7280" fontFamily="ui-monospace, monospace">
          42.000 m
        </text>
      </g>
    </svg>
  );
}

export function IconBy({ name, className = "w-6 h-6" }: { name: string; className?: string }) {
  const stroke = "#1F2328";
  const gold = "#C8A24A";
  switch (name) {
    case "tower":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke={stroke} strokeWidth="1.4">
          <path d="M12 2 L8 6 L8 22 L16 22 L16 6 Z" />
          <line x1="12" y1="2" x2="12" y2="22" stroke={gold} />
          <line x1="8" y1="10" x2="16" y2="10" />
          <line x1="8" y1="14" x2="16" y2="14" />
          <line x1="8" y1="18" x2="16" y2="18" />
        </svg>
      );
    case "blueprint":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke={stroke} strokeWidth="1.4">
          <rect x="3" y="4" width="18" height="16" rx="1" />
          <path d="M3 9 H21 M9 4 V20" stroke={gold} />
          <circle cx="15" cy="14" r="2" />
        </svg>
      );
    case "gear":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke={stroke} strokeWidth="1.4">
          <circle cx="12" cy="12" r="3" stroke={gold} />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke={stroke} strokeWidth="1.4">
          <path d="M12 2 L20 5 V12 C20 17 16 21 12 22 C8 21 4 17 4 12 V5 Z" />
          <path d="M9 12 L11 14 L15 10" stroke={gold} />
        </svg>
      );
    case "leaf":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke={stroke} strokeWidth="1.4">
          <path d="M5 19 C5 11 11 5 20 4 C19 13 13 19 5 19 Z" />
          <path d="M5 19 C9 15 13 11 18 8" stroke={gold} />
        </svg>
      );
    case "spark":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke={stroke} strokeWidth="1.4">
          <path d="M12 2 L13.5 9 L20 10.5 L13.5 12 L12 19 L10.5 12 L4 10.5 L10.5 9 Z" stroke={gold} />
        </svg>
      );
    default:
      return null;
  }
}
