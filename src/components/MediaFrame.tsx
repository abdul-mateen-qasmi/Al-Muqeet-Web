type Props = {
  src: string;
  alt: string;
  caption?: string;
  eyebrow?: string;
  className?: string;
  objectPosition?: string;
};

export function MediaFrame({ src, alt, caption, eyebrow, className = "", objectPosition = "center" }: Props) {
  return (
    <div className={"relative overflow-hidden rounded-[2rem] glass light-sweep " + className}>
      <img src={src} alt={alt} className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition }} />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#1F2328]/55 via-[#1F2328]/10 to-transparent" />
      <div className="absolute inset-0 bp-grid opacity-20" />
      {(eyebrow || caption) && (
        <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-4">
          {eyebrow ? (
            <div className="glass-dark rounded-2xl px-4 py-3 max-w-[70%]">
              <div className="text-[10px] uppercase tracking-[.3em] text-[#D6B85A]">{eyebrow}</div>
              {caption && <div className="mt-1 text-sm text-white/85 leading-relaxed">{caption}</div>}
            </div>
          ) : <span />}
          {!eyebrow && caption && (
            <div className="glass-dark rounded-2xl px-4 py-3 text-sm text-white/85 max-w-[70%]">{caption}</div>
          )}
        </div>
      )}
    </div>
  );
}