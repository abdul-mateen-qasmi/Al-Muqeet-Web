import { type CSSProperties } from "react";
import { RouterProvider, useRouter } from "./lib/router";
import { useSiteData } from "./lib/useSiteData";
import { useReveal } from "./lib/reveal";
import { Footer, Nav } from "./components/Layout";
import { AmbientBackdrop } from "./components/Ambience";
import { SiteLoader } from "./components/SiteLoader";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Projects from "./pages/Projects";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import ChatWidget from "./components/ChatWidget";

function Shell() {
  const { path } = useRouter();
  const { data, loading } = useSiteData();
  useReveal();

  const isAdmin = path === "/admin";

  if (loading || !data) {
    return <SiteLoader />;
  }

  return (
    <div
      className="min-h-screen"
      style={{
        ["--font-body" as never]: data.fonts.body,
        ["--font-display" as never]: data.fonts.heading,
        ["--font-button" as never]: data.fonts.button,
        ["--font-mono" as never]: data.fonts.mono,
        ["--glass-blur" as never]: data.theme.blur,
      } as CSSProperties}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <AmbientBackdrop />
      <Nav />
      {path === "/" && <Home />}
      {path === "/about" && <About />}
      {path === "/services" && <Services />}
      {path === "/projects" && <Projects />}
      {path === "/careers" && <Careers />}
      {path === "/contact" && <Contact />}
      {path === "/admin" && <Admin />}
      {!["/", "/about", "/services", "/projects", "/careers", "/contact", "/admin"].includes(path) && (
        <Home />
      )}
      {!isAdmin && <Footer />}
      {!isAdmin && <ChatWidget />}
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <Shell />
    </RouterProvider>
  );
}
