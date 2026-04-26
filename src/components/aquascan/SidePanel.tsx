import { Activity, Droplets, Mountain, Waves, Radar, Cpu, FlaskConical, AlertTriangle, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { SidebarTab } from "./Sidebar";
import type { LayerState } from "./AquaMap";
import { RECOMMENDED_ZONES } from "./AquaMap";

interface Props {
  tab: SidebarTab;
  layers: LayerState;
  onToggleLayer: (k: keyof LayerState) => void;
  onZoneClick: (id: string) => void;
  scenarioStep: number; // 0 idle, 1-3 active, 4 done
}

export function SidePanel({ tab, layers, onToggleLayer, onZoneClick, scenarioStep }: Props) {
  return (
    <div className="z-20 flex h-full w-[300px] flex-col border-r border-border/60 bg-surface/70 backdrop-blur-xl">
      <div className="border-b border-border/60 px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary text-glow-cyan">
          {tab === "dashboard" && "Command Dashboard"}
          {tab === "layers" && "Satellite Layers"}
          {tab === "scenarios" && "Scenario Engine"}
        </p>
        <h2 className="mt-0.5 text-sm font-semibold text-foreground">
          {tab === "dashboard" && "Hydro Intelligence"}
          {tab === "layers" && "Earth Observation"}
          {tab === "scenarios" && "Decision Simulator"}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {tab === "dashboard" && <DashboardView />}
        {tab === "layers" && (
          <LayersView layers={layers} onToggleLayer={onToggleLayer} onZoneClick={onZoneClick} />
        )}
        {tab === "scenarios" && <ScenariosView step={scenarioStep} onZoneClick={onZoneClick} />}
      </div>
    </div>
  );
}

/* -------- DASHBOARD -------- */
function DashboardView() {
  return (
    <>
      <KpiCard icon={Droplets} label="Basins Monitored" value="1,247" tone="primary" sub="EU-27 coverage" />
      <KpiCard icon={AlertTriangle} label="Active Drought Alerts" value="38" tone="alert" sub="↑ 12 this week" />
      <KpiCard icon={Mountain} label="DEM Hotspots" value="3" tone="warning" sub="High dam viability" />
      <KpiCard icon={Activity} label="Sentinel-2 Pass" value="2h ago" tone="success" sub="Next: 22h 14m" />

      <div className="rounded-xl border border-border/60 bg-surface-elevated/40 p-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Recent Activity
        </p>
        <ul className="mt-2 space-y-2 text-[11px]">
          <Activity_ ts="14:02" txt="SMAP soil moisture refresh — Andalusia" tone="primary" />
          <Activity_ ts="13:48" txt="Critical alert · Guadiana lower basin" tone="alert" />
          <Activity_ ts="13:30" txt="3 DEM zones promoted to candidates" tone="warning" />
          <Activity_ ts="12:11" txt="ERA5 weather sync complete" tone="success" />
        </ul>
      </div>
    </>
  );
}

function Activity_({ ts, txt, tone }: { ts: string; txt: string; tone: "primary" | "alert" | "warning" | "success" }) {
  const c = { primary: "bg-primary", alert: "bg-alert", warning: "bg-warning", success: "bg-success" }[tone];
  return (
    <li className="flex items-start gap-2">
      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${c}`} />
      <div className="flex-1">
        <p className="text-foreground/90">{txt}</p>
        <p className="font-mono text-[9px] text-muted-foreground">UTC {ts}</p>
      </div>
    </li>
  );
}

function KpiCard({ icon: Icon, label, value, sub, tone }: { icon: any; label: string; value: string; sub: string; tone: "primary" | "alert" | "warning" | "success" }) {
  const colorCls = {
    primary: "text-primary",
    alert: "text-alert",
    warning: "text-warning",
    success: "text-success",
  }[tone];
  return (
    <div className="rounded-xl border border-border/60 bg-surface-elevated/40 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-3.5 w-3.5 ${colorCls}`} />
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        </div>
      </div>
      <p className={`mt-1 text-2xl font-bold ${colorCls}`}>{value}</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}

/* -------- LAYERS -------- */
function LayersView({
  layers, onToggleLayer, onZoneClick,
}: { layers: LayerState; onToggleLayer: (k: keyof LayerState) => void; onZoneClick: (id: string) => void }) {
  return (
    <>
      <ToggleRow
        icon={Waves}
        title="Sentinel Water Evolution"
        sub="Mock NDWI heatmap along rivers"
        checked={layers.waterEvolution}
        onChange={() => onToggleLayer("waterEvolution")}
        accent="primary"
      />
      <ToggleRow
        icon={Radar}
        title="SAR Urban Footprint"
        sub="Sentinel-1 backscatter · DO NOT flood"
        checked={layers.sarUrban}
        onChange={() => onToggleLayer("sarUrban")}
        accent="alert"
      />
      <ToggleRow
        icon={Mountain}
        title="Digital Elevation Model"
        sub="SRTM 30m · relief shading"
        checked={layers.dem}
        onChange={() => onToggleLayer("dem")}
        accent="warning"
      />

      <div className="mt-4 rounded-xl border border-warning/40 bg-warning/5 p-3 shadow-[inset_0_0_24px_hsl(var(--warning)/0.08)]">
        <div className="flex items-center gap-2">
          <Mountain className="h-3.5 w-3.5 text-warning" />
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-warning">
            DEM Recommended Zones
          </p>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Algorithmic dam candidates. Click a zone on the map to analyze.
        </p>
        <ul className="mt-2 space-y-1">
          {RECOMMENDED_ZONES.map((z) => (
            <li key={z.id}>
              <button
                onClick={() => onZoneClick(z.id)}
                className="flex w-full items-center justify-between rounded-md border border-border/40 bg-surface-elevated/40 px-2 py-1.5 text-left text-[11px] hover:border-warning/60 hover:bg-warning/10 transition-colors"
              >
                <span className="text-foreground/90">{z.name}</span>
                <ChevronRight className="h-3 w-3 text-warning" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function ToggleRow({
  icon: Icon, title, sub, checked, onChange, accent,
}: { icon: any; title: string; sub: string; checked: boolean; onChange: () => void; accent: "primary" | "alert" | "warning" }) {
  const c = { primary: "text-primary", alert: "text-alert", warning: "text-warning" }[accent];
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-surface-elevated/40 p-3">
      <div className="flex items-start gap-2.5 min-w-0">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${c}`} />
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-foreground">{title}</p>
          <p className="text-[10px] leading-tight text-muted-foreground">{sub}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/* -------- SCENARIOS -------- */
function ScenariosView({ step, onZoneClick }: { step: number; onZoneClick: (id: string) => void }) {
  const steps = [
    { label: "Deviating river flow", icon: Waves },
    { label: "Constructing primary wall", icon: Cpu },
    { label: "Filling reservoir basin", icon: Droplets },
  ];
  return (
    <>
      <div className="rounded-xl border border-primary/40 bg-primary/5 p-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-3.5 w-3.5 text-primary" />
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">
            Active Scenario
          </p>
        </div>
        <p className="mt-1 text-[12px] font-semibold">Dam Construction Pipeline</p>
        <p className="text-[10px] text-muted-foreground">
          Multi-stage simulation persisted to PostGIS.
        </p>
      </div>

      <div className="space-y-2">
        {steps.map((s, i) => {
          const idx = i + 1;
          const active = step === idx;
          const done = step > idx;
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`flex items-center gap-3 rounded-lg border p-2.5 transition-all ${
                active
                  ? "border-primary/60 bg-primary/10 shadow-glow-cyan"
                  : done
                    ? "border-success/40 bg-success/5"
                    : "border-border/50 bg-surface-elevated/30"
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-md ${
                  active ? "bg-primary/20 text-primary" : done ? "bg-success/20 text-success" : "bg-surface-elevated text-muted-foreground"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? "animate-pulse" : ""}`} />
              </div>
              <div className="flex-1">
                <p className={`text-[11px] font-medium ${active ? "text-primary" : done ? "text-success" : "text-foreground/80"}`}>
                  Step {idx} · {s.label}
                </p>
                <p className="font-mono text-[9px] text-muted-foreground">
                  {done ? "COMPLETE" : active ? "RUNNING…" : "PENDING"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl border border-border/60 bg-surface-elevated/40 p-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Quick Targets
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          Launch viability analysis on a recommended zone.
        </p>
        <ul className="mt-2 space-y-1">
          {RECOMMENDED_ZONES.map((z) => (
            <li key={z.id}>
              <button
                onClick={() => onZoneClick(z.id)}
                className="flex w-full items-center justify-between rounded-md border border-border/40 bg-surface/40 px-2 py-1.5 text-left text-[11px] hover:border-primary/50 hover:bg-primary/10 transition-colors"
              >
                <span className="text-foreground/90">{z.name}</span>
                <ChevronRight className="h-3 w-3 text-primary" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
