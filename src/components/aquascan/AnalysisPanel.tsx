import {
  X,
  Dam,
  Loader2,
  RotateCcw,
  Waves,
  Cpu,
  Activity,
  Droplets,
  Map as MapIcon,
  ShieldAlert,
  Scale,
  TrendingUp,
  Mountain,
  Trees,
  Compass,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { stopMapPropagation } from "./stopMap";

export type SimulationStatus =
  | "idle"
  | "modeling"
  | "deviating"
  | "constructing"
  | "complete";

interface Props {
  onClose: () => void;
  onSimulate: () => void;
  onReset: () => void;
  area: number;
  zoneName: string;
  simulationStatus: SimulationStatus;
  lat: number;
  lng: number;
}

/* ---------- Seeded RNG so a given coord always produces the same report ---------- */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = (rng: () => number, min: number, max: number) =>
  min + rng() * (max - min);

export function AnalysisPanel({
  onClose,
  onSimulate,
  onReset,
  area,
  zoneName,
  simulationStatus,
  lat,
  lng,
}: Props) {
  const running =
    simulationStatus === "modeling" ||
    simulationStatus === "deviating" ||
    simulationStatus === "constructing";
  const done = simulationStatus === "complete";

  /* Deterministic mock pre-feasibility report driven by coordinates. */
  const report = useMemo(() => {
    const seed = Math.floor((lat + 90) * 1e4) ^ Math.floor((lng + 180) * 1e4);
    const r = mulberry32(seed || 1);

    // Coarse elevation model: latitude band + jitter so it varies globally
    const baseElev = Math.max(
      0,
      Math.round(rand(r, 20, 2400) * (1 - Math.abs(Math.abs(lat) - 45) / 90)),
    );
    const elevation = baseElev;
    const terrainType =
      elevation < 200
        ? "Plains / Lowland"
        : elevation < 800
          ? "Hills / Plateau"
          : elevation < 1800
            ? "Mountainous Terrain"
            : "Alpine / High Mountain";
    const landCovers = [
      "Broadleaf Forest",
      "Coniferous Forest",
      "Grassland",
      "Cropland",
      "Sparse Vegetation",
      "Wetland",
      "Bare Soil",
      "Urban Fabric",
    ];
    const landCover = landCovers[Math.floor(r() * landCovers.length)];

    const elevDrop = rand(r, 15, 120);
    const discharge = rand(r, 0.5, 45.2);
    const continuity = r() > 0.35 ? "Stable" : "Drought-prone";
    const ksat = rand(r, 2.1, 35.5);
    const egms = rand(r, -4.5, 1.2);
    const urbanDist = rand(r, 0.5, 15);
    const roiSavings = Math.round(rand(r, 18000, 45000) / 100) * 100;

    return {
      elevation: elevation.toLocaleString("en-US"),
      terrainType,
      landCover,
      elevDrop: elevDrop.toFixed(1),
      discharge: discharge.toFixed(2),
      continuity,
      ksat: ksat.toFixed(2),
      ksatHigh: ksat > 20,
      egms: (egms >= 0 ? "+" : "") + egms.toFixed(2),
      egmsRisk: egms < -2,
      urbanDist:
        urbanDist >= 1 ? `${urbanDist.toFixed(2)} km` : `${Math.round(urbanDist * 1000)} m`,
      roiSavings: roiSavings.toLocaleString("de-DE"),
    };
  }, [lat, lng]);

  return (
    <motion.aside
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 24, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="pointer-events-auto flex max-h-[82vh] w-[calc(100vw-7rem)] max-w-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md"
      {...stopMapPropagation}
    >
      {/* Header */}
      <div className="relative flex flex-col gap-1.5 border-b border-white/10 px-5 py-4">
        <button
          onClick={onClose}
          disabled={running}
          aria-label="Close basin profile"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-cyan-400 [text-shadow:0_0_10px_rgba(34,211,238,0.6)]">
          Pre-Feasibility · HeavyWater
        </p>
        <h2 className="text-[14px] font-semibold leading-tight text-white">
          {zoneName}
        </h2>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[9.5px] font-light text-white/55">
          <span>{area.toFixed(2)} km²</span>
          <Dot />
          <span>
            {lat.toFixed(3)}°, {lng.toFixed(3)}°
          </span>
          <Dot />
          <span>EPSG:4326</span>
        </div>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-4">
        <Accordion
          type="multiple"
          defaultValue={["hydro", "geo", "env", "econ"]}
          className="flex flex-col gap-2"
        >
          {/* A — HYDROLOGY */}
          <Section
            value="hydro"
            icon={Activity}
            iconColor="text-cyan-400"
            title="Hydrology & Terrain"
            sub="CDSE · GloFAS"
          >
            <Row
              label="DEM Elevation Drop"
              meta="Copernicus GLO-30"
              value={`${report.elevDrop} m`}
            />
            <Row
              label="Average Discharge"
              meta="GloFAS / EFAS"
              value={`${report.discharge} m³/s`}
            />
            <Row
              label="Flow Continuity"
              meta="Multi-year ensemble"
              value={report.continuity}
              valueTone={
                report.continuity === "Stable" ? "emerald" : "amber"
              }
              warn={report.continuity !== "Stable" ? "Warning" : undefined}
            />
          </Section>

          {/* B — GEOTECHNICAL */}
          <Section
            value="geo"
            icon={ShieldAlert}
            iconColor="text-amber-400"
            title="Geotechnical & Stability"
            sub="SoilGrids · EGMS"
          >
            <Row
              label="Soil Permeability (Ksat)"
              meta="ISRIC SoilGrids v2.0"
              value={`${report.ksat} mm/h`}
              valueTone={report.ksatHigh ? "rose" : "emerald"}
            />
            {report.ksatHigh && (
              <Tag tone="rose">High Seepage · HDPE Liner Required</Tag>
            )}
            <Row
              label="Structural Stability"
              meta="EGMS L3 Vertical"
              value={`${report.egms} mm/yr`}
              valueTone={report.egmsRisk ? "rose" : "emerald"}
            />
            {report.egmsRisk && (
              <Tag tone="rose">Subsidence Risk Detected</Tag>
            )}
          </Section>

          {/* C — ENVIRONMENTAL */}
          <Section
            value="env"
            icon={MapIcon}
            iconColor="text-emerald-400"
            title="Environmental & Legal"
            sub="CLMS · Water Law 107/1996"
          >
            <Row
              label="Urban Proximity"
              meta="Copernicus CLMS HRL"
              value={report.urbanDist}
            />
            <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
              <div className="flex items-center gap-1.5">
                <Scale className="h-3 w-3 text-emerald-400" />
                <p className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-white/55">
                  Legal Status
                </p>
              </div>
              <p className="mt-1 text-[10.5px] font-light leading-snug text-white/80">
                Requires{" "}
                <span className="font-medium text-emerald-300">
                  "Water Management Approval"
                </span>{" "}
                (Art. 48, Romanian Water Law No. 107/1996) prior to execution.
              </p>
            </div>
          </Section>

          {/* D — ECONOMICS */}
          <Section
            value="econ"
            icon={Droplets}
            iconColor="text-cyan-400"
            title="Enterprise Economics"
            sub="SEAP averages"
          >
            <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/[0.07] p-3">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-cyan-400" />
                <p className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-cyan-300">
                  ROI Estimate
                </p>
              </div>
              <p
                className="mt-1.5 font-mono text-xl font-bold leading-none text-cyan-300"
                style={{ textShadow: "0 0 14px rgba(34,211,238,0.6)" }}
              >
                €{report.roiSavings}
              </p>
              <p className="mt-1.5 text-[10.5px] font-light leading-snug text-white/70">
                Replaces ~6 months of manual topographical surveys. Estimate
                derived from SEAP public procurement averages.
              </p>
            </div>
          </Section>
        </Accordion>
      </div>

      {/* Decision footer */}
      <div className="shrink-0 border-t border-white/10 bg-slate-900/95 px-4 py-4 backdrop-blur-md">
        <SimulatorButton
          status={simulationStatus}
          onSimulate={onSimulate}
          onReset={onReset}
        />
      </div>
    </motion.aside>
  );
}

/* ---------- Sub-components ---------- */
function Section({
  value,
  icon: Icon,
  iconColor,
  title,
  sub,
  children,
}: {
  value: string;
  icon: any;
  iconColor: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem
      value={value}
      className="rounded-xl border border-white/10 bg-white/[0.03] px-3 data-[state=open]:bg-white/[0.05]"
    >
      <AccordionTrigger className="py-2.5 hover:no-underline">
        <span className="flex items-center gap-2">
          <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[11px] font-semibold text-white">{title}</span>
            <span className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-white/40">
              {sub}
            </span>
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-3">
        <div className="flex flex-col gap-1.5">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

function Row({
  label,
  meta,
  value,
  valueTone = "white",
  warn,
}: {
  label: string;
  meta?: string;
  value: string;
  valueTone?: "white" | "emerald" | "rose" | "amber";
  warn?: string;
}) {
  const toneCls = {
    white: "text-white",
    emerald: "text-emerald-300",
    rose: "text-rose-300",
    amber: "text-amber-300",
  }[valueTone];
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5">
      <div className="flex min-w-0 flex-col">
        <span className="text-[10.5px] font-light leading-tight text-white/80">
          {label}
        </span>
        {meta && (
          <span className="font-mono text-[8.5px] uppercase tracking-wider text-white/35">
            {meta}
          </span>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className={`font-mono text-[11px] font-semibold ${toneCls}`}>
          {value}
        </span>
        {warn && (
          <span className="rounded-full bg-amber-400/15 px-1.5 py-px font-mono text-[8px] uppercase tracking-wider text-amber-300">
            {warn}
          </span>
        )}
      </div>
    </div>
  );
}

function Tag({ tone, children }: { tone: "rose" | "amber"; children: React.ReactNode }) {
  const cls =
    tone === "rose"
      ? "border-rose-400/40 bg-rose-400/10 text-rose-200"
      : "border-amber-400/40 bg-amber-400/10 text-amber-200";
  return (
    <div
      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-medium ${cls}`}
    >
      <ShieldAlert className="h-3 w-3" />
      <span>{children}</span>
    </div>
  );
}

function SimulatorButton({
  status,
  onSimulate,
  onReset,
}: {
  status: SimulationStatus;
  onSimulate: () => void;
  onReset: () => void;
}) {
  if (status === "idle") {
    return (
      <button
        onClick={onSimulate}
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-cyan-400/50 bg-gradient-to-br from-cyan-500/30 via-cyan-400/20 to-cyan-600/30 px-4 py-3 text-sm font-semibold text-cyan-100 transition-all hover:border-cyan-300 hover:from-cyan-400/40 hover:to-cyan-500/40 [box-shadow:0_0_20px_rgba(34,211,238,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]"
      >
        <Dam className="h-4 w-4" />
        <span className="font-mono text-[10.5px] uppercase tracking-[0.2em]">
          Simulate New Reservoir
        </span>
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      </button>
    );
  }

  if (status === "complete") {
    return (
      <button
        onClick={onReset}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white/85 transition-all hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
      >
        <RotateCcw className="h-4 w-4" />
        <span className="font-mono text-[10.5px] uppercase tracking-[0.2em]">
          Reset Scenario
        </span>
      </button>
    );
  }

  const stages: Record<
    Exclude<SimulationStatus, "idle" | "complete">,
    { label: string; icon: typeof Waves; n: number }
  > = {
    modeling: { label: "Running flood models…", icon: Loader2, n: 1 },
    deviating: { label: "Deviating river flow…", icon: Waves, n: 2 },
    constructing: { label: "Constructing primary wall…", icon: Cpu, n: 3 },
  };
  const { label, icon: Icon, n } = stages[status];

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-3 text-cyan-200 [box-shadow:0_0_18px_rgba(34,211,238,0.3),inset_0_1px_0_rgba(255,255,255,0.08)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        {Icon !== Loader2 && <Icon className="h-4 w-4 animate-pulse" />}
        <span className="font-mono text-[10.5px] uppercase tracking-[0.2em]">
          {label}
        </span>
      </div>
      <div className="flex h-1 gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-full flex-1 rounded-full transition-all ${
              i <= n
                ? "bg-cyan-400 [box-shadow:0_0_8px_rgba(34,211,238,0.7)]"
                : "bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function Dot() {
  return <span className="h-1 w-1 rounded-full bg-white/20" />;
}
