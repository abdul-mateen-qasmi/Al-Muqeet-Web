import { useSiteData } from "../lib/useSiteData";
import { CoolOrb, GoldOrb, Particles } from "../components/Decor";
import { MediaFrame } from "../components/MediaFrame";
import { SiteLoader } from "../components/SiteLoader";
import { SectionLabel } from "./Home";

export default function Careers() {
  const { data, loading } = useSiteData();
  if (loading || !data) return <SiteLoader />;
  const perks = [
    { t: "Company Growth", d: "Learning support, site exposure and a clear progression path." },
    { t: "Craft Time", d: "Time reserved for skill-building and technical improvement." },
    { t: "Travel", d: "Project visits and coordination across UAE job sites." },
    { t: "Tools", d: "Reliable hardware, site support and practical working tools." },
  ];
  return (
    <main className="pt-32 pb-24">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bp-grid opacity-50 pointer-events-none" />
        <GoldOrb className="w-[500px] h-[500px] -top-20 -right-20" />
        <CoolOrb className="w-[420px] h-[420px] top-40 -left-20" />
        <Particles count={18} />
        <div className="relative mx-auto max-w-7xl px-6 reveal">
          <SectionLabel index="01" title="Careers" />
          <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.02] max-w-4xl">
            <span className="text-silver-grad">Build with a company of</span>{" "}
            <span className="text-gold-grad">craft and ambition.</span>
          </h1>
          <p className="mt-6 text-[#3A3D42] text-lg max-w-2xl leading-relaxed">
            We hire for craft, discipline and accountability. Join a technical services team serving projects across Ajman and the UAE.
          </p>
          <div className="mt-10 max-w-4xl reveal-tilt">
            <MediaFrame src="/images/almuqeet-careers.png" alt="Al Muqeet team" eyebrow="Growth and manpower" caption="Skilled manpower support, technicians and site teams." className="aspect-[16/7]" />
          </div>
        </div>
      </section>

      <section className="relative py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="reveal flex items-end justify-between">
            <SectionLabel index="02" title="Open Roles" />
            <div className="text-xs uppercase tracking-[.3em] text-[#6B7280]">{data.careers.length} roles</div>
          </div>
          <div className="mt-8 space-y-3">
            {data.careers.map((r, i) => (
              <div key={i} className="reveal">
                <div className="glass rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:ring-gold transition group">
                  <div>
                    <div className="font-display text-xl">{r.role}</div>
                    <div className="text-xs uppercase tracking-[.25em] text-[#6B7280] mt-1.5">
                      {r.type} · {r.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-[11px] uppercase tracking-[.25em] glass rounded-full">Al Muqeet</span>
                    <a className="btn-dark text-sm" href={`mailto:${data.contact.email}`}>Apply →</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="reveal">
            <SectionLabel index="03" title="Perks" />
            <h2 className="font-display text-4xl mt-4">
              <span className="text-silver-grad">Benefits as crafted as</span>{" "}
              <span className="text-gold-grad">our buildings.</span>
            </h2>
          </div>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {perks.map((p, i) => (
              <div key={i} className="reveal-tilt">
                <div className="tilt-card glass rounded-3xl p-6 h-full">
                  <div className="font-mono-tech text-xs text-[#C8A24A]">0{i+1}</div>
                  <div className="font-display text-xl mt-3">{p.t}</div>
                  <p className="text-[#3A3D42] text-sm mt-2 leading-relaxed">{p.d}</p>
                  <div className="gold-line mt-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
