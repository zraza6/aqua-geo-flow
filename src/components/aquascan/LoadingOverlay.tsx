import { Satellite } from "lucide-react";

export function LoadingOverlay({ label = "Fetching Earth Engine Data…" }: { label?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center bg-background/40 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel flex flex-col items-center gap-4 rounded-xl px-8 py-6">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-cyan shadow-glow-cyan">
            <Satellite className="h-6 w-6 text-primary-foreground" strokeWidth={2} />
          </div>
        </div>
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary text-glow-cyan">
            Earth Engine
          </p>
          <p className="mt-1 text-sm font-medium">{label}</p>
          <div className="mt-3 flex items-center justify-center gap-1 font-mono text-[10px] text-muted-foreground">
            <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-primary [animation-delay:-0.3s]" />
            <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-primary [animation-delay:-0.15s]" />
            <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-primary" />
            <span className="ml-2">PostGIS · DEM · ERA5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
