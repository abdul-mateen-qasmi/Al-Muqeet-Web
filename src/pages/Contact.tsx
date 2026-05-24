import { useState } from "react";
import type { SiteData } from "../lib/data";
import { useSiteData } from "../lib/useSiteData";
import { CoolOrb, GoldOrb, Particles } from "../components/Decor";
import { MediaFrame } from "../components/MediaFrame";
import { SiteLoader } from "../components/SiteLoader";
import { SectionLabel } from "./Home";

export default function Contact() {
  const { data, loading } = useSiteData();
  if (loading || !data) return <SiteLoader />;
  return <ContactInner data={data} />;
}

function ContactInner({ data }: { data: SiteData }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: data.services[0]?.title ?? "", message: "" });
  const [status, setStatus] = useState<"idle"|"sending"|"sent"|"error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.service || !form.message) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const r = await fetch("api.php?action=message", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, page: "contact", ts: Date.now(), source: "website" }),
      });
      if (r.ok) { setStatus("sent"); setForm({ name:"", email:"", phone:"", service: data.services[0]?.title ?? "", message:"" }); return; }
      setStatus("error");
    } catch {
      // graceful local fallback
      try {
        const list = JSON.parse(localStorage.getItem("almuqeet_messages") || "[]");
        list.push({ ...form, ts: Date.now() });
        localStorage.setItem("almuqeet_messages", JSON.stringify(list));
        setStatus("sent");
        setForm({ name:"", email:"", phone:"", service: data.services[0]?.title ?? "", message:"" });
      } catch { setStatus("error"); }
    }
  };

  return (
    <main className="pt-32 pb-24">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bp-grid opacity-50 pointer-events-none" />
        <GoldOrb className="w-[500px] h-[500px] -top-20 -right-20" />
        <CoolOrb className="w-[400px] h-[400px] top-40 -left-20" />
        <Particles count={18} />

        <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 reveal">
            <SectionLabel index="01" title="Contact" />
            <h1 className="mt-6 font-display text-5xl md:text-6xl leading-[1.02]">
              <span className="text-silver-grad">Tell us about</span><br />
              <span className="text-gold-grad">your project.</span>
            </h1>
            <p className="mt-6 text-[#3A3D42] text-lg leading-relaxed max-w-md">
              Office hours Mon - Sat, 8:00 AM - 6:00 PM GST. We respond within one business day.
            </p>

            <div className="mt-10 space-y-4">
              <InfoRow label="Location" value={data.contact.address} />
              <InfoRow label="Phone" value={data.contact.phone} />
              <InfoRow label="Email" value={data.contact.email} />
              <InfoRow label="WhatsApp" value={data.contact.whatsapp} />
            </div>

            <div className="mt-8 flex gap-2">
              {data.social.map(s => (
                <a key={s.name} href={s.url} className="px-3 py-1.5 rounded-full text-xs glass hover:ring-gold transition">{s.name}</a>
              ))}
            </div>
            <div className="mt-10 reveal-tilt">
              <MediaFrame src="/images/almuqeet-contact.png" alt="Al Muqeet contact scene" eyebrow="Ajman, UAE" caption={data.contact.hours} className="aspect-[16/8]" />
            </div>
          </div>

          <div className="lg:col-span-7 reveal-tilt">
            <form onSubmit={submit} className="glass rounded-[2rem] p-7 md:p-9 relative overflow-hidden">
              <div className="absolute inset-0 bp-grid opacity-25 pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between text-[10px] font-mono-tech text-[#6B7280]">
                  <span>AL MUQEET / INTAKE 01</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8A24A] anim-pulse-gold" /> SECURE
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <Field label="Full name" value={form.name} onChange={(v)=>setForm({...form, name:v})} />
                  <Field label="Email" type="email" value={form.email} onChange={(v)=>setForm({...form, email:v})} />
                </div>
                <div className="mt-4">
                  <Field label="Phone" value={form.phone} onChange={(v)=>setForm({...form, phone:v})} />
                </div>
                <div className="mt-4">
                  <label className="text-[11px] uppercase tracking-[.3em] text-[#6B7280]">Service interested</label>
                  <select
                    required value={form.service}
                    onChange={(e)=>setForm({...form, service:e.target.value})}
                    className="mt-2 w-full bg-white/50 border border-[#1F2328]/10 rounded-2xl px-4 py-3 text-[#1F2328] outline-none focus:border-[#C8A24A] transition"
                  >
                    {data.services.map((s) => <option key={s.title} value={s.title}>{s.title}</option>)}
                  </select>
                </div>
                <div className="mt-4">
                  <label className="text-[11px] uppercase tracking-[.3em] text-[#6B7280]">Message</label>
                  <textarea
                    required rows={6} value={form.message}
                    onChange={(e)=>setForm({...form, message:e.target.value})}
                    placeholder="Site, scope, location, target date, and any technical requirements…"
                    className="mt-2 w-full bg-white/50 border border-[#1F2328]/10 rounded-2xl p-4 text-[#1F2328] outline-none focus:border-[#C8A24A] transition"
                  />
                </div>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <div className="text-xs text-[#6B7280]">By submitting you agree to our privacy notice.</div>
                  <button type="submit" disabled={status==="sending"} className="btn-dark">
                    {status === "sending" ? "Sending…" : status === "sent" ? "Sent ✓" : "Send brief"}
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </button>
                </div>
                {status === "sent" && (
                  <div className="mt-4 text-sm text-[#1F2328]">
                    Thank you — we'll respond shortly.
                  </div>
                )}
                {status === "error" && (
                  <div className="mt-4 text-sm text-red-700">Something went wrong. Please email {data.contact.email}.</div>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({ label, value, onChange, type = "text" }:
  { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-[.3em] text-[#6B7280]">{label}</label>
      <input
        required type={type} value={value} onChange={(e)=>onChange(e.target.value)}
        className="mt-2 w-full bg-white/50 border border-[#1F2328]/10 rounded-2xl px-4 py-3 text-[#1F2328] outline-none focus:border-[#C8A24A] transition"
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-[10px] uppercase tracking-[.3em] text-[#6B7280] w-24 pt-1">{label}</div>
      <div className="text-[#1F2328] flex-1">{value}</div>
    </div>
  );
}
