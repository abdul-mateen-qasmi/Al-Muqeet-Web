import { useEffect, useRef, useState } from "react";
import type { SiteData } from "../lib/data";
import { useSiteData } from "../lib/useSiteData";
import { AssemblyScene, CoolOrb, GoldOrb, HeroSculpture, IconBy, Particles } from "../components/Decor";
import { MediaFrame } from "../components/MediaFrame";
import { SiteLoader } from "../components/SiteLoader";
import { Link } from "../lib/router";

export default function Home() {
  const { data, loading } = useSiteData();
  if (loading || !data) return <SiteLoader />;
  return (
    <main>
      <Hero data={data} />
      <Marquee />
      <Assembly />
      <Story data={data} />
      <ServicesUniverse data={data} />
      <ProcessJourney data={data} />
      <ProjectsShowcase data={data} />
      <Stats data={data} />
      <CareersGrowth data={data} />
      <ContactCTA data={data} />
    </main>
  );
}

/* ---------- 1. HERO ---------- */
function Hero({ data }: { data: SiteData }) {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      <div className="absolute inset-0 bp-grid opacity-60 pointer-events-none" />
      <GoldOrb className="w-[520px] h-[520px] -top-20 -right-20" />
      <CoolOrb className="w-[420px] h-[420px] top-40 -left-32" />
      <Particles count={28} />

      <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 reveal">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8A24A] anim-pulse-gold" />
            <span className="text-[#3A3D42]">{data.hero.eyebrow}</span>
          </div>
          <h1 className="mt-6 font-display text-5xl md:text-6xl lg:text-7xl leading-[1.02]">
            <span className="text-silver-grad">{data.hero.title.split(".")[0]}.</span>
            <br />
            <span className="text-gold-grad">{data.hero.title.split(".")[1]?.trim() || ""}</span>
            <span className="text-silver-grad">.</span>
          </h1>
          <p className="mt-6 text-[#3A3D42] text-lg leading-relaxed max-w-xl">
            {data.hero.sub}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/contact" className="btn-dark">
              {data.hero.ctaPrimary}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <button className="btn-glass">
              <span className="w-7 h-7 rounded-full bg-[#1F2328] grid place-items-center">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="#D6B85A"><path d="M5 3v18l16-9z" /></svg>
              </span>
              {data.hero.ctaSecondary}
            </button>
          </div>

          {/* mini stats */}
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg">
            {data.stats.slice(0,3).map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4">
                <div className="font-display text-2xl text-silver-grad">{s.value}</div>
                <div className="text-[11px] uppercase tracking-widest text-[#6B7280]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual — premium 3D-style sculpture, never empty */}
        <div className="lg:col-span-6 relative">
          <div className="relative reveal-tilt">
            <div className="absolute -inset-6 rounded-[2.5rem] glass" />
            <div className="relative rounded-[2rem] overflow-hidden glass p-4">
              <div className="absolute inset-0 bp-grid opacity-30" />
              <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono-tech text-[#6B7280]">
                <span>AL MUQEET / SCENE 01</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8A24A]" />
                  REC · LIVE PREVIEW
                </span>
              </div>
              <div className="aspect-[1/1] relative">
                <MediaFrame
                  src={data.hero.image}
                  alt="Al Muqeet premium construction hero"
                  eyebrow={data.hero.overlayTitle}
                  caption={data.hero.overlayCopy}
                  className="h-full"
                  objectPosition="center center"
                />
                <div className="absolute inset-0 pointer-events-none">
                  <HeroSculpture />
                  <Particles count={18} />
                </div>
              </div>
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono-tech text-[#6B7280]">
                <span>LAT 25.197°N · LON 55.274°E</span>
                <span>RENDER 4K · 24 FPS</span>
              </div>
            </div>

            {/* floating chips */}
            <div className="absolute -left-6 top-10 glass rounded-2xl px-4 py-3 anim-float-slow">
              <div className="text-[10px] uppercase tracking-widest text-[#6B7280]">Material</div>
              <div className="text-sm font-display">Brushed Bronze · Glass</div>
            </div>
            <div className="absolute -right-4 bottom-12 glass rounded-2xl px-4 py-3 anim-float">
              <div className="text-[10px] uppercase tracking-widest text-[#6B7280]">Status</div>
              <div className="text-sm font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C8A24A] anim-pulse-gold" />
                Phase 03 / Engineering
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* scroll indicator */}
      <div className="relative mx-auto max-w-7xl px-6 mt-16 flex items-center justify-between text-[11px] uppercase tracking-[.3em] text-[#6B7280]">
        <span className="hidden md:inline">scroll · explore Al Muqeet</span>
        <span className="flex items-center gap-3">
          <span className="w-px h-10 bg-gradient-to-b from-transparent via-[#C8A24A] to-transparent" />
          <span>02 / Assembly</span>
        </span>
      </div>
    </section>
  );
}

/* ---------- Marquee strip ---------- */
function Marquee() {
  const items = [
    "DUBAI", "LISBON", "RIYADH", "OSLO", "SINGAPORE", "MARRAKECH",
    "LEED PLATINUM", "BIM L4", "ISO 9001", "ZERO-DEFECT HANDOVER",
  ];
  const arr = [...items, ...items];
  return (
    <section className="relative overflow-hidden py-6 border-y border-[#1F2328]/10 bg-gradient-to-r from-[#ECEFF3] via-[#F4F5F7] to-[#ECEFF3]">
      <div className="marquee-track flex gap-12 whitespace-nowrap" style={{ width: "200%" }}>
        {arr.map((t, i) => (
          <div key={i} className="flex items-center gap-12 text-sm tracking-[.3em] text-[#6B7280]">
            <span>{t}</span>
            <span className="text-[#C8A24A]">◆</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- 2. ASSEMBLY ---------- */
function Assembly() {
  return (
    <section className="relative py-28 overflow-hidden">
      <CoolOrb className="w-[420px] h-[420px] top-20 -right-32" />
      <GoldOrb className="w-[300px] h-[300px] bottom-0 left-10" />
      <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 reveal">
          <SectionLabel index="02" title="Live Assembly" />
          <h2 className="font-display text-4xl md:text-5xl mt-4 leading-tight">
            <span className="text-silver-grad">Every level,</span>{" "}
            <span className="text-gold-grad">precision-engineered.</span>
          </h2>
          <p className="mt-5 text-[#3A3D42] text-[15px] leading-relaxed">
            Our BIM-coordinated assemblies stack tolerances at sub-millimetre precision. You watch the building rise — we govern every bolt, beam and finish in a closed-loop telemetry pipeline.
          </p>
          <ul className="mt-6 space-y-2.5">
            {["Parametric structural modeling", "Sub-mm tolerance handover", "Zero-defect QA telemetry", "Modular off-site fabrication"].map((t) => (
              <li key={t} className="flex items-center gap-3 text-[#3A3D42] text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A24A]" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-7 reveal-tilt">
          <div className="relative glass rounded-[2rem] p-4">
            <div className="absolute inset-0 bp-grid opacity-30 rounded-[2rem]" />
            <div className="aspect-[16/10] relative">
              <AssemblyScene />
              <Particles count={14} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 3. STORY ---------- */
function Story({ data }: { data: SiteData }) {
  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bp-grid opacity-40 pointer-events-none" />
      <div className="mx-auto max-w-6xl px-6 text-center reveal">
          <SectionLabel index="03" title="The Company" centered />
        <h2 className="font-display text-4xl md:text-6xl mt-6 leading-tight">
            <span className="text-silver-grad">A company where</span>{" "}
          <span className="text-gold-grad">silver meets gold,</span>
          <br />
            <span className="text-silver-grad">and steel meets discipline.</span>
        </h2>
        <p className="mt-6 text-[#3A3D42] text-lg max-w-3xl mx-auto leading-relaxed">
          {data.brand.legalName} unites technical teams, trades and site supervision inside one disciplined workflow - turning ambitious briefs into reliable outcomes across the UAE.
        </p>
          <div className="mt-10 mx-auto max-w-4xl reveal-tilt">
            <MediaFrame
              src={data.about.image}
              alt="Al Muqeet technical services team"
              eyebrow="Ajman, UAE"
              caption={data.about.intro}
              className="aspect-[16/8]"
              objectPosition="center center"
            />
          </div>
      </div>

      {/* story cards */}
      <div className="relative mx-auto max-w-7xl px-6 mt-16 grid md:grid-cols-3 gap-6">
        {[
          { k: "01 · Vision", t: "Cinematic Briefs", d: "We open every project as a film script — characters, light, motion, climax." },
          { k: "02 · Method", t: "Engineered Beauty", d: "Parametric modeling fused with golden-ratio composition and material honesty." },
          { k: "03 · Delivery", t: "Signature Handover", d: "A white-glove handover protocol with one-year post-occupancy stewardship." },
        ].map((s, i) => (
          <div key={i} className="reveal-tilt">
            <div className="tilt-card glass rounded-3xl p-7 h-full">
              <div className="text-[11px] tracking-[.3em] uppercase text-[#C8A24A]">{s.k}</div>
              <div className="font-display text-2xl mt-3">{s.t}</div>
              <p className="mt-3 text-[#3A3D42] text-sm leading-relaxed">{s.d}</p>
              <div className="mt-6 gold-line" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- 4. SERVICES UNIVERSE ---------- */
function ServicesUniverse({ data }: { data: SiteData }) {
  return (
    <section className="relative py-28 overflow-hidden">
      <GoldOrb className="w-[400px] h-[400px] top-20 right-0" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between gap-6 reveal">
          <div>
            <SectionLabel index="04" title="Services Universe" />
            <h2 className="font-display text-4xl md:text-5xl mt-4 leading-tight max-w-2xl">
            <span className="text-silver-grad">A full-service company for</span>{" "}
              <span className="text-gold-grad">extraordinary builds.</span>
            </h2>
          </div>
          <Link to="/services" className="btn-glass hidden md:inline-flex">All services
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.services.map((s, i) => (
            <div key={i} className="reveal-tilt">
              <div className="tilt-card group glass rounded-3xl p-7 h-full relative overflow-hidden">
                  <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full opacity-30 group-hover:opacity-60 transition"
                  style={{ background: "radial-gradient(circle, rgba(214,184,90,0.6), transparent 70%)" }}
                />
                <div className="mb-4 overflow-hidden rounded-2xl border border-white/50">
                  <img src={s.image} alt={s.title} className="w-full h-40 object-cover" />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F8F8F6] to-[#DDE1E7] grid place-items-center ring-1 ring-[#C8A24A]/30">
                  <IconBy name={s.icon} className="w-6 h-6" />
                </div>
                <div className="font-display text-xl mt-5">{s.title}</div>
                <div className="text-[10px] uppercase tracking-[.25em] text-[#C8A24A] mt-2">{s.category}</div>
                <p className="mt-2.5 text-[#3A3D42] text-sm leading-relaxed">{s.desc}</p>
                <div className="mt-5 flex items-center gap-2 text-[11px] uppercase tracking-[.25em] text-[#6B7280] group-hover:text-[#C8A24A] transition">
                  Discover
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 5. PROCESS JOURNEY ---------- */
function ProcessJourney({ data }: { data: SiteData }) {
  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bp-grid opacity-40 pointer-events-none" />
      <CoolOrb className="w-[420px] h-[420px] -top-10 -left-10" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="reveal text-center">
          <SectionLabel index="05" title="Process Journey" centered />
          <h2 className="font-display text-4xl md:text-5xl mt-4">
            <span className="text-silver-grad">Five chapters,</span>{" "}
            <span className="text-gold-grad">one signature flow.</span>
          </h2>
        </div>

        <div className="relative mt-16">
          {/* center line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#C8A24A]/60 to-transparent" />
          <div className="space-y-8">
            {data.process.map((p, i) => {
              const left = i % 2 === 0;
              return (
                <div key={i} className={"reveal grid lg:grid-cols-2 gap-6 items-center " + (left ? "" : "lg:[&>*:first-child]:order-2")}>
                  <div className={"glass tilt-card rounded-3xl p-7 " + (left ? "lg:mr-10" : "lg:ml-10")}>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-3xl text-gold-grad">{p.step}</span>
                      <span className="gold-line flex-1" />
                    </div>
                    <div className="font-display text-2xl mt-3">{p.title}</div>
                    <p className="mt-2 text-[#3A3D42] text-sm leading-relaxed">{p.desc}</p>
                  </div>
                  <div className="hidden lg:flex justify-center">
                    <div className="relative w-16 h-16 rounded-full glass grid place-items-center ring-gold">
                      <span className="font-mono-tech text-xs text-[#3A3D42]">{p.step}</span>
                      <span className="absolute inset-0 rounded-full anim-pulse-gold pointer-events-none" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 6. PROJECTS SHOWCASE ---------- */
function ProjectsShowcase({ data }: { data: SiteData }) {
  return (
    <section className="relative py-28 overflow-hidden">
      <GoldOrb className="w-[500px] h-[500px] -bottom-32 -right-20" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between gap-6 reveal">
          <div>
          <SectionLabel index="06" title="Selected Works" />
            <h2 className="font-display text-4xl md:text-5xl mt-4">
              <span className="text-silver-grad">Buildings as</span>{" "}
              <span className="text-gold-grad">cinematic landmarks.</span>
            </h2>
          </div>
          <Link to="/projects" className="btn-glass hidden md:inline-flex">All projects
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.projects.map((p, i) => (
            <div key={i} className="reveal-tilt">
              <article className="tilt-card group rounded-3xl overflow-hidden glass">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F2328]/55 via-transparent to-transparent opacity-90 group-hover:opacity-70 transition" />
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
      </div>
    </section>
  );
}

/* ---------- 7. STATS ---------- */
function Stats({ data }: { data: SiteData }) {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="reveal-tilt">
          <div className="glass-dark rounded-[2rem] p-10 md:p-14 relative overflow-hidden">
            <div className="absolute inset-0 bp-grid opacity-20" />
            <div className="absolute -top-32 -right-20 w-[500px] h-[500px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(214,184,90,0.35), transparent 70%)" }}
            />
            <div className="relative grid md:grid-cols-4 gap-8">
              {data.stats.map((s, i) => (
                <CountStat key={i} value={s.value} label={s.label} />
              ))}
            </div>
            <div className="relative mt-10 flex items-center justify-between text-[11px] uppercase tracking-[.3em] text-white/55">
              <span>since 2009</span>
              <span className="hidden md:inline">trusted across the UAE</span>
              <span>updated quarterly</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CountStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState("0");
  useEffect(() => {
    if (!ref.current) return;
    const numeric = parseFloat(value.replace(/[^\d.]/g, ""));
    const suffix = value.replace(/[\d.,]/g, "");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          let start = 0;
          const dur = 1400;
          const t0 = performance.now();
          const tick = (t: number) => {
            const k = Math.min(1, (t - t0) / dur);
            const v = start + (numeric - start) * (1 - Math.pow(1 - k, 3));
            const fmt = numeric >= 100 ? Math.round(v).toString() : v.toFixed(1);
            setShown(fmt + suffix);
            if (k < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      });
    });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [value]);
  return (
    <div ref={ref}>
      <div className="font-display text-5xl md:text-6xl text-gold-grad">{shown}</div>
      <div className="mt-2 text-[11px] uppercase tracking-[.3em] text-white/65">{label}</div>
    </div>
  );
}

/* ---------- 8. CAREERS ---------- */
function CareersGrowth({ data }: { data: SiteData }) {
  return (
    <section className="relative py-28 overflow-hidden">
      <CoolOrb className="w-[400px] h-[400px] top-10 -right-20" />
      <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 reveal">
          <SectionLabel index="07" title="Build with us" />
          <h2 className="font-display text-4xl md:text-5xl mt-4">
            <span className="text-silver-grad">Careers in a</span>{" "}
            <span className="text-gold-grad">company of craft.</span>
          </h2>
          <p className="mt-5 text-[#3A3D42] text-[15px] leading-relaxed max-w-md">
            Join a technical services company building reliable outcomes for clients across Ajman and the UAE. We hire for craft, discipline and accountability.
          </p>
          <Link to="/careers" className="btn-dark mt-8">View open roles</Link>
        </div>
        <div className="lg:col-span-7 space-y-3">
          {data.careers.map((r, i) => (
            <div key={i} className="reveal">
              <div className="glass rounded-2xl p-5 flex items-center justify-between gap-4 group hover:ring-gold transition">
                <div>
                  <div className="font-display text-lg">{r.role}</div>
                  <div className="text-xs uppercase tracking-[.25em] text-[#6B7280] mt-1">
                    {r.type} · {r.location}
                  </div>
                </div>
                <Link to="/careers" className="btn-glass text-sm">Apply
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 9. CONTACT CTA ---------- */
function ContactCTA({ data }: { data: SiteData }) {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 reveal-tilt">
        <div className="relative rounded-[2.5rem] overflow-hidden">
          <img src={data.about.image} alt="Al Muqeet technical services" className="absolute inset-0 w-full h-full object-cover opacity-35" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #2B2D31, #111827)" }} />
          <div className="absolute inset-0 bp-grid opacity-20" />
          <div className="absolute -top-24 -left-10 w-[500px] h-[500px] rounded-full"
               style={{ background: "radial-gradient(circle, rgba(214,184,90,0.45), transparent 70%)" }} />
          <Particles count={22} />
          <div className="relative p-10 md:p-16 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-[11px] tracking-[.35em] uppercase text-[#D6B85A]">08 · Begin</div>
              <h2 className="mt-3 font-display text-4xl md:text-5xl text-white leading-tight">
                Have a site, a scope,<br /> or a repair need?
              </h2>
              <p className="mt-5 text-white/70 max-w-md">
                Tell us your requirement. We'll respond within one business day with a tailored service brief.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Link to="/contact" className="btn-dark text-base">Start a project →</Link>
              <a href={`mailto:${data.contact.email}`} className="btn-glass">{data.contact.email}</a>
              <div className="text-white/50 text-xs uppercase tracking-[.3em]">{data.contact.phone}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- helpers ---------- */
export function SectionLabel({ index, title, centered = false }: { index: string; title: string; centered?: boolean }) {
  return (
    <div className={"flex items-center gap-3 " + (centered ? "justify-center" : "")}>
      <span className="font-mono-tech text-xs text-[#C8A24A]">{index}</span>
      <span className="w-10 h-px bg-gradient-to-r from-[#C8A24A] to-transparent" />
      <span className="text-[11px] uppercase tracking-[.35em] text-[#6B7280]">{title}</span>
    </div>
  );
}
