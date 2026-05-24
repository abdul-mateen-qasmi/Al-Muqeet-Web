import { useSiteData } from "../lib/useSiteData";
import { CoolOrb, GoldOrb, Particles } from "../components/Decor";
import { MediaFrame } from "../components/MediaFrame";
import { SiteLoader } from "../components/SiteLoader";
import { SectionLabel } from "./Home";

export default function About() {
  const { data, loading } = useSiteData();
  if (loading || !data) return <SiteLoader />;
  const team = [
    { name: "Liora Khan", role: "Founder · Principal Architect", initial: "L" },
    { name: "Mateo Reyes", role: "Head of Engineering", initial: "M" },
    { name: "Aiko Tanaka", role: "Director, BIM Coordination", initial: "A" },
    { name: "Idris Okafor", role: "Head of Construction", initial: "I" },
  ];
  const values = [
    { t: "Craft First", d: "Material honesty, hand-detailed joinery, golden-ratio composition." },
    { t: "Engineered Beauty", d: "Form follows physics — and physics follows poetry." },
    { t: "Quiet Luxury", d: "Restrained palettes, deep textures, light as a material." },
    { t: "Long Stewardship", d: "We stay one year post-occupancy. The building must age well." },
  ];
  return (
    <main className="pt-32 pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bp-grid opacity-50 pointer-events-none" />
        <GoldOrb className="w-[500px] h-[500px] -top-20 -right-20" />
        <CoolOrb className="w-[420px] h-[420px] top-40 -left-32" />
        <Particles count={20} />
        <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7 reveal">
            <SectionLabel index="01" title="Our Company" />
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.02]">
              <span className="text-silver-grad">A technical company of</span>{" "}
              <span className="text-gold-grad">builders, engineers</span>{" "}
              <span className="text-silver-grad">& specialists.</span>
            </h1>
            <p className="mt-6 text-[#3A3D42] text-lg max-w-2xl leading-relaxed">
              {data.brand.legalName} is a multi-discipline technical services company based in Ajman, serving clients across the UAE with disciplined execution and premium workmanship.
            </p>
            <div className="mt-10 reveal-tilt">
              <MediaFrame src={data.about.image} alt="Al Muqeet technical services" eyebrow="Ajman, UAE" caption={data.about.quality} className="aspect-[16/8]" />
            </div>
          </div>
          <div className="lg:col-span-5 reveal-tilt">
            <div className="glass rounded-3xl p-6 relative">
              <div className="absolute inset-0 bp-grid opacity-30 rounded-3xl" />
              <div className="relative grid grid-cols-2 gap-3">
                {data.stats.map((s, i) => (
                  <div key={i} className="rounded-2xl bg-white/40 p-5">
                    <div className="font-display text-3xl text-silver-grad">{s.value}</div>
                    <div className="text-[10px] uppercase tracking-[.3em] text-[#6B7280] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="relative py-24">
        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-12 reveal">
          <div>
            <SectionLabel index="02" title="Story" />
            <h2 className="font-display text-4xl mt-4 leading-tight">
              <span className="text-silver-grad">Founded in 2009 with one belief:</span><br />
              <span className="text-gold-grad">buildings should move you.</span>
            </h2>
          </div>
          <div className="text-[#3A3D42] leading-relaxed space-y-4">
            <p>What started as a focused technical team has grown into a trusted service partner for construction, renovation, MEP, maintenance and specialist works.</p>
            <p>Every project is led by practical planning, site supervision and quality control so the handover is clean, safe and dependable.</p>
            <p>We do not claim awards or certifications we cannot verify. Our focus is on reliable delivery, repeat work and long-term client trust.</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center reveal">
            <SectionLabel index="03" title="Values" centered />
            <h2 className="font-display text-4xl md:text-5xl mt-4">
              <span className="text-silver-grad">Four principles that</span>{" "}
              <span className="text-gold-grad">shape every line.</span>
            </h2>
          </div>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => (
              <div key={i} className="reveal-tilt">
                <div className="tilt-card glass rounded-3xl p-6 h-full">
                  <div className="font-mono-tech text-xs text-[#C8A24A]">0{i+1}</div>
                  <div className="font-display text-xl mt-3">{v.t}</div>
                  <p className="text-[#3A3D42] text-sm mt-2 leading-relaxed">{v.d}</p>
                  <div className="gold-line mt-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="reveal">
            <SectionLabel index="04" title="Leadership" />
            <h2 className="font-display text-4xl md:text-5xl mt-4">
              <span className="text-silver-grad">A leadership of</span>{" "}
              <span className="text-gold-grad">quiet authority.</span>
            </h2>
          </div>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {team.map((t, i) => (
              <div key={i} className="reveal-tilt">
                <div className="tilt-card glass rounded-3xl p-6">
                  <div className="aspect-square rounded-2xl relative overflow-hidden grid place-items-center"
                       style={{ background: "linear-gradient(135deg, #DDE1E7 0%, #ECEFF3 50%, #A8AEB8 100%)" }}>
                    <div className="absolute inset-0 bp-grid opacity-30" />
                    <div className="font-display text-7xl text-gold-grad relative">{t.initial}</div>
                    <div className="absolute bottom-3 left-3 right-3 h-px bg-gradient-to-r from-transparent via-[#C8A24A] to-transparent" />
                  </div>
                  <div className="font-display text-lg mt-4">{t.name}</div>
                  <div className="text-[11px] uppercase tracking-[.25em] text-[#6B7280] mt-1">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
