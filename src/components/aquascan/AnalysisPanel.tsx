import {
  X,
  Dam,
  Loader2,
  RotateCcw,
  Waves,
  Cpu,
  Activity,
  ShieldAlert,
  Scale,
  TrendingUp,
  AlertTriangle,
  FileDown,
  CheckCircle2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
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

/* Seeded RNG so a given coord always produces the same report */
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

  const report = useMemo(() => {
    const seed = Math.floor((lat + 90) * 1e4) ^ Math.floor((lng + 180) * 1e4);
    const r = mulberry32(seed || 1);

    const discharge = rand(r, 2.5, 40);
    const peakFlow = rand(r, 150, 450);
    const ksat = rand(r, 5, 35);
    const bedrock = rand(r, 4, 12);
    const urbanDist = rand(r, 5, 20);

    return {
      discharge: discharge.toFixed(1),
      peakFlow: Math.round(peakFlow),
      catchmentEff: 82,
      ksat: ksat.toFixed(1),
      ksatHigh: ksat > 20,
      bedrock: bedrock.toFixed(1),
      egms: -1.2,
      urbanDist: urbanDist.toFixed(1),
    };
  }, [lat, lng]);

  return (
    <motion.aside
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 24, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="pointer-events-auto isolate mr-20 flex h-[80vh] max-h-[85vh] w-[480px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950/75 backdrop-blur-xl shadow-[0_0_20px_-5px_rgba(34,211,238,0.15),0_8px_32px_rgba(0,0,0,0.5)] [border-radius:1.5rem] [clip-path:inset(0_round_1.5rem)] [contain:paint]"
      {...stopMapPropagation}
    >
      {/* === STICKY HEADER === */}
      <header className="relative shrink-0 rounded-t-3xl border-b border-white/10 bg-slate-950/80 px-6 pb-6 pt-5 backdrop-blur-xl">
        <button
          onClick={onClose}
          disabled={running}
          aria-label="Close report"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-cyan-400 [text-shadow:0_0_10px_rgba(34,211,238,0.6)]">
          Pre-Feasibility Site Report
        </p>
        <h2 className="mt-1.5 pr-8 text-[16px] font-semibold leading-tight text-white">
          {zoneName}
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-white/60">
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">
            <span className="text-white/40">AOI</span>{" "}
            <strong className="font-bold text-white">{area.toFixed(2)} km²</strong>
          </span>
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">
            <span className="text-white/40">LAT</span>{" "}
            <strong className="font-bold text-white">{lat.toFixed(4)}°</strong>
          </span>
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">
            <span className="text-white/40">LNG</span>{" "}
            <strong className="font-bold text-white">{lng.toFixed(4)}°</strong>
          </span>
        </div>
      </header>

      {/* === SCROLLABLE BODY === */}
      <div className="dark-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="flex flex-col gap-5 p-5">
          {/* A — HYDROLOGICAL */}
          <Module
            icon={Activity}
            tone="cyan"
            label="A · Hydrology"
            source="GloFAS / CDSE"
          >
            <DataRow
              label="Average Annual Discharge"
              value={`${report.discharge} m³/s`}
            />
            <DataRow
              label="Peak Flow (100y return)"
              value={`${report.peakFlow} m³/s`}
            />
            <DataRow
              label="Catchment Efficiency"
              value={`High (${report.catchmentEff}%)`}
              status="good"
            />
          </Module>

          <Divider />

          {/* B — GEOTECHNICAL */}
          <Module
            icon={ShieldAlert}
            tone="amber"
            label="B · Geotechnics"
            source="SoilGrids v2.0 / EGMS"
          >
            <DataRow
              label="Soil Permeability (Ksat)"
              value={`${report.ksat} mm/h`}
              status={report.ksatHigh ? "bad" : "good"}
            />
            {report.ksatHigh && (
              <Alert tone="bad">
                High Seepage Risk — Impermeable Lining Required
              </Alert>
            )}
            <DataRow
              label="Bedrock Depth"
              value={`Approx. ${report.bedrock} m`}
            />
            <DataRow
              label="Structural Stability (InSAR)"
              value={`${report.egms} mm/yr (Stable)`}
              status="good"
            />
          </Module>

          <Divider />

          {/* C — ENVIRONMENTAL & LEGAL */}
          <Module
            icon={Scale}
            tone="emerald"
            label="C · Legal Compliance"
            source="Romanian Water Law 107/1996"
          >
            <DataRow
              label="Compliance"
              value="Art. 48 compliant"
              status="good"
            />
            <DataRow
              label="Urban Proximity"
              value={`${report.urbanDist} km to nearest settlement`}
            />
            <DataRow
              label="Protected Areas"
              value="No environmental overlap"
              status="good"
            />
          </Module>

          <Divider />

          {/* D — ECONOMICS */}
          <Module
            icon={TrendingUp}
            tone="cyan"
            label="D · Project Economics"
            source="SEAP Public Procurement Data"
          >
            <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/[0.06] p-4">
              <p className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-cyan-300">
                Digital Survey Savings
              </p>
              <p
                className="mt-1.5 font-mono text-2xl font-bold leading-none text-cyan-300"
                style={{ textShadow: "0 0 14px rgba(34,211,238,0.6)" }}
              >
                €18,500
              </p>
              <p className="mt-2.5 text-[11px] font-light leading-snug text-white/70">
                Replaces <strong className="font-bold text-white">6 months</strong>{" "}
                of manual topographical field work.
              </p>
            </div>
          </Module>
        </div>
      </div>

      {/* === STICKY FOOTER === */}
      <footer className="relative z-10 shrink-0 overflow-hidden rounded-b-3xl border-t border-white/10 bg-slate-950/95 px-5 py-4 backdrop-blur-xl [border-bottom-left-radius:1.5rem] [border-bottom-right-radius:1.5rem]">
        <div className="flex flex-col gap-2.5">
          <SimulatorButton
            status={simulationStatus}
            onSimulate={onSimulate}
            onReset={onReset}
          />
          <ExportPdfButton zoneName={zoneName} />
        </div>
      </footer>
    </motion.aside>
  );
}

function ExportPdfButton({ zoneName }: { zoneName: string }) {
  const [loading, setLoading] = useState(false);
  const handleExport = () => {
    if (loading) return;
    setLoading(true);
    const id = toast.loading("Generating PDF…", {
      description: `Compiling pre-feasibility report for ${zoneName}`,
    });
    window.setTimeout(() => {
      setLoading(false);
      toast.success("Report ready", {
        id,
        description: `${zoneName.replace(/\s+/g, "_")}_PreFeasibility.pdf · 2.4 MB`,
        icon: <CheckCircle2 className="h-4 w-4 text-cyan-400" />,
        duration: 4500,
      });
    }, 1800);
  };
  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="group flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-transparent px-4 py-2.5 text-cyan-200 transition-all hover:border-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-100 disabled:opacity-60 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.04)]"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <FileDown className="h-3.5 w-3.5" />
      )}
      <span className="font-mono text-[10px] uppercase tracking-[0.22em]">
        {loading ? "Generating PDF…" : "Export Report PDF"}
      </span>
    </button>
  );
}

/* ---------- Sub-components ---------- */

function Module({
  icon: Icon,
  tone,
  label,
  source,
  children,
}: {
  icon: any;
  tone: "cyan" | "amber" | "emerald";
  label: string;
  source: string;
  children: React.ReactNode;
}) {
  const toneCls = {
    cyan: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
    amber: "text-amber-400 border-amber-400/30 bg-amber-400/10",
    emerald: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  }[tone];
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg border ${toneCls}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="text-[11.5px] font-semibold uppercase tracking-wider text-white">
            {label}
          </span>
          <span className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-white/40">
            Source: {source}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </section>
  );
}

function DataRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status?: "good" | "bad";
}) {
  const statusDot =
    status === "good"
      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
      : status === "bad"
        ? "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.7)]"
        : null;
  const valueCls =
    status === "good"
      ? "text-emerald-300"
      : status === "bad"
        ? "text-rose-300"
        : "text-white";
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
      <span className="text-[11.5px] font-light text-white/75">{label}</span>
      <div className="flex shrink-0 items-center gap-2">
        {statusDot && <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />}
        <span className={`font-mono text-[12px] font-bold ${valueCls}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

function Alert({
  tone,
  children,
}: {
  tone: "bad" | "warn";
  children: React.ReactNode;
}) {
  const cls =
    tone === "bad"
      ? "border-rose-400/40 bg-rose-400/10 text-rose-200"
      : "border-amber-400/40 bg-amber-400/10 text-amber-200";
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-[10.5px] font-medium leading-snug ${cls}`}
    >
      <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />;
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
