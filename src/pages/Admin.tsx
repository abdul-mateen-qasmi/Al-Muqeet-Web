import { useEffect, useState, useCallback } from "react";
import type { SiteData, Snippet } from "../lib/data";
import { saveSiteData, loadSiteData } from "../lib/data";
import { setSiteDataCache, useSiteData } from "../lib/useSiteData";
import { SiteLoader } from "../components/SiteLoader";
import { GoldOrb, CoolOrb } from "../components/Decor";
import AIProjectInspector from "../components/admin/AIProjectInspector";
import CommandCenterV2 from "../components/admin/CommandCenterV2";
import IssueChecker from "../components/admin/IssueChecker";

/* ---------- Tab tree ---------- */
type Tab =
  "dashboard" | "brand" | "favicon" | "menu" | "hero" | "hero_images" | "hero_video" |
  "hero_3d" | "hero_cards" | "sections" | "services" | "about" | "projects" |
  "careers" | "contact" | "social" | "footer" | "theme" | "fonts" | "spacing" |
  "animations" | "seo" | "media" | "messages" | "quotes" | "snippets" |
  "command_center" | "backup" | "activity" | "system" | "users" | "announcement" | "ai_inspector" | "diagnostics";

const sidebar: { id: Tab; label: string; group: string }[] =[
  { id: "dashboard", label: "Dashboard", group: "Overview" },
  { id: "brand", label: "Logo & Branding", group: "Brand" },
  { id: "favicon", label: "Favicon", group: "Brand" },
  { id: "announcement", label: "Announcement Bar", group: "Brand" },
  { id: "menu", label: "Header Menu", group: "Navigation" },
  { id: "hero", label: "Hero Section", group: "Hero" },
  { id: "hero_images", label: "Hero Images", group: "Hero" },
  { id: "hero_video", label: "Hero Video", group: "Hero" },
  { id: "hero_3d", label: "Hero 3D / Motion", group: "Hero" },
  { id: "hero_cards", label: "Floating Cards", group: "Hero" },
  { id: "sections", label: "Page Sections", group: "Content" },
  { id: "services", label: "Services", group: "Content" },
  { id: "about", label: "About", group: "Content" },
  { id: "projects", label: "Projects", group: "Content" },
  { id: "careers", label: "Careers", group: "Content" },
  { id: "contact", label: "Contact Info", group: "Content" },
  { id: "social", label: "Social Buttons", group: "Content" },
  { id: "footer", label: "Footer", group: "Content" },
  { id: "seo", label: "SEO", group: "Settings" },
  { id: "theme", label: "Theme Colors", group: "Settings" },
  { id: "fonts", label: "Fonts & Typography", group: "Settings" },
  { id: "spacing", label: "Spacing & Layout", group: "Settings" },
  { id: "animations", label: "Animations & Motion", group: "Settings" },
  { id: "ai_inspector", label: "🔍 AI Inspector", group: "AI Tools" },
  { id: "command_center", label: "⚡ Command Center", group: "AI Tools" },
  { id: "snippets", label: "CSS / JS / HTML", group: "Developer" },
  { id: "media", label: "Media Library", group: "Tools" },
  { id: "messages", label: "Messages Inbox", group: "Tools" },
  { id: "backup", label: "Backup & Restore", group: "Tools" },
  { id: "activity", label: "Activity Logs", group: "Tools" },
  { id: "diagnostics", label: "🩺 Issue Checker", group: "Admin" },
  { id: "users", label: "Users & Password", group: "Admin" },
  { id: "system", label: "System Health", group: "Admin" },
];

/* ---------- Admin Component ---------- */
export default function Admin() {
  const { data, loading } = useSiteData();
  if (loading || !data) return <SiteLoader />;
  return <AdminInner data={data} />;
}

function AdminInner({ data }: { data: SiteData }) {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const[err, setErr] = useState("");
  const [draft, setDraft] = useState<SiteData>(data);
  const [tab, setTab] = useState<Tab>("dashboard");
  const[saveState, setSaveState] = useState<"idle"|"saving"|"saved"|"error">("idle");
  const[, setSaveVia] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [backups, setBackups] = useState<any[]>([]);
  const[activity, setActivity] = useState<any[]>([]);
  const [,] = useState<string[]>([]); // placeholder
  const [username, setUsername] = useState("admin");
  const [loggedInUser, setLoggedInUser] = useState("admin");

  useEffect(() => { setDraft(data); }, [data]);

  useEffect(() => {
    if (!authed) return;
    fetch("api.php?action=messages", { credentials: "include" }).then(r => r.ok ? r.json() :[]).then(setMessages).catch(()=>{});
    fetch("api.php?action=backups", { credentials: "include" }).then(r => r.ok ? r.json() :[]).then(setBackups).catch(()=>{});
    fetch("api.php?action=activity", { credentials: "include" }).then(r => r.ok ? r.json() : []).then(setActivity).catch(()=>{});
  }, [authed]);

  const tryLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    try {
      const r = await fetch("api.php?action=login", {
        method: "POST", 
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: pwd }),
      });
      if (r.ok) { 
        setAuthed(true); 
        setLoggedInUser(username); 
        return; 
      }
      // Server login failed — show error, do NOT fake login
      const errData = await r.json().catch(() => ({}));
      setErr(errData.error || "Invalid credentials. Please check username and password.");
    } catch (e) {
      setErr("Cannot connect to server. Please check your connection and try again.");
    }
  };

  const save = async () => {
    setSaveState("saving");
    const r = await saveSiteData(draft);
    setSaveVia(r.via);
    // Push saved draft straight into the cache so public pages see it
    // without forcing a refetch (which would unmount this component and
    // wipe the authed state).
    if (r.ok) setSiteDataCache(draft);
    setSaveState(r.ok ? "saved" : "error");
    setTimeout(()=>setSaveState("idle"), 2500);
  };

  const reset = async () => {
    try {
      const fresh = await loadSiteData();
      setDraft(fresh);
    } catch {
      setDraft(data);
    }
  };

  const set = useCallback((path: string, val: any) => {
    setDraft((d) => {
      const c = JSON.parse(JSON.stringify(d));
      const keys = path.split(".");
      let o: any = c;
      for (let i = 0; i < keys.length - 1; i++) {
        if (o[keys[i]] === undefined) { o[keys[i]] = {}; }
        o = o[keys[i]];
      }
      o[keys[keys.length - 1]] = val;
      return c;
    });
  },[]);

  const reloadDataFromServer = async () => {
    try {
      const freshData = await loadSiteData();
      setDraft(freshData);
      setSiteDataCache(freshData);
    } catch (e) {
      console.error("Failed to reload data after command apply");
    }
  };

  /* ---------- Login screen ---------- */
  if (!authed) {
    return (
      <main className="pt-32 pb-24 min-h-screen relative overflow-hidden">
        <GoldOrb className="w-[420px] h-[420px] -top-20 -right-20" />
        <CoolOrb className="w-[400px] h-[400px] top-40 -left-20" />
        <div className="absolute inset-0 bp-grid opacity-40" />
        <div className="relative mx-auto max-w-md px-6">
          <div className="glass rounded-[2rem] p-8">
            <div className="text-[11px] tracking-[.35em] uppercase text-[#C8A24A]">Al Muqeet · Admin Panel</div>
            <h1 className="font-display text-3xl mt-3"><span className="text-silver-grad">Sign in to the </span><span className="text-gold-grad">admin panel.</span></h1>
            <form onSubmit={tryLogin} className="mt-6 space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-[.3em] text-[#6B7280]">Username</label>
                <input value={username} onChange={(e)=>setUsername(e.target.value)} className="mt-2 w-full bg-white/50 border border-[#1F2328]/10 rounded-2xl px-4 py-3 outline-none focus:border-[#C8A24A]" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[.3em] text-[#6B7280]">Password</label>
                <input type="password" value={pwd} onChange={(e)=>setPwd(e.target.value)} className="mt-2 w-full bg-white/50 border border-[#1F2328]/10 rounded-2xl px-4 py-3 outline-none focus:border-[#C8A24A]" placeholder="Enter password" />
              </div>
              {err && <div className="text-sm text-red-700">{err}</div>}
              <button className="btn-dark w-full justify-center">Enter Admin →</button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  const sidebarGroups = sidebar.reduce((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s);
    return acc;
  }, {} as Record<string, typeof sidebar>);

  return (
    <main className="min-h-screen relative pb-16" style={{ background: "#ECEFF3" }}>
      {/* top bar */}
      <div className="sticky top-0 z-50 glass rounded-b-2xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3A3A3A] to-[#111827] grid place-items-center ring-1 ring-[#C8A24A]/40">
            <span className="font-display text-gold-grad text-sm leading-none">AM</span>
          </span>
          <div className="leading-tight">
            <div className="font-display text-sm tracking-widest">AL MUQEET TECH</div>
            <div className="text-[9px] uppercase tracking-[.3em] text-[#6B7280]">Admin Panel</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[11px] font-mono-tech text-[#6B7280]">{loggedInUser}</div>
          <a href="/preview/" target="_blank" className="btn-glass text-xs">View Site</a>
          <button onClick={reset} className="btn-glass text-xs">Reset</button>
          <button onClick={save} className="btn-dark text-xs" disabled={saveState==="saving"}>
            {saveState==="saving"?"Publishing…":saveState==="saved"?`Published ✓`:"Save & Publish"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6 grid lg:grid-cols-12 gap-6">
        {/* sidebar */}
        <aside className="lg:col-span-3">
          <div className="glass rounded-2xl p-2 sticky top-24 max-h-[80vh] overflow-y-auto no-scrollbar">
            {Object.entries(sidebarGroups).map(([group, items]) => (
              <div key={group} className="mb-2">
                <div className="text-[9px] uppercase tracking-[.3em] text-[#6B7280] px-3 py-1.5">{group}</div>
                {items.map(s => (
                  <button key={s.id} onClick={()=>setTab(s.id)}
                    className={"w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition " +
                      (tab===s.id ? "bg-[#1F2328] text-white" : "text-[#3A3D42] hover:bg-white/60")}>
                    <span>{s.label}</span>
                    {tab===s.id && <span className="text-[#D6B85A]">●</span>}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* content panel */}
        <section className="lg:col-span-9 space-y-5">
          {tab==="dashboard" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Services" value={draft.services.filter(s=>s.enabled).length} icon="S" />
                <StatCard label="Projects" value={draft.projects.filter(p=>p.enabled).length} icon="P" />
                <StatCard label="Messages" value={messages.length} icon="M" />
                <StatCard label="Sections" value={Object.values(draft.sections).flatMap(o=>Object.values(o)).filter(Boolean).length} icon="SE" />
              </div>
              <Card title="Quick Actions">
                <div className="flex flex-wrap gap-2">
                  <button onClick={()=>setTab("hero")} className="btn-glass text-xs">Edit Hero</button>
                  <button onClick={()=>setTab("services")} className="btn-glass text-xs">Services</button>
                  <button onClick={()=>setTab("projects")} className="btn-glass text-xs">Projects</button>
                  <button onClick={()=>setTab("media")} className="btn-glass text-xs">Media Library</button>
                  <button onClick={()=>setTab("messages")} className="btn-glass text-xs">Messages</button>
                  <button onClick={()=>setTab("backup")} className="btn-glass text-xs">Backup</button>
                  <button onClick={()=>setTab("ai_inspector")} className="btn-glass text-xs">AI Inspector</button>
                  <button onClick={()=>setTab("command_center")} className="btn-glass text-xs">Command Center</button>
                  <button onClick={()=>setTab("diagnostics")} className="btn-glass text-xs">Diagnostics</button>
                  <a href="/preview/" target="_blank" className="btn-dark text-xs">View Website</a>
                </div>
              </Card>
              <Card title="Live Preview">
                <iframe src="/preview/" className="w-full h-[400px] rounded-2xl border border-[#1F2328]/10" title="preview" />
              </Card>
            </>
          )}

          {tab==="brand" && (
            <Card title="Logo & Branding">
              <Input label="Company Name" value={draft.brand.name} onChange={v=>set("brand.name", v)} />
              <Input label="Short Name" value={draft.brand.shortName} onChange={v=>set("brand.shortName", v)} />
              <Input label="Legal Name" value={draft.brand.legalName} onChange={v=>set("brand.legalName", v)} />
              <Input label="Tagline" value={draft.brand.tagline} onChange={v=>set("brand.tagline", v)} />
              <Input label="Location" value={draft.brand.location} onChange={v=>set("brand.location", v)} />
              <Input label="Logo Image URL" value={draft.brand.logoUrl} onChange={v=>set("brand.logoUrl", v)} />
              <div className="text-xs text-[#6B7280]">If empty, initial "AM" will show.</div>
            </Card>
          )}

          {tab==="favicon" && (
            <Card title="Favicon">
              <Input label="Favicon URL" value={draft.brand.faviconUrl} onChange={v=>set("brand.faviconUrl", v)} />
              <div className="text-xs text-[#6B7280]">Upload via Media Library, then paste URL. Recommended: 32x32 PNG.</div>
            </Card>
          )}

          {tab==="announcement" && (
            <Card title="Announcement Bar">
              <Toggle label="Enabled" value={draft.announcementBar.enabled} onChange={v=>set("announcementBar.enabled", v)} />
              <Input label="Announcement Text" value={draft.announcementBar.text} onChange={v=>set("announcementBar.text", v)} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Background Color" value={draft.announcementBar.bgColor} onChange={v=>set("announcementBar.bgColor", v)} />
                <Input label="Text Color" value={draft.announcementBar.textColor} onChange={v=>set("announcementBar.textColor", v)} />
              </div>
            </Card>
          )}

          {tab==="hero" && (
            <Card title="Hero Section">
              <Input label="Badge / Eyebrow" value={draft.hero.eyebrow} onChange={v=>set("hero.eyebrow", v)} />
              <Input label="Headline" value={draft.hero.title} onChange={v=>set("hero.title", v)} />
              <Textarea label="Subtitle" value={draft.hero.sub} onChange={v=>set("hero.sub", v)} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="CTA Primary" value={draft.hero.ctaPrimary} onChange={v=>set("hero.ctaPrimary", v)} />
                <Input label="CTA Secondary" value={draft.hero.ctaSecondary} onChange={v=>set("hero.ctaSecondary", v)} />
              </div>
              <Input label="Overlay Title" value={draft.hero.overlayTitle} onChange={v=>set("hero.overlayTitle", v)} />
              <Textarea label="Overlay Copy" value={draft.hero.overlayCopy} onChange={v=>set("hero.overlayCopy", v)} />
              <div className="mt-4 gold-line" />
              <div className="text-[11px] uppercase tracking-[.3em] text-[#C8A24A] mt-4">Background Mode</div>
              <select value={draft.hero.heroBgMode} onChange={e=>set("hero.heroBgMode", e.target.value)}
                className="mt-2 w-full bg-white/50 border border-[#1F2328]/10 rounded-xl px-4 py-2.5 outline-none">
                <option value="static">Static Image</option>
                <option value="slider">Image Slider</option>
                <option value="video">Video Background</option>
                <option value="3d">3D Scene Mode</option>
                <option value="gradient">Gradient Mode</option>
                <option value="custom">Custom HTML Embed</option>
              </select>
              <Input label="Hero Image URL" value={draft.hero.image} onChange={v=>set("hero.image", v)} />
              <Input label="Hero Video URL" value={draft.hero.video} onChange={v=>set("hero.video", v)} />
              <Input label="Mobile Fallback Image" value={draft.hero.mobileFallback} onChange={v=>set("hero.mobileFallback", v)} />
            </Card>
          )}

          {tab==="hero_images" && (
            <ListEditor
              title="Hero Images (Slide Mode)"
              items={draft.media.heroImages}
              fields={[
                { key: "url", label: "Image URL" },
                { key: "alt", label: "Alt Text" },
                { key: "enabled", label: "Enabled", boolean: true },
              ]}
              onChange={(items)=>setDraft({...draft, media: {...draft.media, heroImages: items as any}})}
              emptyItem={{ url: "/images/almuqeet-hero.png", alt: "Hero slide", enabled: true }}
            />
          )}

          {tab==="hero_video" && (
            <ListEditor
              title="Hero Videos"
              items={draft.media.heroVideos}
              fields={[
                { key: "url", label: "Video URL" },
                { key: "poster", label: "Poster Image URL" },
                { key: "enabled", label: "Enabled", boolean: true },
              ]}
              onChange={(items)=>setDraft({...draft, media: {...draft.media, heroVideos: items as any}})}
              emptyItem={{ url: "", poster: "", enabled: true }}
            />
          )}

          {tab==="hero_3d" && (
            <Card title="Hero 3D / Motion Controls">
              <Toggle label="Enable 3D Objects" value={draft.hero.enable3d} onChange={v=>set("hero.enable3d", v)} />
              <Toggle label="Enable Particles" value={draft.hero.enableParticles} onChange={v=>set("hero.enableParticles", v)} />
              <Toggle label="Blueprint Grid" value={draft.hero.enableGrid} onChange={v=>set("hero.enableGrid", v)} />
              <Input label="Spline iframe URL" value={draft.media.splineUrl} onChange={v=>set("media.splineUrl", v)} />
              <Input label="Lottie JSON URL" value={draft.media.lottieUrl} onChange={v=>set("media.lottieUrl", v)} />
              <div className="text-xs text-[#6B7280]">Disable 3D on mobile if performance lags.</div>
            </Card>
          )}

          {tab==="hero_cards" && (
            <>
              <Card title="Floating Cards Settings">
                <Toggle label="Enable Floating Cards" value={draft.floatingCards.enabled} onChange={v=>set("floatingCards.enabled", v)} />
              </Card>
              <ListEditor
                title="Floating Cards"
                items={draft.floatingCards.cards}
                fields={[
                  { key: "title", label: "Title" },
                  { key: "icon", label: "Icon" },
                  { key: "content", label: "Content" },
                  { key: "position", label: "Position (left/right)" },
                  { key: "enabled", label: "Enabled", boolean: true },
                ]}
                onChange={(items)=>setDraft({...draft, floatingCards: {...draft.floatingCards, cards: items as any}})}
                emptyItem={{ title: "New Card", icon: "gear", content: "Details", position: "left", enabled: true }}
              />
            </>
          )}

          {tab==="services" && (
            <ListEditor
              title="Services"
              items={draft.services}
              fields={[
                { key: "icon", label: "Icon" },
                { key: "title", label: "Title" },
                { key: "short", label: "Short" },
                { key: "desc", label: "Description", textarea: true },
                { key: "category", label: "Category" },
                { key: "image", label: "Image URL" },
                { key: "featured", label: "Featured", boolean: true },
                { key: "enabled", label: "Enabled", boolean: true },
              ]}
              onChange={(items)=>setDraft({...draft, services: items as any})}
              emptyItem={{ icon: "tower", title: "New Service", short: "", desc: "", category: "General", image: "/images/almuqeet-services.png", featured: false, enabled: true }}
            />
          )}

          {tab==="about" && (
            <Card title="About">
              <Input label="Title" value={draft.about.title} onChange={v=>set("about.title", v)} />
              <Textarea label="Intro" value={draft.about.intro} onChange={v=>set("about.intro", v)} />
              <Textarea label="Mission" value={draft.about.mission} onChange={v=>set("about.mission", v)} />
              <Textarea label="Vision" value={draft.about.vision} onChange={v=>set("about.vision", v)} />
              <Textarea label="Quality" value={draft.about.quality} onChange={v=>set("about.quality", v)} />
              <Textarea label="Safety" value={draft.about.safety} onChange={v=>set("about.safety", v)} />
              <Input label="Image URL" value={draft.about.image} onChange={v=>set("about.image", v)} />
            </Card>
          )}

          {tab==="projects" && (
            <ListEditor
              title="Projects"
              items={draft.projects}
              fields={[
                { key: "title", label: "Title" },
                { key: "type", label: "Type" },
                { key: "year", label: "Year" },
                { key: "location", label: "Location" },
                { key: "short", label: "Short" },
                { key: "desc", label: "Description", textarea: true },
                { key: "image", label: "Image URL" },
                { key: "featured", label: "Featured", boolean: true },
                { key: "enabled", label: "Enabled", boolean: true },
              ]}
              onChange={(items)=>setDraft({...draft, projects: items as any})}
              emptyItem={{ title: "New Project", type: "Reference", year: "2025", location: "UAE", short: "", desc: "", image: "/images/almuqeet-projects.png", featured: false, enabled: true }}
            />
          )}

          {tab==="careers" && (
            <ListEditor
              title="Open Roles"
              items={draft.careers}
              fields={[
                { key: "role", label: "Role" },
                { key: "type", label: "Type" },
                { key: "location", label: "Location" },
                { key: "desc", label: "Description", textarea: true },
                { key: "featured", label: "Featured", boolean: true },
              ]}
              onChange={(items)=>setDraft({...draft, careers: items as any})}
              emptyItem={{ role: "New Role", type: "Full-time", location: "Ajman", desc: "", featured: false }}
            />
          )}

          {tab==="contact" && (
            <Card title="Contact Info">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Phone" value={draft.contact.phone} onChange={v=>set("contact.phone", v)} />
                <Input label="Email" value={draft.contact.email} onChange={v=>set("contact.email", v)} />
              </div>
              <Input label="WhatsApp" value={draft.contact.whatsapp} onChange={v=>set("contact.whatsapp", v)} />
              <Textarea label="Address" value={draft.contact.address} onChange={v=>set("contact.address", v)} />
              <Input label="Working Hours" value={draft.contact.hours} onChange={v=>set("contact.hours", v)} />
              <Input label="Google Map Embed URL" value={draft.contact.mapEmbed} onChange={v=>set("contact.mapEmbed", v)} />
            </Card>
          )}

          {tab==="social" && (
            <ListEditor
              title="Social Buttons"
              items={draft.social}
              fields={[
                { key: "name", label: "Name" },
                { key: "url", label: "URL" },
              ]}
              onChange={(items)=>setDraft({...draft, social: items as any})}
              emptyItem={{ name: "Channel", url: "#" }}
            />
          )}

          {tab==="footer" && (
            <Card title="Footer">
              <div className="text-sm text-[#3A3D42]">Footer content is generated from Brand, Contact, Social and Services data above. Custom footer fields coming soon.</div>
              <Input label="Copyright Name" value={draft.brand.legalName} onChange={v=>set("brand.legalName", v)} />
            </Card>
          )}

          {tab==="theme" && <ThemePanel draft={draft} set={set} />}
          {tab==="fonts" && <FontsPanel draft={draft} set={set} />}

          {tab==="spacing" && (
            <Card title="Spacing & Layout">
              <div className="text-sm text-[#3A3D42]">Adjust glass blur and shadow. Full spacing controls coming soon.</div>
              <Input label="Glass Blur" value={draft.theme.blur} onChange={v=>set("theme.blur", v)} />
              <Input label="Shadow" value={draft.theme.shadow} onChange={v=>set("theme.shadow", v)} />
            </Card>
          )}

          {tab==="animations" && (
            <Card title="Animations & Motion">
              <Toggle label="Enable Scrolling Reveal" value={true} onChange={()=>{}} locked />
              <Toggle label="Enable 3D Tilt Cards" value={true} onChange={()=>{}} locked />
              <Toggle label="Enable Particles" value={draft.hero.enableParticles} onChange={v=>set("hero.enableParticles", v)} />
              <div className="text-xs text-[#6B7280] mt-3">Animation controls are active on the frontend. Disable 3D/particles for mobile performance.</div>
            </Card>
          )}

          {tab==="seo" && <SEOPanel draft={draft} set={set} />}

          {tab==="ai_inspector" && <AIProjectInspector />}

          {tab==="command_center" && <CommandCenterV2 onDataChanged={reloadDataFromServer} />}

          {tab==="diagnostics" && <IssueChecker />}

          {tab==="snippets" && <SnippetsPanel draft={draft} setDraft={setDraft} />}

          {tab==="media" && <MediaPanel />}

          {tab==="messages" && (
            <Card title="Messages Inbox">
              {messages.length === 0
                ? <div className="text-sm text-[#6B7280]">No messages yet.</div>
                : <div className="space-y-3">
                    {messages.map((m, i) => (
                      <div key={i} className="rounded-2xl bg-white/50 p-4 border border-[#1F2328]/10">
                        <div className="flex items-center justify-between text-xs text-[#6B7280]">
                          <div className="flex gap-2">
                            <span className={`w-2 h-2 rounded-full ${m.status==="unread" ? "bg-[#D6B85A]" : "bg-transparent"}`} />
                            <strong>{m.name}</strong> · {m.email} · {m.phone||m.company}
                          </div>
                          <div>{new Date(m.ts || Date.now()).toLocaleString()}</div>
                        </div>
                        <div className="text-[11px] uppercase tracking-[.2em] text-[#C8A24A] mt-1">{m.service}</div>
                        <div className="mt-2 text-sm text-[#1F2328]">{m.message}</div>
                        <div className="mt-2 flex gap-2">
                          <button onClick={()=>{ fetch("api.php?action=mark_message", {method:"POST", credentials: "include", headers:{"Content-Type":"application/json"},body:JSON.stringify({index:i,status:m.status==="unread"?"read":"unread"})}).then(()=>{const a=[...messages];a[i]={...a[i],status:a[i].status==="unread"?"read":"unread"};setMessages(a);})}} className="text-[10px] uppercase tracking-[.2em] text-[#6B7280] hover:text-[#1F2328]">{m.status==="unread"?"Mark read":"Mark unread"}</button>
                          <button onClick={()=>{ fetch("api.php?action=delete_message",{method:"POST", credentials: "include", headers:{"Content-Type":"application/json"},body:JSON.stringify({index:i})}).then(()=>setMessages(messages.filter((_,j)=>j!==i)));}} className="text-[10px] uppercase tracking-[.2em] text-red-600">Delete</button>
                          <a href={`mailto:${m.email}`} className="text-[10px] uppercase tracking-[.2em] text-[#C8A24A]">Reply</a>
                        </div>
                      </div>
                    ))}
                  </div>}
              <div className="mt-4">
                <a href="api.php?action=read_csv_messages" className="btn-glass text-xs" target="_blank">Export CSV</a>
              </div>
            </Card>
          )}

          {tab==="backup" && (
            <Card title="Backup & Restore">
              <div className="flex gap-2">
                <button onClick={async()=>{const r=await fetch("api.php?action=backup",{method:"POST", credentials: "include"}); if(r.ok) alert("Backup created."); fetch("api.php?action=backups", { credentials: "include" }).then(re=>re.ok?re.json():[]).then(setBackups);}} className="btn-dark text-sm">Create Backup</button>
              </div>
              {backups.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-xs uppercase tracking-[.3em] text-[#6B7280]">Snapshots</div>
                  {backups.map((b, i) => (
                    <div key={i} className="flex items-center justify-between rounded-2xl bg-white/40 p-3 border border-[#1F2328]/10">
                      <div className="text-xs font-mono-tech">{b.name}</div>
                      <div className="flex gap-2">
                        <a href={b.url} download className="text-[10px] uppercase tracking-[.2em] text-[#C8A24A]">Download</a>
                        <button onClick={async()=>{if(confirm("Restore this backup? Current data will be backed up automatically.")){await fetch("api.php?action=restore_backup",{method:"POST", credentials: "include", headers:{"Content-Type":"application/json"},body:JSON.stringify({file:b.name})});alert("Restored.");location.reload();}}} className="text-[10px] uppercase tracking-[.2em] text-[#1F2328]">Restore</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {tab==="activity" && (
            <Card title="Activity Logs">
              {activity.length === 0
                ? <div className="text-sm text-[#6B7280]">No activity recorded.</div>
                : <div className="space-y-2 max-h-96 overflow-y-auto">
                    {activity.slice().reverse().map((a, i) => (
                      <div key={i} className="flex items-center justify-between text-xs border-b border-[#1F2328]/10 py-2 text-[#3A3D42]">
                        <span className="font-mono-tech">{a.action}</span>
                        <span className="text-[#6B7280]">{a.detail}</span>
                        <span className="text-[#6B7280]">{new Date(a.ts).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>}
            </Card>
          )}

          {tab==="users" && (
            <Card title="Users & Password">
              <p className="text-sm text-[#3A3D42]">Change your admin password. Always change before going live.</p>
              <form onSubmit={async(e)=>{
                e.preventDefault();
                const fd = new FormData(e.target as HTMLFormElement);
                const r = await fetch("api.php?action=change_password", {
                  method: "POST",
                  credentials: "include",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ old: fd.get("old"), new: fd.get("new") }),
                });
                if (r.ok) alert("Password changed successfully.");
                else alert("Failed. Check old password.");
              }} className="mt-4 space-y-3">
                <input name="old" type="password" placeholder="Current password" className="w-full bg-white/50 border border-[#1F2328]/10 rounded-xl px-4 py-2 outline-none" />
                <input name="new" type="password" placeholder="New password" className="w-full bg-white/50 border border-[#1F2328]/10 rounded-xl px-4 py-2 outline-none" />
                <button className="btn-dark text-sm">Change Password</button>
              </form>
            </Card>
          )}

          {tab==="system" && <SystemHealth />}
        </section>
      </div>
    </main>
  );
}

/* ---------- Sub-components ---------- */

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="font-display text-2xl text-gold-grad">{value}</div>
      <div className="flex items-center gap-2 mt-1">
        <span className="w-5 h-5 rounded-md bg-[#1F2328] grid place-items-center text-[10px] text-white">{icon}</span>
        <div className="text-[10px] uppercase tracking-[.25em] text-[#6B7280]">{label}</div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-[11px] uppercase tracking-[.35em] text-[#C8A24A]">{title}</div>
        <span className="gold-line flex-1" />
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string)=>void }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-[.3em] text-[#6B7280]">{label}</label>
      <input value={value} onChange={(e)=>onChange(e.target.value)}
        className="mt-1 w-full bg-white/60 border border-[#1F2328]/10 rounded-xl px-4 py-2.5 outline-none focus:border-[#C8A24A] transition" />
    </div>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string)=>void }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-[.3em] text-[#6B7280]">{label}</label>
      <textarea rows={3} value={value} onChange={(e)=>onChange(e.target.value)}
        className="mt-1 w-full bg-white/60 border border-[#1F2328]/10 rounded-xl px-4 py-2.5 outline-none focus:border-[#C8A24A] transition" />
    </div>
  );
}

function Toggle({ label, value, onChange, locked }: { label: string; value: boolean; onChange: (v: boolean)=>void; locked?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-[#3A3D42]">{label}{locked && <span className="text-[10px] text-[#6B7280] ml-2">(always on)</span>}</label>
      <button onClick={()=>{if(!locked)onChange(!value);}}
        className={"w-10 h-5 rounded-full transition-all relative " + (value ? "bg-[#C8A24A]" : "bg-[#DDE1E7]")}>
        <span className={"absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all " + (value ? "left-5" : "left-0.5")} />
      </button>
    </div>
  );
}

function ListEditor({ title, items, fields, onChange, emptyItem }:
  { title: string; items: any[]; fields: { key: string; label: string; textarea?: boolean; boolean?: boolean }[]; onChange: (items: any[]) => void; emptyItem: any }) {
  return (
    <Card title={title}>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-2xl bg-white/40 border border-[#1F2328]/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-mono-tech text-[#6B7280]">#{String(i+1).padStart(2,"0")}</div>
              <div className="flex gap-1.5">
                <button onClick={()=>{ const a=[...items]; if(i>0){[a[i-1],a[i]]=[a[i],a[i-1]];onChange(a);} }} className="text-xs px-2 py-1 rounded-md bg-white/60 hover:bg-white">↑</button>
                <button onClick={()=>{ const a=[...items]; if(i<a.length-1){[a[i+1],a[i]]=[a[i],a[i+1]];onChange(a);} }} className="text-xs px-2 py-1 rounded-md bg-white/60 hover:bg-white">↓</button>
                <button onClick={()=>{ const a=[...items]; a.splice(i,1); onChange(a); }} className="text-xs px-2 py-1 rounded-md bg-[#1F2328] text-white">Del</button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {fields.map(f => (
                <div key={f.key} className={f.textarea?"md:col-span-2":""}>
                  {f.boolean ? (
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] uppercase tracking-[.3em] text-[#6B7280]">{f.label}</label>
                      <button onClick={()=>{ const a=[...items]; a[i]={...a[i],[f.key]:!a[i][f.key]}; onChange(a); }}
                        className={"w-8 h-4 rounded-full transition relative " + (it[f.key] ? "bg-[#C8A24A]" : "bg-[#DDE1E7]")}>
                        <span className={"absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all " + (it[f.key] ? "left-4" : "left-0.5")} />
                      </button>
                    </div>
                  ) : f.textarea ? (
                    <div>
                      <label className="text-[11px] uppercase tracking-[.3em] text-[#6B7280]">{f.label}</label>
                      <textarea rows={2} value={it[f.key]??""} onChange={(e)=>{const a=[...items];a[i]={...a[i],[f.key]:e.target.value};onChange(a);}}
                        className="mt-1 w-full bg-white/70 border border-[#1F2328]/10 rounded-xl px-3 py-2 outline-none focus:border-[#C8A24A]" />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] uppercase tracking-[.3em] text-[#6B7280]">{f.label}</label>
                      <input value={it[f.key]??""} onChange={(e)=>{const a=[...items];a[i]={...a[i],[f.key]:e.target.value};onChange(a);}}
                        className="mt-1 w-full bg-white/70 border border-[#1F2328]/10 rounded-xl px-3 py-2 outline-none focus:border-[#C8A24A]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        <button onClick={()=>onChange([...items, {...emptyItem}])} className="btn-glass text-sm">+ Add Item</button>
      </div>
    </Card>
  );
}

function ThemePanel({ draft, set }: { draft: SiteData; set: (path: string, val: any)=>void }) {
  return (
    <Card title="Theme Colors">
      <p className="text-sm text-[#3A3D42]">Edit color tokens below. Values apply to CSS variables on save + publish.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ColorSwatch label="Background 1" value={draft.theme.background[0]} onChange={v=>{const a=[...draft.theme.background];a[0]=v;set("theme.background",a);}} />
        <ColorSwatch label="Background 2" value={draft.theme.background[1]} onChange={v=>{const a=[...draft.theme.background];a[1]=v;set("theme.background",a);}} />
        <ColorSwatch label="Surface" value={draft.theme.surface[0]} onChange={v=>{const a=[...draft.theme.surface];a[0]=v;set("theme.surface",a);}} />
        <ColorSwatch label="Ink (Primary Text)" value={draft.theme.text[0]} onChange={v=>{const a=[...draft.theme.text];a[0]=v;set("theme.text",a);}} />
        <ColorSwatch label="Graphite (Button)" value={draft.theme.buttons[0]} onChange={v=>{const a=[...draft.theme.buttons];a[0]=v;set("theme.buttons",a);}} />
        <ColorSwatch label="Gold Primary" value={draft.theme.gold[0]} onChange={v=>{const a=[...draft.theme.gold];a[0]=v;set("theme.gold",a);}} />
        <ColorSwatch label="Gold Light" value={draft.theme.gold[1]} onChange={v=>{const a=[...draft.theme.gold];a[1]=v;set("theme.gold",a);}} />
        <ColorSwatch label="Gold Dark" value={draft.theme.gold[2]} onChange={v=>{const a=[...draft.theme.gold];a[2]=v;set("theme.gold",a);}} />
      </div>
    </Card>
  );
}

function ColorSwatch({ label, value, onChange }: { label: string; value: string; onChange: (v: string)=>void }) {
  return (
    <div className="rounded-xl bg-white/60 border border-[#1F2328]/10 p-3 flex items-center gap-3">
      <input type="color" value={value.replace(/rgba.*/g,"#C8A24A")} onChange={(e)=>onChange(e.target.value)}
        className="w-10 h-10 rounded-xl border-0 cursor-pointer" />
      <div className="flex-1 min-w-0">
        <div className="text-xs truncate">{label}</div>
        <input value={value} onChange={(e)=>onChange(e.target.value)}
          className="w-full mt-1 bg-transparent text-[11px] font-mono-tech outline-none text-[#6B7280]" />
      </div>
    </div>
  );
}

function FontsPanel({ draft, set }: { draft: SiteData; set: (path: string, val: any)=>void }) {
  return (
    <Card title="Fonts & Typography">
      <Input label="Heading Font" value={draft.fonts.heading} onChange={v=>set("fonts.heading", v)} />
      <Input label="Body Font" value={draft.fonts.body} onChange={v=>set("fonts.body", v)} />
      <Input label="Button Font" value={draft.fonts.button} onChange={v=>set("fonts.button", v)} />
      <Input label="Mono Font" value={draft.fonts.mono} onChange={v=>set("fonts.mono", v)} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Heading Weight" value={draft.fonts.headingWeight} onChange={v=>set("fonts.headingWeight", v)} />
        <Input label="Body Weight" value={draft.fonts.bodyWeight} onChange={v=>set("fonts.bodyWeight", v)} />
        <Input label="Button Weight" value={draft.fonts.buttonWeight} onChange={v=>set("fonts.buttonWeight", v)} />
        <Input label="Letter Spacing" value={draft.fonts.letterSpacing} onChange={v=>set("fonts.letterSpacing", v)} />
      </div>
    </Card>
  );
}

function SEOPanel({ draft, set }: { draft: SiteData; set: (path: string, val: any)=>void }) {
  const pages = Object.keys(draft.seo);
  return (
    <Card title="SEO Settings">
      <p className="text-sm text-[#3A3D42]">Edit title, description and keywords per page.</p>
      {pages.map(p => (
        <div key={p} className="rounded-xl bg-white/40 border border-[#1F2328]/10 p-4">
          <div className="font-mono-tech text-xs text-[#C8A24A] mb-2">{p === "/" ? "Home" : p.slice(1).charAt(0).toUpperCase() + p.slice(2)}</div>
          <Input label="Page Title" value={draft.seo[p]?.title ?? ""} onChange={v=>{const s={...draft.seo};s[p]={...(s[p]||{}),title:v};set("seo",s);}} />
          <Textarea label="Meta Description" value={draft.seo[p]?.description ?? ""} onChange={v=>{const s={...draft.seo};s[p]={...(s[p]||{}),description:v};set("seo",s);}} />
          <Input label="Keywords (comma separated)" value={draft.seo[p]?.keywords ?? ""} onChange={v=>{const s={...draft.seo};s[p]={...(s[p]||{}),keywords:v};set("seo",s);}} />
        </div>
      ))}
    </Card>
  );
}

function SnippetsPanel({ draft, setDraft }: { draft: SiteData; setDraft: (d: SiteData)=>void }) {
  const add = () => {
    const s: Snippet = { id: crypto.randomUUID?.() || Date.now().toString(), type: "css", label: "New Snippet", code: "", enabled: true, scope: "global", ts: Date.now() };
    setDraft({...draft, snippets: [...(draft.snippets||[]), s]});
  };
  const update = (i: number, patch: Partial<Snippet>) => {
    const a = [...(draft.snippets||[])];
    a[i] = {...a[i], ...patch};
    setDraft({...draft, snippets: a});
  };
  const remove = (i: number) => {
    const a = [...(draft.snippets||[])];
    a.splice(i,1);
    setDraft({...draft, snippets: a});
  };
  return (
    <Card title="CSS / JS / HTML Snippets">
      <p className="text-sm text-[#3A3D42]">Add custom CSS, JavaScript or embed codes. These will load on the frontend after Publish.</p>
      {(draft.snippets||[]).map((s, i) => (
        <div key={s.id || i} className="rounded-xl bg-white/40 border border-[#1F2328]/10 p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <input value={s.label} onChange={e=>update(i,{label:e.target.value})} className="text-sm font-medium bg-transparent outline-none border-b border-transparent focus:border-[#C8A24A] flex-1" />
            <select value={s.type} onChange={e=>update(i,{type: e.target.value as any})} className="text-xs bg-white/60 rounded-lg px-2 py-1 outline-none">
              <option value="css">CSS</option><option value="js">JavaScript</option><option value="html">HTML</option><option value="embed">Embed</option>
            </select>
            <select value={s.scope} onChange={e=>update(i,{scope: e.target.value as any})} className="text-xs bg-white/60 rounded-lg px-2 py-1 outline-none">
              <option value="global">Global</option><option value="desktop">Desktop only</option><option value="mobile">Mobile only</option>
            </select>
            <button onClick={()=>update(i,{enabled:!s.enabled})} className={"text-[10px] px-2 py-1 rounded-md "+(s.enabled?"bg-[#C8A24A]/20 text-[#C8A24A]":"bg-[#EEE] text-[#999]")}>{s.enabled?"ON":"OFF"}</button>
            <button onClick={()=>remove(i)} className="text-[10px] text-red-600">Del</button>
          </div>
          <textarea rows={4} value={s.code} onChange={e=>update(i,{code:e.target.value})}
            className="w-full bg-white/70 border border-[#1F2328]/10 rounded-xl px-3 py-2 text-xs font-mono-tech outline-none focus:border-[#C8A24A]" />
        </div>
      ))}
      <button onClick={add} className="btn-glass text-sm">+ Add Snippet</button>
    </Card>
  );
}

function MediaPanel() {
  const [files, setFiles] = useState<{name:string;url:string}[]>([]);
  const [busy, setBusy] = useState(false);
  const refresh = () => { fetch("api.php?action=media", { credentials: "include" }).then(r=>r.ok?r.json():[]).then(setFiles).catch(()=>{}); };
  useEffect(()=>{ refresh(); },[]);
  const upload = async (file: File) => {
    setBusy(true);
    const fd = new FormData(); fd.append("file", file);
    try { const r = await fetch("upload.php", {method:"POST", credentials: "include", body:fd}); if (r.ok) refresh(); } catch {}
    setBusy(false);
  };
  const delFile = async (name: string) => {
    await fetch("api.php?action=delete_media", {method:"POST", credentials: "include", headers: {"Content-Type":"application/json"}, body: JSON.stringify({file: name})});
    refresh();
  };
  return (
    <Card title="Media Library">
      <div className="rounded-2xl border border-dashed border-[#1F2328]/20 bg-white/40 p-6 text-center">
        <input id="upl" type="file" className="hidden" accept="image/*,video/*,.pdf"
          onChange={(e)=>{ if(e.target.files?.[0]) upload(e.target.files[0]); }} />
        <label htmlFor="upl" className="btn-dark cursor-pointer">{busy ? "Uploading…" : "Choose file to upload"}</label>
      </div>
      {files.length > 0 && (
        <div className="mt-5 grid sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {files.map((f, i) => (
            <div key={i} className="rounded-2xl bg-white/60 border border-[#1F2328]/10 overflow-hidden relative group">
              {/\.(jpe?g|png|webp|gif|svg)$/i.test(f.name)
                ? <img src={f.url} className="w-full aspect-square object-cover" />
                : <div className="aspect-square grid place-items-center text-xs text-[#6B7280]">{f.name.split(".").pop()?.toUpperCase()}</div>}
              <div className="px-3 py-2 text-[10px] truncate">{f.name}</div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-1">
                <button onClick={()=>navigator.clipboard?.writeText(f.url)} className="text-[10px] bg-white/80 rounded px-2 py-1">📋</button>
                <button onClick={()=>delFile(f.name)} className="text-[10px] bg-red-500/80 text-white rounded px-2 py-1">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function SystemHealth() {
  const [health, setHealth] = useState<any>(null);
  useEffect(()=>{ fetch("api.php?action=health", { credentials: "include" }).then(r=>r.ok?r.json():null).then(setHealth); },[]);
  return (
    <Card title="System Health">
      {health ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>PHP Version</span><span className="font-mono-tech">{health.php}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Status</span>
            <span className={"text-xs uppercase tracking-widest " + (health.status==="ok"?"text-green-600":"text-yellow-600")}>{health.status}</span>
          </div>
          {Object.entries(health.checks).map(([k,v]) => (
            <div key={k} className="flex items-center justify-between text-sm">
              <span className="text-[#3A3D42]">{k}</span>
              <span className={"text-[11px] " + (v?"text-green-600":"text-red-600")}>{v?"writable":"error"}</span>
            </div>
          ))}
        </div>
      ) : <div className="text-sm text-[#6B7280]">Loading health check...</div>}
      <div className="mt-4 text-xs text-[#6B7280]">All API actions logged in <code className="font-mono-tech">data/activity-log.json</code>.</div>
    </Card>
  );
}
