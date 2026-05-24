import { useEffect, useState } from "react";
import { Link, useRouter } from "../lib/router";
import { useSiteData } from "../lib/useSiteData";

export function Nav() {
  const { data } = useSiteData();
  const { path } = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/services", label: "Services" },
    { to: "/projects", label: "Projects" },
    { to: "/careers", label: "Careers" },
    { to: "/contact", label: "Contact" },
  ];
  if (!data || path === "/admin") return null;
  return (
    <header
      className={
        "fixed top-0 inset-x-0 z-50 transition-all duration-500 " +
        (scrolled ? "py-3" : "py-5")
      }
    >
      <div className="mx-auto max-w-7xl px-4">
        <div
          className={
            "glass rounded-full flex items-center justify-between pl-5 pr-3 py-2 transition-all " +
            (scrolled ? "shadow-xl" : "")
          }
        >
          <Link to="/" className="flex items-center gap-2.5">
            <span className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#3A3A3A] to-[#111827] ring-1 ring-[#C8A24A]/40 overflow-hidden">
              {data.brand.logoUrl ? <img src={data.brand.logoUrl} alt={data.brand.shortName} className="w-full h-full object-cover" /> : <span className="font-display text-gold-grad text-lg leading-none">AM</span>}
              <span className="absolute -inset-1 rounded-full anim-pulse-gold pointer-events-none" />
            </span>
            <div className="leading-tight">
              <div className="font-display text-[15px] tracking-widest">{data.brand.shortName}</div>
              <div className="text-[10px] uppercase tracking-[.25em] text-[#6B7280]">Technical Services LLC</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const active = path === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={
                    "relative px-4 py-2 text-sm rounded-full transition-all " +
                    (active
                      ? "text-[#1F2328] bg-white/60"
                      : "text-[#3A3D42] hover:text-[#1F2328] hover:bg-white/40")
                  }
                >
                  {l.label}
                  {active && (
                    <span className="absolute left-3 right-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-[#C8A24A] to-transparent" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/contact" className="btn-dark text-sm">
              Request Quote
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <button
              className="md:hidden w-10 h-10 rounded-full glass grid place-items-center"
              onClick={() => setOpen((v) => !v)}
              aria-label="menu"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#1F2328" strokeWidth="2">
                {open ? <path d="M6 6l12 12M18 6l-12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden mt-2 glass rounded-3xl p-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-2xl text-sm text-[#3A3D42] hover:bg-white/60"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  const { data } = useSiteData();
  const { path } = useRouter();
  if (!data || path === "/admin") return null;
  return (
    <footer className="relative mt-24 overflow-hidden">
      <div className="gold-line" />
      <div
        className="relative"
        style={{
          background:
            "linear-gradient(180deg, rgba(236,239,243,0.4), rgba(221,225,231,0.7))",
        }}
      >
        <div className="absolute inset-0 bp-grid opacity-50 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3A3A3A] to-[#111827] grid place-items-center ring-1 ring-[#C8A24A]/40 overflow-hidden">
                {data.brand.logoUrl ? <img src={data.brand.logoUrl} alt={data.brand.shortName} className="w-full h-full object-cover" /> : <span className="font-display text-gold-grad text-xl leading-none">AM</span>}
              </span>
              <div>
                <div className="font-display text-xl tracking-widest">{data.brand.legalName}</div>
                <div className="text-[11px] uppercase tracking-[.3em] text-[#6B7280]">{data.brand.location}</div>
              </div>
            </div>
            <p className="mt-5 text-[#3A3D42] text-[15px] leading-relaxed max-w-md">
              {data.brand.tagline}
            </p>
            <div className="mt-6 flex gap-2 flex-wrap">
              {data.social.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  className="px-3 py-1.5 rounded-full text-xs glass hover:ring-gold transition"
                >
                  {s.name}
                </a>
              ))}
            </div>
          </div>
          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-[.25em] text-[#6B7280] mb-4">Al Muqeet</div>
            <ul className="space-y-2 text-sm text-[#3A3D42]">
              <li><Link to="/about" className="hover:text-[#1F2328]">About</Link></li>
              <li><Link to="/services" className="hover:text-[#1F2328]">Services</Link></li>
              <li><Link to="/projects" className="hover:text-[#1F2328]">Projects</Link></li>
              <li><Link to="/careers" className="hover:text-[#1F2328]">Careers</Link></li>
            </ul>
          </div>
          <div className="md:col-span-4">
            <div className="text-xs uppercase tracking-[.25em] text-[#6B7280] mb-4">Contact</div>
            <ul className="space-y-2 text-sm text-[#3A3D42]">
              <li>{data.contact.address}</li>
              <li>{data.contact.phone}</li>
              <li>{data.contact.email}</li>
            </ul>
            <a
              href={`https://wa.me/${data.contact.whatsapp.replace(/\D/g, "")}`}
              className="mt-4 inline-flex btn-glass text-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#C8A24A] anim-pulse-gold" />
              WhatsApp Al Muqeet
            </a>
          </div>
        </div>
        <div className="border-t border-[#1F2328]/10">
          <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
            <div>© {new Date().getFullYear()} {data.brand.legalName}. All rights reserved.</div>
            <div className="font-mono-tech tracking-widest">CRAFTED · ENGINEERED · DELIVERED</div>
          </div>
        </div>
      </div>

      {/* WhatsApp floating */}
      <a
        href={`https://wa.me/${data.contact.whatsapp.replace(/\D/g, "")}`}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full grid place-items-center shadow-2xl"
        style={{ background: "linear-gradient(135deg, #2B2D31, #111827)", border: "1px solid rgba(200,162,74,0.45)" }}
        aria-label="WhatsApp"
      >
        <span className="absolute inset-0 rounded-full anim-pulse-gold pointer-events-none" />
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#D6B85A">
          <path d="M20 3.6A11 11 0 0 0 3.4 18l-1.4 5 5.1-1.3A11 11 0 1 0 20 3.6Zm-8 17.7a9.3 9.3 0 0 1-4.7-1.3l-.3-.2-3 .8.8-3-.2-.3A9.3 9.3 0 1 1 12 21.3Zm5.4-7c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2s-.8.9-1 1.1c-.2.2-.4.2-.7.1-.3-.1-1.3-.5-2.5-1.5a9.4 9.4 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.6l.5-.5.3-.4c.1-.2 0-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.7-.4h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5a17 17 0 0 0 1.7.6c.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.1-1.4 0-.1-.3-.2-.6-.3Z" />
        </svg>
      </a>
    </footer>
  );
}
