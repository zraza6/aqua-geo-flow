import { Crosshair, MousePointerClick, Mountain, Globe2, Bell, Radio } from "lucide-react";
import type { LayerState } from "./AquaMap";

export function TopBrand() {
  return (
    <div className="absolute left-1/2 top-4 z-[1000] -translate-x-1/2">
      <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-black/30 px-5 py-2.5 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-2.5">
          <Globe2 className="h-4 w-4 text-primary" strokeWidth={2} />
          <div className="flex flex-col leading-tight">
            <h1 className="text-[12px] font-bold tracking-wide">
              AquaScan <span className="font-mono text-primary text-glow-cyan">Pro</span>
            </h1>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/50">
              European Hydro-Intelligence Center
            </p>
          </div>
        </div>
        <span className="hidden h-7 w-px bg-white/10 md:block" />
        <div className="hidden items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-foreground/55 md:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          <span>Sentinel-2 · Live</span>
        </div>
        <span className="hidden h-7 w-px bg-white/10 md:block" />
        <div className="hidden items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-foreground/55 lg:flex">
          <Radio className="h-3 w-3 text-primary" />
          <span>37.38° · −5.99°</span>
        </div>
        <button className="relative flex h-7 w-7 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-foreground/70 transition-colors hover:text-primary">
          <Bell className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-alert shadow-glow-alert" />
        </button>
      </div>
    </div>
  );
}

export function MapHint({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-20 z-[999] -translate-x-1/2 animate-fade-in">
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-5 py-2.5 backdrop-blur-2xl">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <MousePointerClick className="h-3.5 w-3.5 text-primary" />
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/90">
          Draw a polygon · or click a gold zone
        </p>
        <Crosshair className="h-3.5 w-3.5 text-primary" />
      </div>
    </div>
  );
}

export function MapLegend({ layers }: { layers: LayerState }) {
  return (
    <div className="absolute bottom-6 left-6 z-[1000]">
      <div className="flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-black/30 p-4 shadow-2xl backdrop-blur-2xl">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/50">
          Map Legend
        </p>
        <div className="flex flex-col gap-2 text-[11px]">
          <Item color="bg-warning" label="DEM Recommended Zones" glow />
          <Item color="bg-primary" label="Sentinel Water" glow active={layers.waterEvolution} />
          <Item color="bg-alert" label="SAR Urban (no-flood)" glow active={layers.sarUrban} />
          <Item color="bg-cyan-300" label="Drawn AOI" />
        </div>
      </div>
    </div>
  );
}

function Item({ color, label, glow, active = true }: { color: string; label: string; glow?: boolean; active?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${active ? "" : "opacity-40"}`}>
      <span className={`h-2.5 w-2.5 rounded-sm ${color} ${glow ? "shadow-[0_0_8px_currentColor]" : ""}`} />
      <span className="text-foreground/85">{label}</span>
    </div>
  );
}

export function StatusStrip() {
  return (
    <div className="absolute bottom-6 right-6 z-[1000] hidden md:block">
      <div className="flex items-center gap-4 rounded-full border border-white/10 bg-black/30 px-5 py-2.5 font-mono text-[10px] uppercase tracking-wider shadow-2xl backdrop-blur-2xl">
        <Stat label="Basins" value="1,247" />
        <Sep />
        <Stat label="Alerts" value="38" tone="alert" />
        <Sep />
        <Stat label="Coverage" value="92%" tone="primary" />
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "alert" | "primary" }) {
  const c = tone === "alert" ? "text-alert" : tone === "primary" ? "text-primary" : "text-foreground";
  return (
    <div className="flex items-center gap-2">
      <span className="text-foreground/50">{label}</span>
      <span className={`font-semibold ${c}`}>{value}</span>
    </div>
  );
}

function Sep() {
  return <span className="h-3 w-px bg-white/15" />;
}

export function ZonesBadge() {
  return (
    <div className="absolute top-20 right-6 z-[1000] hidden md:block">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 backdrop-blur-2xl">
        <Mountain className="h-3.5 w-3.5 text-warning" style={{ filter: "drop-shadow(0 0 6px hsl(var(--warning)/0.7))" }} />
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-warning">
          High Potential Elevation Zones (DEM)
        </p>
      </div>
    </div>
  );
}
