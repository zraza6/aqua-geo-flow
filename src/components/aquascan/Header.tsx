import { Bell, Globe2, Radio } from "lucide-react";

export function Header() {
  return (
    <header className="z-30 flex h-14 items-center justify-between border-b border-border/60 bg-surface/80 px-5 backdrop-blur-xl">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <Globe2 className="h-5 w-5 text-primary" strokeWidth={1.75} />
          <div className="leading-tight">
            <h1 className="text-sm font-bold tracking-wide">
              AquaScan <span className="font-mono text-primary text-glow-cyan">Pro</span>
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              European Hydro-Intelligence Center
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-md border border-border/60 bg-surface-elevated/60 px-2.5 py-1 md:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Sentinel-2 · Live Feed
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground md:flex">
          <Radio className="h-3 w-3 text-primary" />
          <span>Lat 37.38° · Lon -5.99°</span>
        </div>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-surface-elevated/60 text-muted-foreground transition-colors hover:text-primary">
          <Bell className="h-4 w-4" strokeWidth={1.75} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-alert shadow-glow-alert" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-cyan font-mono text-xs font-bold text-primary-foreground">
          OP
        </div>
      </div>
    </header>
  );
}
