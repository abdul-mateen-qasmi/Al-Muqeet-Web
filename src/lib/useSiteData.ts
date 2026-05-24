import { useEffect, useState } from "react";
import type { SiteData } from "./data";

type Status = "idle" | "fetching" | "error";

let cachedData: SiteData | null = null;
let status: Status = "idle";
let cachedError: Error | null = null;
let inFlight: Promise<SiteData> | null = null;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

function startFetch(): Promise<SiteData> {
  if (inFlight) return inFlight;
  status = "fetching";
  notify();
  inFlight = (async () => {
    const r = await fetch("api.php?action=get_site", {
      credentials: "include",
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`Failed to load site data (${r.status})`);
    const j = await r.json();
    if (!j || !j.brand) throw new Error("Invalid site data response");
    return j as SiteData;
  })()
    .then((data) => {
      cachedData = data;
      status = "idle";
      cachedError = null;
      inFlight = null;
      notify();
      return data;
    })
    .catch((err) => {
      const error = err instanceof Error ? err : new Error(String(err));
      cachedError = error;
      status = "error";
      inFlight = null;
      notify();
      throw error;
    });
  return inFlight;
}

export function invalidateSiteDataCache(): void {
  if (listeners.size > 0) startFetch();
}

export function setSiteDataCache(next: SiteData): void {
  cachedData = next;
  status = "idle";
  cachedError = null;
  notify();
}

export function useSiteData(): {
  data: SiteData | null;
  loading: boolean;
  error: Error | null;
} {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((n) => n + 1);
    listeners.add(listener);
    if (cachedData === null && status === "idle") startFetch();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    data: cachedData,
    loading: status === "fetching" && cachedData === null,
    error: status === "error" ? cachedError : null,
  };
}
