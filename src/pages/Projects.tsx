import { useState } from "react";
import { useSiteData } from "../lib/useSiteData";
import { GoldOrb, CoolOrb, Particles } from "../components/Decor";
import { MediaFrame } from "../components/MediaFrame";
import { SiteLoader } from "../components/SiteLoader";
import { SectionLabel } from "./Home";

export default function Projects() {
  const { data, loading } = useSiteData();
  const [filter, setFilter] = useState<string>("All");
  if (loading || !data) return <SiteLoader />;
  const types = ["All", ...Array.from(new Set(data.projects.map(p => p.type)))];
  const list = filter === "All" ? data.projects : data.projects.filter(p => p.type === filter);

  return (
    <main className="pt-32 pb-24">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bp-grid opacity-50 pointer-events-none" />
        <GoldOrb className="w-[500px] h-[500px] -top-20 -right-20" />
        <CoolOrb className="w-[420px] h-[420px] top-40 -left-20" />
        <Particles count={20} />
        <div className="relative mx-auto max-w-7xl px-6 reveal">
          <SectionLabel index="01" title="Selected Works" />
          <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.02] max-w-4xl">
            <span className="text-silver-grad">Project scenes as</span>{" "}
            <span className="text-gold-grad">cinematic landmarks.</span>
          </h1>
          <p className="mt-6 text-[#3A3D42] text-lg max-w-2xl leading-relaxed">
            A curated selection of renovation, MEP, industrial, fit-out and support work across the UAE.
          </p>
          <div className="mt-10 max-w-4xl reveal-tilt">
            <MediaFrame src="/images/almuqeet-projects.png" alt="Al Muqeet project scene" eyebrow="Project showcase" caption="Hybrid imagery with glass overlays and blueprint detail." className="aspect-[16/7]" />
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={
                  "px-4 py-2 rounded-full text-xs uppercase tracking-[.25em] transition border " +
                  (filter === t
                    ? "bg-[#1F2328] text-white border-[#C8A24A]/60"
                    : "glass text-[#3A3D42] border-transparent hover:ring-gold")
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((p, i) => (
            <div key={p.title} className="reveal-tilt" style={{ transitionDelay: `${i*40}ms` }}>
              <article className="tilt-card group rounded-3xl overflow-hidden glass">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <MediaFrame src={p.image} alt={p.title} className="h-full rounded-none" eyebrow={p.type} caption={p.short} objectPosition="center center" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F2328]/60 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest glass-dark text-white border border-[#C8A24A]/40">
                    {p.year}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="text-[10px] tracking-[.3em] uppercase opacity-80">{p.location}</div>
                    <div className="font-display text-2xl">{p.title}</div>
                  </div>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div className="text-[12px] tracking-[.25em] uppercase text-[#6B7280]">{p.type}</div>
                  <span className="text-[#C8A24A]">→</span>
                </div>
              </article>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
