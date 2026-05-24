// Expanded data model for the Al Muqeet admin panel.
export type ThemeTokens = {
  name: string;
  background: string[];
  surface: string[];
  text: string[];
  buttons: string[];
  gold: string[];
  border: string[];
  overlay: string[];
  blur: string;
  shadow: string;
  cool: string;
};

export type FontTokens = {
  heading: string;
  body: string;
  button: string;
  mono: string;
  headingWeight: string;
  bodyWeight: string;
  buttonWeight: string;
  letterSpacing: string;
};

export type Snippet = {
  id: string;
  type: "css" | "js" | "html" | "embed";
  label: string;
  code: string;
  enabled: boolean;
  scope: "global" | "desktop" | "mobile";
  ts: number;
};

export type SiteData = {
  brand: {
    name: string;
    shortName: string;
    legalName: string;
    tagline: string;
    location: string;
    logoUrl: string;
    faviconUrl: string;
  };
  theme: ThemeTokens;
  fonts: FontTokens;
  hero: {
    eyebrow: string;
    title: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
    image: string;
    video: string;
    overlayTitle: string;
    overlayCopy: string;
    heroBgMode: string;
    enable3d: boolean;
    enableParticles: boolean;
    enableGrid: boolean;
    mobileFallback: string;
  };
  about: {
    title: string;
    intro: string;
    mission: string;
    vision: string;
    quality: string;
    safety: string;
    image: string;
  };
  services: {
    icon: string;
    title: string;
    short: string;
    desc: string;
    category: string;
    image: string;
    featured: boolean;
    enabled: boolean;
  }[];
  process: { step: string; title: string; desc: string }[];
  projects: {
    title: string;
    type: string;
    year: string;
    location: string;
    short: string;
    desc: string;
    image: string;
    featured: boolean;
    enabled: boolean;
  }[];
  stats: { value: string; label: string }[];
  careers: {
    role: string;
    type: string;
    location: string;
    desc: string;
    featured: boolean;
  }[];
  contact: {
    phone: string;
    email: string;
    whatsapp: string;
    address: string;
    hours: string;
    mapEmbed: string;
  };
  social: { name: string; url: string }[];
  sections: {
    home: Record<string, boolean>;
    about: Record<string, boolean>;
    services: Record<string, boolean>;
    projects: Record<string, boolean>;
    careers: Record<string, boolean>;
    contact: Record<string, boolean>;
  };
  media: {
    library: { name: string; url: string; type: string; enabled: boolean }[];
    heroImages: { url: string; alt: string; enabled: boolean }[];
    heroVideos: { url: string; poster: string; enabled: boolean }[];
    splineUrl: string;
    lottieUrl: string;
  };
  auth: {
    defaultUsername: string;
    defaultEmail: string;
    passwordHint: string;
    roles: string[];
  };
  snippets: Snippet[];
  seo: Record<string, { title: string; description: string; keywords: string }>;
  floatingCards: {
    enabled: boolean;
    cards: { title: string; icon: string; content: string; position: string; enabled: boolean }[];
  };
  announcementBar: { text: string; enabled: boolean; bgColor: string; textColor: string };
};

const KEY = "almuqeet_site_data_v1";

export async function loadSiteData(): Promise<SiteData> {
  const r = await fetch("api.php?action=get_site", { cache: "no-store", credentials: "include" });
  if (!r.ok) throw new Error(`Failed to load site data (${r.status})`);
  const j = await r.json();
  if (!j || !j.brand) throw new Error("Invalid site data response");
  return j as SiteData;
}

export async function saveSiteData(d: SiteData): Promise<{ ok: boolean; via: string }> {
  try {
    const r = await fetch("api.php?action=save_site", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });
    if (r.ok) {
      try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {}
      return { ok: true, via: "server" };
    }
  } catch {}
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {}
  return { ok: true, via: "local" };
}
