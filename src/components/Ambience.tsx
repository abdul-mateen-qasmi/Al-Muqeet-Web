export function AmbientBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 ambient-mesh opacity-80" />
      <div className="absolute inset-0 bp-grid opacity-35" />
      <div
        className="absolute -top-40 -right-40 w-[48rem] h-[48rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(214,184,90,0.16) 0%, rgba(214,184,90,0) 68%)" }}
      />
      <div
        className="absolute top-[25%] -left-44 w-[36rem] h-[36rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(191,199,213,0.24) 0%, rgba(191,199,213,0) 68%)" }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 1600 1000" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ambientLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(200,162,74,0)" />
            <stop offset="50%" stopColor="rgba(200,162,74,0.28)" />
            <stop offset="100%" stopColor="rgba(200,162,74,0)" />
          </linearGradient>
        </defs>
        <path d="M0 180 C300 150, 520 260, 860 220 S1400 120, 1600 200" fill="none" stroke="url(#ambientLine)" strokeWidth="1.2" />
        <path d="M0 720 C340 650, 640 820, 980 760 S1400 620, 1600 700" fill="none" stroke="url(#ambientLine)" strokeWidth="1.2" />
        <circle cx="780" cy="220" r="3" fill="#D6B85A" />
        <circle cx="980" cy="760" r="3" fill="#D6B85A" />
      </svg>
    </div>
  );
}