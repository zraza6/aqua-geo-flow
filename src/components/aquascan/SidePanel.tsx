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
  scenarioStep: number;
}

export function SidePanel({ tab, layers, onToggleLayer, onZoneClick, scenarioStep }: Props) {
  return (
    <div className="flex h-full w-full flex-col rounded-3xl border border-white/10 bg-black/30 shadow-2xl backdrop-blur-2xl">
      <div className="flex flex-col gap-1 border-b border-white/10 px-6 py-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary text-glow-cyan">
          {tab === "dashboard" && "Command Dashboard"}
          {tab === "layers" && "Satellite Layers"}
          {tab === "scenarios" && "Scenario Engine"}
        </p>
        <h2 className="text-base font-semibold text-foreground">
          {tab === "dashboard" && "Hydro Intelligence"}
          {tab === "layers" && "Earth Observation"}
          {tab === "scenarios" && "Decision Simulator"}
        </h2>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
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
    <div className="flex flex-col gap-3">
      <KpiCard icon={Droplets} label="Basins Monitored" value="1,247" tone="primary" sub="EU-27 coverage" />
      <KpiCard icon={AlertTriangle} label="Drought Alerts" value="38" tone="alert" sub="↑ 12 this week" />
      <KpiCard icon={Mountain} label="DEM Hotspots" value="3" tone="warning" sub="High dam viability" />
      <KpiCard icon={Activity} label="Sentinel-2 Pass" value="2h ago" tone="success" sub="Next: 22h 14m" />

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/50">
          Recent Activity
        </p>
        <ul className="flex flex-col gap-2.5 text-[11px]">
          <ActivityItem ts="14:02" txt="SMAP soil moisture refresh — Andalusia" tone="primary" />
          <ActivityItem ts="13:48" txt="Critical alert · Guadiana lower basin" tone="alert" />
          <ActivityItem ts="13:30" txt="3 DEM zones promoted to candidates" tone="warning" />
          <ActivityItem ts="12:11" txt="ERA5 weather sync complete" tone="success" />
        </ul>
      </div>
    </div>
  );
}

function ActivityItem({ ts, txt, tone }: { ts: string; txt: string; tone: "primary" | "alert" | "warning" | "success" }) {
  const c = { primary: "bg-primary", alert: "bg-alert", warning: "bg-warning", success: "bg-success" }[tone];
  return (
    <li className="flex items-start gap-2.5">
      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${c} shadow-[0_0_6px_currentColor]`} />
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="leading-snug text-foreground/90">{txt}</p>
        <p className="font-mono text-[9px] text-foreground/40">UTC {ts}</p>
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
    <div className="flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-3.5 w-3.5 ${colorCls}`} />
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/50">{label}</p>
      </div>
      <p className={`text-2xl font-bold leading-none ${colorCls}`} style={{ textShadow: "0 0 14px currentColor" }}>{value}</p>
      <p className="text-[10px] text-foreground/50">{sub}</p>
    </div>
  );
}

/* -------- LAYERS -------- */
function LayersView({
  layers, onToggleLayer, onZoneClick,
}: { layers: LayerState; onToggleLayer: (k: keyof LayerState) => void; onZoneClick: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <ToggleRow
        icon={Waves}
        title="Sentinel-3 Water Evolution"
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

      <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-warning/30 bg-warning/[0.06] p-4">
        <div className="flex items-center gap-2">
          <Mountain className="h-3.5 w-3.5 text-warning" />
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-warning">
            DEM Recommended Zones
          </p>
        </div>
        <p className="text-[11px] leading-relaxed text-foreground/60">
          Algorithmic dam candidates. Click a zone on the map to analyze.
        </p>
        <ul className="flex flex-col gap-1.5">
          {RECOMMENDED_ZONES.map((z) => (
            <li key={z.id}>
              <button
                onClick={() => onZoneClick(z.id)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-left text-[11px] transition-colors hover:border-warning/50 hover:bg-warning/10"
              >
                <span className="text-foreground/90">{z.name}</span>
                <ChevronRight className="h-3 w-3 shrink-0 text-warning" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ToggleRow({
  icon: Icon, title, sub, checked, onChange, accent,
}: { icon: any; title: string; sub: string; checked: boolean; onChange: () => void; accent: "primary" | "alert" | "warning" }) {
  const c = { primary: "text-primary", alert: "text-alert", warning: "text-warning" }[accent];
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-1 items-start gap-3 min-w-0">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${c}`} />
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-[12px] font-semibold leading-tight text-foreground">{title}</p>
          <p className="text-[10px] leading-snug text-foreground/55">{sub}</p>
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5 rounded-2xl border border-primary/30 bg-primary/[0.06] p-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-3.5 w-3.5 text-primary" />
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">
            Active Scenario
          </p>
        </div>
        <p className="text-[12px] font-semibold">Dam Construction Pipeline</p>
        <p className="text-[10px] leading-snug text-foreground/55">
          Multi-stage simulation persisted to PostGIS.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {steps.map((s, i) => {
          const idx = i + 1;
          const active = step === idx;
          const done = step > idx;
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`flex items-center gap-3 rounded-2xl border p-3 transition-all ${
                active
                  ? "border-primary/50 bg-primary/10 shadow-glow-cyan"
                  : done
                    ? "border-success/30 bg-success/[0.06]"
                    : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                  active ? "bg-primary/20 text-primary" : done ? "bg-success/20 text-success" : "bg-white/5 text-foreground/40"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "animate-pulse" : ""}`} />
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <p className={`text-[11px] font-medium leading-tight ${active ? "text-primary" : done ? "text-success" : "text-foreground/80"}`}>
                  Step {idx} · {s.label}
                </p>
                <p className="font-mono text-[9px] text-foreground/40">
                  {done ? "COMPLETE" : active ? "RUNNING…" : "PENDING"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/50">
          Quick Targets
        </p>
        <p className="text-[10px] leading-snug text-foreground/55">
          Launch viability analysis on a recommended zone.
        </p>
        <ul className="mt-1 flex flex-col gap-1.5">
          {RECOMMENDED_ZONES.map((z) => (
            <li key={z.id}>
              <button
                onClick={() => onZoneClick(z.id)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-left text-[11px] transition-colors hover:border-primary/40 hover:bg-primary/10"
              >
                <span className="text-foreground/90">{z.name}</span>
                <ChevronRight className="h-3 w-3 shrink-0 text-primary" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
