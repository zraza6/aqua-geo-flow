import { Crosshair, MousePointerClick } from "lucide-react";

export function MapHint({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-5 z-[400] -translate-x-1/2 animate-fade-in">
      <div className="glass-panel flex items-center gap-3 rounded-full px-4 py-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <MousePointerClick className="h-3.5 w-3.5 text-primary" />
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/90">
          Draw a polygon to define a river basin AOI
        </p>
        <Crosshair className="h-3.5 w-3.5 text-primary" />
      </div>
    </div>
  );
}

export function MapLegend() {
  return (
    <div className="absolute bottom-5 left-5 z-[400] hidden md:block">
      <div className="glass-panel rounded-xl px-3.5 py-3">
        <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Active Layers
        </p>
        <div className="space-y-1.5 text-[11px]">
          <Item color="bg-primary" label="Sentinel-2 RGB" />
          <Item color="bg-success" label="NDVI Overlay" />
          <Item color="bg-warning" label="Drought Index" />
          <Item color="bg-alert" label="Critical Basins" />
        </div>
      </div>
    </div>
  );
}

function Item({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-sm ${color} shadow-[0_0_6px_currentColor]`} />
      <span className="text-foreground/85">{label}</span>
    </div>
  );
}

export function StatusStrip() {
  return (
    <div className="absolute bottom-5 right-5 z-[400] hidden md:block">
      <div className="glass-panel flex items-center gap-4 rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-wider">
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
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${c}`}>{value}</span>
    </div>
  );
}

function Sep() {
  return <span className="h-3 w-px bg-border" />;
}
