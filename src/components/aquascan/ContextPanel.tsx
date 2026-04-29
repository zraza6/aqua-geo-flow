import {
  Activity,
  AlertTriangle,
  Droplets,
  Mountain,
  Radar,
  Waves,
  Sparkles,
  Crosshair,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import type { CommandTab } from "./CommandHub";
import type { LayerState } from "./AquaMap";
import { stopMapPropagation, GLASS } from "./stopMap";
import { viewportBus } from "./viewportBus";

interface Props {
  tab: CommandTab;
  layers: LayerState;
  onToggleLayer: (k: keyof LayerState) => void;
}

export function ContextPanel({ tab, layers, onToggleLayer }: Props) {
  return (
    <aside
      className={`${GLASS} pointer-events-auto flex h-full w-64 flex-col overflow-hidden md:w-72`}
      {...stopMapPropagation}
    >
      <header className="flex flex-col gap-0.5 border-b border-white/10 px-5 py-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-cyan-400 [text-shadow:0_0_10px_rgba(34,211,238,0.6)]">
          {labels[tab].kicker}
        </p>
        <h2 className="text-[14px] font-semibold leading-tight text-white">
          {labels[tab].title}
        </h2>
      </header>
      <div
        key={tab}
        className="no-scrollbar flex-1 animate-[fade-in_0.3s_ease-out] overflow-y-auto p-4"
      >
        {tab === "dashboard" && <Dashboard />}
        {tab === "layers" && (
          <LayersPanel layers={layers} onToggleLayer={onToggleLayer} />
        )}
      </div>
    </aside>
  );
}

const labels: Record<CommandTab, { kicker: string; title: string }> = {
  dashboard: { kicker: "Command Dashboard", title: "Hydro Intelligence" },
  layers: { kicker: "Earth Observation", title: "Satellite Layers" },
};

/* ---------- DASHBOARD ---------- */
function Dashboard() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Kpi icon={Droplets} label="Basins" value="1,247" sub="EU-27 monitored" tone="cyan" />
        <Kpi icon={AlertTriangle} label="Drought Alerts" value="38" sub="↑ 12 this week" tone="rose" />
        <Kpi icon={Mountain} label="DEM Hotspots" value="3" sub="Apuseni cluster" tone="amber" />
        <Kpi icon={Activity} label="Sentinel" value="2h" sub="Last pass · live" tone="emerald" />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">
          Activity Feed
        </p>
        <ul className="mt-3 flex flex-col gap-3">
          <Activ
            ts="14:02"
            txt="New DEM hotspot identified in Apuseni · Someșul Cald valley"
            tone="amber"
          />
          <Activ
            ts="13:48"
            txt="Critical alert · Crișul Repede headwaters · NDWI -22%"
            tone="rose"
          />
          <Activ
            ts="13:30"
            txt="Sentinel-2 NDWI refresh · Transylvanian basin"
            tone="cyan"
          />
          <Activ
            ts="12:11"
            txt="ERA5 reanalysis sync · Carpathian region"
            tone="emerald"
          />
        </ul>
      </div>

      <div className="rounded-2xl border border-cyan-400/25 bg-cyan-400/[0.05] p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-cyan-400">
            Tip
          </p>
        </div>
        <p className="mt-2 text-[11px] font-light leading-relaxed text-white/65">
          Click any gold valley on the map or draw a custom AOI to launch a
          basin viability analysis.
        </p>
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
      <p className="text-[10px] font-light leading-relaxed text-white/45">
        {sub}
      </p>
    </div>
  );
}

/* ---------- LAYERS ---------- */
function LayersPanel({
  layers,
  onToggleLayer,
}: {
  layers: LayerState;
  onToggleLayer: (k: keyof LayerState) => void;
}) {
  const [vp, setVp] = useState(viewportBus.get());
  useEffect(() => viewportBus.subscribe(setVp), []);

  const fmt = (n: number) =>
    `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(4)}°`;

  return (
    <div className="flex flex-col gap-3">
      {/* Dynamic viewport indicator */}
      <div className="flex items-center justify-between gap-2 rounded-xl border border-cyan-400/25 bg-cyan-400/[0.06] px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
          </span>
          <Crosshair className="h-3 w-3 text-cyan-400" />
          <p className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-cyan-300">
            Active Viewport Center
          </p>
        </div>
        <p
          className="font-mono text-[10px] font-semibold tabular-nums text-cyan-200"
          style={{ textShadow: "0 0 8px rgba(34,211,238,0.5)" }}
        >
          {fmt(vp.lat)}, {fmt(vp.lng)}
        </p>
      </div>

      <ToggleRow
        icon={Waves}
        title="Sentinel-2 Water Evolution"
        sub="Surface water network tracing within the active viewport. Source: Copernicus Data Space Ecosystem (CDSE) & GloFAS."
        checked={layers.waterEvolution}
        onChange={() => onToggleLayer("waterEvolution")}
        tone="cyan"
      />
      <ToggleRow
        icon={Radar}
        title="SAR Urban Footprint"
        sub="Imperviousness mapping to identify DO NOT flood zones currently on screen. Source: Copernicus Land Monitoring Service (CLMS)."
        checked={layers.sarUrban}
        onChange={() => onToggleLayer("sarUrban")}
        tone="rose"
      />
      <ToggleRow
        icon={Mountain}
        title="DEM Hotspots"
        sub="Algorithmically-derived dam candidate valleys using GLO-30 DEM and ISRIC SoilGrids v2.0."
        checked={layers.dem}
        onChange={() => onToggleLayer("dem")}
        tone="amber"
      />

      <p className="mt-1 px-1 font-mono text-[9px] uppercase tracking-wider text-white/35">
        <span className="text-emerald-300/80">Compliance:</span> Legea Apelor nr. 107/1996{" "}
        <span className="text-white/25">•</span>{" "}
        <span className="text-cyan-300/80">ROI Data:</span> SEAP
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
