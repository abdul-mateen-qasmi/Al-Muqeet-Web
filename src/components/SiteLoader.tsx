export function SiteLoader() {
  return (
    <div className="min-h-screen w-full grid place-items-center" style={{ background: "#F4F5F7" }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full border-2 border-[#C8A24A] border-t-transparent animate-spin"
          role="status"
          aria-label="Loading"
        />
        <div className="text-[11px] uppercase tracking-[.35em] text-[#6B7280]">Loading</div>
      </div>
    </div>
  );
}
