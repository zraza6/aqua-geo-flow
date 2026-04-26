import {
  Activity,
  AlertTriangle,
  Droplets,
  Mountain,
  Radar,
  Waves,
  TestTubes,
  Settings as SettingsIcon,
  ChevronRight,
  Sliders,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { CommandTab } from "./CommandHub";
import type { LayerState } from "./AquaMap";
import { RECOMMENDED_ZONES } from "./AquaMap";
import { stopMapPropagation, GLASS } from "./stopMap";

interface Props {
  tab: CommandTab;
  layers: LayerState;
  onToggleLayer: (k: keyof LayerState) => void;
  onZoneClick: (id: string) => void;
}

export function ContextPanel({ tab, layers, onToggleLayer, onZoneClick }: Props) {
  return (
    <aside
      className={`${GLASS} pointer-events-auto flex h-full w-72 flex-col overflow-hidden md:w-80`}
      {...stopMapPropagation}
    >
      <header className="flex flex-col gap-1 border-b border-white/10 px-6 py-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400 [text-shadow:0_0_10px_rgba(34,211,238,0.6)]">
          {labels[tab].kicker}
        </p>
        <h2 className="text-[15px] font-semibold leading-tight text-white">
          {labels[tab].title}
        </h2>
      </header>
      <div className="no-scrollbar flex-1 overflow-y-auto p-5">
        {tab === "dashboard" && <Dashboard />}
        {tab === "layers" && (
          <LayersPanel layers={layers} onToggleLayer={onToggleLayer} onZoneClick={onZoneClick} />
        )}
        {tab === "scenarios" && <ScenariosPanel onZoneClick={onZoneClick} />}
        {tab === "settings" && <SettingsPanel />}
      </div>
    </aside>
  );
}

const labels: Record<CommandTab, { kicker: string; title: string }> = {
  dashboard: { kicker: "Command Dashboard", title: "Hydro Intelligence" },
  layers: { kicker: "Earth Observation", title: "Satellite Layers" },
  scenarios: { kicker: "Decision Engine", title: "Scenario Library" },
  settings: { kicker: "Configuration", title: "System Settings" },
};

/* ---------- DASHBOARD ---------- */
function Dashboard() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Kpi icon={Droplets} label="Basins" value="1,247" sub="EU-27" tone="cyan" />
        <Kpi icon={AlertTriangle} label="Alerts" value="38" sub="↑ 12 wk" tone="rose" />
        <Kpi icon={Mountain} label="DEM Hotspots" value="3" sub="Viable" tone="amber" />
        <Kpi icon={Activity} label="Sentinel" value="2h" sub="ago · live" tone="emerald" />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">
          Recent Activity
        </p>
        <ul className="mt-3 flex flex-col gap-3">
          <Activ ts="14:02" txt="SMAP soil moisture refresh — Andalusia basin" tone="cyan" />
          <Activ ts="13:48" txt="Critical alert · Guadiana lower basin drought" tone="rose" />
          <Activ ts="13:30" txt="3 DEM hotspots promoted to dam candidates" tone="amber" />
          <Activ ts="12:11" txt="ERA5 reanalysis sync · Iberian peninsula" tone="emerald" />
        </ul>
      </div>
    </div>
  );
}

function Activ({ ts, txt, tone }: { ts: string; txt: string; tone: Tone }) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot[tone]} [box-shadow:0_0_6px_currentColor]`}
      />
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="text-[11px] font-light leading-relaxed text-white/85">{txt}</p>
        <p className="font-mono text-[9px] text-white/35">UTC {ts}</p>
      </div>
    </li>
  );
}

type Tone = "cyan" | "rose" | "amber" | "emerald";
const text: Record<Tone, string> = {
  cyan: "text-cyan-400",
  rose: "text-rose-400",
  amber: "text-amber-400",
  emerald: "text-emerald-400",
};
const dot: Record<Tone, string> = {
  cyan: "bg-cyan-400",
  rose: "bg-rose-400",
  amber: "bg-amber-400",
  emerald: "bg-emerald-400",
};

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: any;
  label: string;
  value: string;
  sub: string;
  tone: Tone;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3 w-3 ${text[tone]}`} />
        <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/45">
          {label}
        </p>
      </div>
      <p
        className={`text-2xl font-bold leading-none ${text[tone]}`}
        style={{ textShadow: "0 0 14px currentColor" }}
      >
        {value}
      </p>
      <p className="text-[10px] font-light text-white/45">{sub}</p>
    </div>
  );
}

/* ---------- LAYERS ---------- */
function LayersPanel({
  layers,
  onToggleLayer,
  onZoneClick,
}: {
  layers: LayerState;
  onToggleLayer: (k: keyof LayerState) => void;
  onZoneClick: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <ToggleRow
        icon={Waves}
        title="Sentinel-2 Water Evolution"
        sub="Mock NDWI heatmap dots tracing river networks across Andalusia."
        checked={layers.waterEvolution}
        onChange={() => onToggleLayer("waterEvolution")}
        tone="cyan"
      />
      <ToggleRow
        icon={Radar}
        title="SAR Urban Footprint"
        sub="Sentinel-1 backscatter — DO NOT flood zones (cities)."
        checked={layers.sarUrban}
        onChange={() => onToggleLayer("sarUrban")}
        tone="rose"
      />
      <ToggleRow
        icon={Mountain}
        title="DEM Hotspots"
        sub="Algorithmically-derived dam candidate valleys."
        checked={layers.dem}
        onChange={() => onToggleLayer("dem")}
        tone="amber"
      />

      <div className="mt-2 rounded-2xl border border-amber-400/25 bg-amber-400/[0.05] p-4">
        <div className="flex items-center gap-2">
          <Mountain className="h-3.5 w-3.5 text-amber-400" />
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-amber-400">
            Quick Targets
          </p>
        </div>
        <p className="mt-2 text-[11px] font-light leading-relaxed text-white/55">
          Click a candidate to launch an Earth Engine viability analysis.
        </p>
        <ul className="mt-3 flex flex-col gap-1.5">
          {RECOMMENDED_ZONES.map((z) => (
            <li key={z.id}>
              <button
                onClick={() => onZoneClick(z.id)}
                className="group flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-left text-[11px] font-light text-white/85 transition-colors hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-white"
              >
                <span>{z.name}</span>
                <ChevronRight className="h-3 w-3 shrink-0 text-amber-400 transition-transform group-hover:translate-x-0.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-1 px-1 font-mono text-[9px] uppercase tracking-wider text-white/30">
        Source · Copernicus Open Access Hub · ESA · 2024
      </p>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  sub,
  checked,
  onChange,
  tone,
}: {
  icon: any;
  title: string;
  sub: string;
  checked: boolean;
  onChange: () => void;
  tone: Tone;
}) {
  const bg = {
    cyan: "border-cyan-400/25 bg-cyan-400/[0.06]",
    rose: "border-rose-400/25 bg-rose-400/[0.06]",
    amber: "border-amber-400/25 bg-amber-400/[0.06]",
    emerald: "border-emerald-400/25 bg-emerald-400/[0.06]",
  }[tone];
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.06]">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border ${bg}`}>
        <Icon className={`h-4 w-4 ${text[tone]}`} />
      </div>
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <p className="text-[12px] font-semibold leading-tight text-white">{title}</p>
        <p className="text-[11px] font-light leading-relaxed text-white/55">{sub}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} className="mt-1" />
    </label>
  );
}

/* ---------- SCENARIOS ---------- */
function ScenariosPanel({ onZoneClick }: { onZoneClick: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-cyan-400/25 bg-cyan-400/[0.05] p-4">
        <div className="flex items-center gap-2">
          <TestTubes className="h-3.5 w-3.5 text-cyan-400" />
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-cyan-400">
            Active Pipeline
          </p>
        </div>
        <p className="mt-2 text-[12px] font-semibold text-white">Dam Construction · v3</p>
        <p className="mt-1 text-[11px] font-light leading-relaxed text-white/55">
          Multi-stage simulation: river deviation → primary wall → basin fill.
          Every step persists to PostGIS.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">
          Available Targets
        </p>
        <ul className="mt-3 flex flex-col gap-1.5">
          {RECOMMENDED_ZONES.map((z) => (
            <li key={z.id}>
              <button
                onClick={() => onZoneClick(z.id)}
                className="group flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-left text-[11px] font-light text-white/85 transition-colors hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-white"
              >
                <span>{z.name}</span>
                <ChevronRight className="h-3 w-3 shrink-0 text-cyan-400 transition-transform group-hover:translate-x-0.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">
          Pipeline Catalog
        </p>
        <ul className="mt-3 flex flex-col gap-2 text-[11px] font-light text-white/65">
          <li className="flex items-center justify-between">
            <span>Dam construction</span>
            <span className="font-mono text-emerald-400">READY</span>
          </li>
          <li className="flex items-center justify-between">
            <span>River diversion</span>
            <span className="font-mono text-white/30">SOON</span>
          </li>
          <li className="flex items-center justify-between">
            <span>Aquifer recharge</span>
            <span className="font-mono text-white/30">SOON</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

/* ---------- SETTINGS ---------- */
function SettingsPanel() {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-3.5 w-3.5 text-white/65" />
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">
            Workspace
          </p>
        </div>
        <ul className="mt-3 flex flex-col gap-2.5 text-[11px] font-light text-white/75">
          <li className="flex justify-between">
            <span>Region</span>
            <span className="font-mono text-cyan-400">EU-S · Iberian</span>
          </li>
          <li className="flex justify-between">
            <span>Projection</span>
            <span className="font-mono text-cyan-400">EPSG:4326</span>
          </li>
          <li className="flex justify-between">
            <span>Tile cache</span>
            <span className="font-mono text-cyan-400">432 MB</span>
          </li>
          <li className="flex justify-between">
            <span>Inference engine</span>
            <span className="font-mono text-cyan-400">Earth Engine v2</span>
          </li>
        </ul>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-3.5 w-3.5 text-white/65" />
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">
            Display
          </p>
        </div>
        <p className="mt-2 text-[11px] font-light leading-relaxed text-white/55">
          Vision Pro Liquid Glass theme · always on. Reduced-motion respected.
        </p>
      </div>
    </div>
  );
}
