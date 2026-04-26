import { X, Mountain, CloudRain, Gauge, Dam, ArrowRight, ShieldCheck, Calendar } from "lucide-react";

interface Props {
  onClose: () => void;
  onSimulate: () => void;
  area: number;
  zoneName?: string;
  scenarioStep: number; // 0 idle, 1-3 running
}

export function AnalysisPanel({ onClose, onSimulate, area, zoneName, scenarioStep }: Props) {
  const running = scenarioStep > 0 && scenarioStep < 4;

  return (
    <aside className="absolute right-0 top-0 z-[450] flex h-full w-[400px] max-w-[92vw] animate-slide-in-right flex-col">
      <div className="glass-panel m-3 flex flex-1 flex-col overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="relative border-b border-border/60 bg-gradient-radial-glow px-5 py-4">
          <button
            onClick={onClose}
            disabled={running}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary text-glow-cyan">
            Earth Engine · Viability Analysis
          </p>
          <h2 className="mt-1 text-lg font-semibold">
            {zoneName ?? "Custom AOI"}
          </h2>
          <div className="mt-2 flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
            <span>{area.toFixed(1)} km²</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>EPSG:4326</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>UTC {new Date().toUTCString().slice(17, 22)}</span>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {/* Viability score */}
          <div className="rounded-xl border border-success/40 bg-success/5 p-4 shadow-[inset_0_0_30px_hsl(var(--success)/0.08)]">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-success" />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-success">
                Viability Score
              </p>
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-4xl font-bold text-success" style={{ textShadow: "0 0 12px hsl(var(--success) / 0.6)" }}>
                88%
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-success">
                Highly Recommended
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
              <div
                className="h-full rounded-full bg-gradient-to-r from-success to-primary"
                style={{ width: "88%", boxShadow: "0 0 12px hsl(var(--success)/0.6)" }}
              />
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Composite of DEM slope, NDWI water proximity, SAR urban exclusion and ERA5 precipitation forecast.
            </p>
          </div>

          {/* DEM */}
          <Section icon={Mountain} title="DEM Analysis" tone="warning">
            <p className="text-[12px] text-foreground/90">
              Ideal <span className="font-semibold text-warning">steep valley profile</span> detected.
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <Stat label="Mean slope" value="14.2°" />
              <Stat label="Δ Elevation" value="312 m" />
              <Stat label="Catchment" value="184 km²" />
            </div>
            {/* Mock terrain svg */}
            <svg viewBox="0 0 200 50" className="mt-3 h-12 w-full">
              <defs>
                <linearGradient id="terrain" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,40 L20,32 L40,18 L60,8 L80,22 L100,12 L120,28 L140,16 L160,30 L180,22 L200,38 L200,50 L0,50 Z" fill="url(#terrain)" />
              <path d="M0,40 L20,32 L40,18 L60,8 L80,22 L100,12 L120,28 L140,16 L160,30 L180,22 L200,38" fill="none" stroke="hsl(var(--warning))" strokeWidth="1.2" />
            </svg>
          </Section>

          {/* Weather */}
          <Section icon={CloudRain} title="Weather Context · 72h Forecast" tone="primary">
            <p className="text-[12px] text-foreground/90">
              <span className="font-semibold text-primary">Heavy precipitation (+40 mm)</span> expected.
              Ideal window for water capture simulation.
            </p>
            <div className="mt-2 flex items-end justify-between gap-1">
              {[6, 12, 22, 18, 28, 32, 26].map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-primary/30 to-primary"
                    style={{ height: `${v * 1.4}px`, boxShadow: "0 0 8px hsl(var(--primary)/0.4)" }}
                  />
                  <span className="font-mono text-[8px] text-muted-foreground">{v}mm</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Strictly short-term · long-range forecasts excluded (unpredictable)</span>
            </div>
          </Section>

          {/* Confidence */}
          <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-surface-elevated/40 px-3 py-2">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Model confidence
            </span>
            <span className="ml-auto font-mono text-[11px] font-semibold text-primary">93.4%</span>
          </div>
        </div>

        {/* Decision */}
        <div className="border-t border-border/60 bg-surface/60 px-5 py-4">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onSimulate}
              disabled={running}
              className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-primary/60 bg-primary/15 px-3 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/25 hover:shadow-glow-cyan disabled:opacity-60 disabled:cursor-wait"
            >
              <Dam className="h-4 w-4" />
              {running ? "Simulating…" : "Simulate Dam"}
              {!running && <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />}
            </button>
            <button
              onClick={onClose}
              disabled={running}
              className="rounded-xl border border-border/60 bg-surface-elevated/60 px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface-elevated disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Section({ icon: Icon, title, tone, children }: { icon: any; title: string; tone: "warning" | "primary"; children: React.ReactNode }) {
  const c = tone === "warning" ? "text-warning" : "text-primary";
  return (
    <div className="rounded-xl border border-border/50 bg-surface-elevated/40 p-3.5">
      <div className="mb-1 flex items-center gap-2">
        <Icon className={`h-3.5 w-3.5 ${c}`} />
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/40 bg-surface/40 px-2 py-1.5">
      <p className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-[12px] font-semibold text-foreground">{value}</p>
    </div>
  );
}
