import { X, Droplets, Sprout, Users, AlertTriangle, Waves, Dam, GitBranch, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onClose: () => void;
  onBuildReservoir: () => void;
  onDivertRiver: () => void;
  area: number; // km²
}

export function AnalysisPanel({ onClose, onBuildReservoir, onDivertRiver, area }: Props) {
  return (
    <aside className="absolute right-0 top-0 z-[450] flex h-full w-[400px] max-w-[92vw] animate-slide-in-right flex-col">
      <div className="glass-panel m-3 flex flex-1 flex-col overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="relative border-b border-border/60 bg-gradient-radial-glow px-5 py-4">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary text-glow-cyan">
            Region Analysis · Live
          </p>
          <h2 className="mt-1 text-lg font-semibold">Guadalquivir Basin · AOI-{Math.floor(Math.random() * 900 + 100)}</h2>
          <div className="mt-2 flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
            <span>{area.toFixed(1)} km²</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>EPSG:4326</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>UTC {new Date().toUTCString().slice(17, 22)}</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {/* NDVI */}
          <Metric
            icon={Sprout}
            label="NDVI · Vegetation Health"
            value="0.42"
            sub="Moderate stress detected"
            tone="success"
          >
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
              <div
                className="h-full rounded-full bg-gradient-vegetation shadow-[0_0_12px_hsl(140_80%_50%/0.5)]"
                style={{ width: "42%" }}
              />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
              <span>0.0 BARE</span>
              <span>1.0 DENSE</span>
            </div>
          </Metric>

          {/* Soil Moisture */}
          <Metric
            icon={Droplets}
            label="Soil Moisture · SMAP L4"
            value="14%"
            sub="CRITICAL · Below 20% threshold"
            tone="warning"
          >
            <div className="mt-2 grid grid-cols-10 gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full ${
                    i < 1.4 ? "bg-warning shadow-[0_0_8px_hsl(var(--warning)/0.6)]" : "bg-surface-elevated"
                  }`}
                />
              ))}
            </div>
          </Metric>

          {/* Water Demand donut */}
          <Metric
            icon={Users}
            label="Human Water Demand"
            value=""
            sub="3.2M residents in catchment"
            tone="alert"
          >
            <div className="mt-1 flex items-center gap-4">
              <Donut percent={92} />
              <div className="flex-1 space-y-1.5 font-mono text-[10px]">
                <Row dot="bg-alert" label="Demand" v="92%" />
                <Row dot="bg-primary" label="Available" v="8%" />
                <Row dot="bg-muted" label="Reserve" v="0%" />
              </div>
            </div>
          </Metric>

          {/* Risk score */}
          <div className="rounded-xl border border-alert/40 bg-alert/5 p-4 shadow-[inset_0_0_30px_hsl(var(--alert)/0.08)]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-alert" />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-alert text-glow-alert">
                Overall Risk Score
              </p>
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-4xl font-bold text-alert text-glow-alert">85%</span>
              <span className="font-mono text-xs uppercase tracking-wider text-alert">CRITICAL</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
              <div
                className="h-full bg-gradient-alert shadow-glow-alert"
                style={{ width: "85%" }}
              />
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Combined drought, demand and vegetation indices exceed the EU EDO emergency
              threshold. Immediate intervention recommended.
            </p>
          </div>
        </div>

        {/* Decision Engine */}
        <div className="border-t border-border/60 bg-surface/60 px-5 py-4">
          <div className="mb-3 flex items-center gap-2">
            <Waves className="h-3.5 w-3.5 text-primary" />
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
              Infrastructure Intervention
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <ActionButton
              icon={Dam}
              label="Build Reservoir"
              hint="Impound flow"
              onClick={onBuildReservoir}
              primary
            />
            <ActionButton
              icon={GitBranch}
              label="Divert River"
              hint="Re-route channel"
              onClick={onDivertRiver}
            />
          </div>
          <button className="mt-2 flex w-full items-center justify-center gap-1 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
            View full DSE report <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function Metric({
  icon: Icon, label, value, sub, tone, children,
}: {
  icon: any; label: string; value: string; sub: string;
  tone: "success" | "warning" | "alert"; children?: React.ReactNode;
}) {
  const toneCls = {
    success: "text-success",
    warning: "text-warning",
    alert: "text-alert",
  }[tone];
  return (
    <div className="rounded-xl border border-border/50 bg-surface-elevated/40 p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-3.5 w-3.5 ${toneCls}`} />
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
        </div>
        {value && <span className={`font-mono text-sm font-semibold ${toneCls}`}>{value}</span>}
      </div>
      <p className={`mt-0.5 text-[11px] ${toneCls}`}>{sub}</p>
      {children}
    </div>
  );
}

function Row({ dot, label, v }: { dot: string; label: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span className="font-semibold text-foreground">{v}</span>
    </div>
  );
}

function Donut({ percent }: { percent: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="hsl(var(--surface-elevated))" strokeWidth="7" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke="hsl(var(--alert))" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ filter: "drop-shadow(0 0 6px hsl(var(--alert) / 0.6))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-alert">{percent}%</span>
        <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">Demand</span>
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon, label, hint, onClick, primary,
}: { icon: any; label: string; hint: string; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-start gap-1 overflow-hidden rounded-xl border p-3 text-left transition-all duration-200 ${
        primary
          ? "border-primary/50 bg-primary/10 hover:bg-primary/20 hover:shadow-glow-cyan"
          : "border-border/60 bg-surface-elevated/60 hover:border-primary/40 hover:bg-surface-elevated"
      }`}
    >
      <Icon className={`h-4 w-4 ${primary ? "text-primary" : "text-foreground"}`} strokeWidth={1.75} />
      <span className={`text-sm font-semibold ${primary ? "text-primary" : "text-foreground"}`}>{label}</span>
      <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{hint}</span>
      <ArrowRight className={`absolute right-2 bottom-2 h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 ${primary ? "text-primary" : "text-foreground"}`} />
    </button>
  );
}
