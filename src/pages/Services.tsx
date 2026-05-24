import { useSiteData } from "../lib/useSiteData";
import { CoolOrb, GoldOrb, IconBy, Particles } from "../components/Decor";
import { MediaFrame } from "../components/MediaFrame";
import { SiteLoader } from "../components/SiteLoader";
import { SectionLabel } from "./Home";
import { Link } from "../lib/router";

export default function Services() {
  const { data, loading } = useSiteData();
  if (loading || !data) return <SiteLoader />;
  return (
    <main className="pt-32 pb-24">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bp-grid opacity-50 pointer-events-none" />
        <GoldOrb className="w-[500px] h-[500px] -top-20 -right-20" />
        <CoolOrb className="w-[400px] h-[400px] top-32 -left-20" />
        <Particles count={18} />
        <div className="relative mx-auto max-w-7xl px-6 reveal">
          <SectionLabel index="01" title="Capabilities" />
          <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.02] max-w-4xl">
            <span className="text-silver-grad">A full-service company</span><br />
            <span className="text-gold-grad">for extraordinary builds.</span>
          </h1>
          <p className="mt-6 text-[#3A3D42] text-lg max-w-2xl leading-relaxed">
            Twelve interlocked capabilities - one signature workflow. Choose any service or commission an end-to-end delivery engagement.
          </p>
          <div className="mt-10 max-w-4xl reveal-tilt">
            <MediaFrame src={data.hero.image} alt="Al Muqeet services" eyebrow="Technical Services" caption="Construction, MEP, civil works, renovation and maintenance across the UAE." className="aspect-[16/7]" />
          </div>
        </div>
      </section>

      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-6">
          {data.services.map((s, i) => (
            <div key={i} className="reveal-tilt">
              <div className="tilt-card glass rounded-[1.75rem] p-8 group relative overflow-hidden">
                  <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full opacity-30 group-hover:opacity-60 transition"
                  style={{ background: "radial-gradient(circle, rgba(214,184,90,0.6), transparent 70%)" }}
                />
                <div className="mb-5 overflow-hidden rounded-2xl">
                  <img src={s.image} alt={s.title} className="w-full h-44 object-cover" />
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F8F8F6] to-[#DDE1E7] grid place-items-center ring-1 ring-[#C8A24A]/30 shrink-0">
                    <IconBy name={s.icon} className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tech text-xs text-[#C8A24A]">0{i+1}</span>
                      <span className="gold-line w-12" />
                    </div>
                    <div className="font-display text-2xl mt-2">{s.title}</div>
                    <p className="mt-3 text-[#3A3D42] text-sm leading-relaxed">{s.desc}</p>
                    <ul className="mt-4 space-y-1.5 text-sm text-[#3A3D42]">
                      {["Concept · feasibility", "Detailed engineering", "Site supervision", "Commissioning"].map(t => (
                        <li key={t} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C8A24A]" />{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-6 reveal-tilt">
          <div className="glass-dark rounded-[2rem] p-10 md:p-14 relative overflow-hidden">
            <div className="absolute inset-0 bp-grid opacity-20" />
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="text-[11px] tracking-[.35em] uppercase text-[#D6B85A]">end-to-end</div>
                <h2 className="mt-3 font-display text-3xl md:text-4xl text-white">
                  Or commission the full company.
                </h2>
                <p className="mt-4 text-white/70 max-w-md">One brief, one team, one signature delivery — from feasibility to handover.</p>
              </div>
              <div className="md:text-right">
                <Link to="/contact" className="btn-dark">Engage Al Muqeet →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
