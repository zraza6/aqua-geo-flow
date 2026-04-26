import {
  X,
  Mountain,
  CloudRain,
  Gauge,
  Dam,
  ShieldCheck,
  Calendar,
  Loader2,
  RotateCcw,
  Waves,
  Cpu,
  TrendingUp,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { useMemo } from "react";
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
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Mock 12 months of NDWI water surface (km²) for the basin. */
const BASE_SURFACE = [3.1, 3.6, 4.4, 5.2, 5.0, 4.1, 3.2, 2.4, 2.1, 2.6, 3.0, 3.3];

export function AnalysisPanel({
  onClose,
  onSimulate,
  onReset,
  area,
  zoneName,
  simulationStatus,
}: Props) {
  const running =
    simulationStatus === "modeling" ||
    simulationStatus === "deviating" ||
    simulationStatus === "constructing";
  const done = simulationStatus === "complete";

  const chartData = useMemo(() => {
    return MONTHS.map((m, i) => ({
      month: m,
      historical: BASE_SURFACE[i],
      // Projected only appears at completion — spikes from current
      projected: done
        ? i < 6
          ? null
          : 3.3 + (i - 5) * 1.45 // sharp climb post-intervention
        : null,
    }));
  }, [done]);

  return (
    <aside
      className="pointer-events-auto flex h-full w-[calc(100vw-7rem)] max-w-sm animate-[slide-in-right_0.4s_cubic-bezier(0.4,0,0.2,1)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
      {...stopMapPropagation}
    >
      {/* Header */}
      <div className="relative flex flex-col gap-2 border-b border-white/10 px-6 py-5">
        <button
          onClick={onClose}
          disabled={running}
          aria-label="Close basin profile"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400 [text-shadow:0_0_10px_rgba(34,211,238,0.6)]">
          Basin Hydrological Profile
        </p>
        <h2 className="text-[15px] font-semibold leading-tight text-white">
          {zoneName}
        </h2>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] font-light text-white/50">
          <span>{area.toFixed(1)} km²</span>
          <Dot />
          <span>EPSG:4326</span>
          <Dot />
          <span>UTC {new Date().toUTCString().slice(17, 22)}</span>
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto">
        {/* Top stats */}
        <div className="grid grid-cols-2 gap-3 px-5 pt-5">
          <StatCard
            icon={Gauge}
            label="Viability"
            value="88%"
            sub="Recommended"
            tone="emerald"
          />
          <StatCard
            icon={Waves}
            label="Basin Depth"
            value="4.2 m"
            sub="Mean · NDWI"
            tone="cyan"
          />
        </div>

        {/* Chart */}
        <div className="mt-4 px-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
                  Water Surface · 12 mo
                </p>
              </div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-white/40">
                km²
              </p>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillHistorical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillProjected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 9, fontFamily: "JetBrains Mono" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickLine={false}
                    interval={1}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 9, fontFamily: "JetBrains Mono" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickLine={false}
                    width={28}
                  />
                  <RTooltip
                    contentStyle={{
                      background: "rgba(2,6,23,0.92)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 11,
                      backdropFilter: "blur(12px)",
                    }}
                    labelStyle={{ color: "rgba(255,255,255,0.6)", fontFamily: "JetBrains Mono", fontSize: 10 }}
                    itemStyle={{ color: "#67e8f9" }}
                  />
                  {done && (
                    <ReferenceLine
                      x="Jun"
                      stroke="#fbbf24"
                      strokeDasharray="4 3"
                      label={{ value: "Built", fill: "#fbbf24", fontSize: 9, position: "top" }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="historical"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="url(#fillHistorical)"
                    name="Historical"
                  />
                  {done && (
                    <Area
                      type="monotone"
                      dataKey="projected"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      strokeDasharray="5 4"
                      fill="url(#fillProjected)"
                      name="Projected"
                      connectNulls
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-1 text-[10px] font-light leading-relaxed text-white/45">
              Sentinel-2 NDWI · monthly mean. {done && (
                <span className="text-cyan-300">
                  Projection: +{(7.5).toFixed(1)} km² capacity post-construction.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Accordions */}
        <div className="px-5 py-4">
          <Accordion
            type="multiple"
            defaultValue={["weather", "dem"]}
            className="flex flex-col gap-2"
          >
            <AccordionItem
              value="weather"
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 data-[state=open]:bg-white/[0.05]"
            >
              <AccordionTrigger className="py-3 hover:no-underline">
                <span className="flex items-center gap-2.5">
                  <CloudRain className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
                    72h Radar Context
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <p className="text-[12px] font-light leading-relaxed text-white/85">
                  <span className="font-semibold text-cyan-400">
                    Heavy precipitation (+40 mm)
                  </span>{" "}
                  expected. Ideal conditions for reservoir capture simulation.
                </p>
                <div className="mt-3 flex items-end justify-between gap-1">
                  {[6, 12, 22, 18, 28, 32, 26].map((v, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-cyan-400/20 to-cyan-400"
                        style={{
                          height: `${v * 1.4}px`,
                          boxShadow: "0 0 8px rgba(34,211,238,0.4)",
                        }}
                      />
                      <span className="font-mono text-[8px] text-white/40">{v}mm</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-start gap-1.5 font-mono text-[9px] uppercase tracking-wider text-white/40">
                  <Calendar className="mt-px h-3 w-3 shrink-0" />
                  <span className="leading-relaxed normal-case tracking-normal">
                    Strict 72h window. Long-range climate excluded — unpredictable
                    beyond ~3 days.
                  </span>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="dem"
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 data-[state=open]:bg-white/[0.05]"
            >
              <AccordionTrigger className="py-3 hover:no-underline">
                <span className="flex items-center gap-2.5">
                  <Mountain className="h-3.5 w-3.5 text-amber-400" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
                    DEM Analysis
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <p className="text-[12px] font-light leading-relaxed text-white/85">
                  Ideal{" "}
                  <span className="font-semibold text-amber-400">
                    steep valley profile
                  </span>{" "}
                  detected.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Mini label="Slope" value="14.2°" />
                  <Mini label="Δ Elev" value="312 m" />
                  <Mini label="Catchment" value="184 km²" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="confidence"
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 data-[state=open]:bg-white/[0.05]"
            >
              <AccordionTrigger className="py-3 hover:no-underline">
                <span className="flex items-center gap-2.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
                    Model Confidence
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-light text-white/70">
                    Ensemble agreement
                  </span>
                  <span className="font-mono text-sm font-semibold text-cyan-400">
                    93.4%
                  </span>
                </div>
                <p className="mt-2 text-[11px] font-light leading-relaxed text-white/55">
                  3 inference passes (XGBoost · U-Net SAR · ERA5 bias-corrected)
                  converged on the same recommendation.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Decision footer */}
      <div className="border-t border-white/10 bg-slate-950/40 px-5 py-5">
        <SimulatorButton
          status={simulationStatus}
          onSimulate={onSimulate}
          onReset={onReset}
        />
      </div>
    </aside>
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
        className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-cyan-400/50 bg-gradient-to-br from-cyan-500/30 via-cyan-400/20 to-cyan-600/30 px-5 py-4 text-sm font-semibold text-cyan-100 transition-all hover:border-cyan-300 hover:from-cyan-400/40 hover:to-cyan-500/40 [box-shadow:0_0_24px_rgba(34,211,238,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]"
      >
        <Dam className="h-4 w-4" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em]">
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
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/15 bg-white/[0.05] px-5 py-4 text-sm font-medium text-white/85 transition-all hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
      >
        <RotateCcw className="h-4 w-4" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em]">
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
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex items-center justify-center gap-2.5 rounded-2xl border border-cyan-400/40 bg-cyan-400/10 px-5 py-4 text-cyan-200 [box-shadow:0_0_18px_rgba(34,211,238,0.3),inset_0_1px_0_rgba(255,255,255,0.08)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        {Icon !== Loader2 && <Icon className="h-4 w-4 animate-pulse" />}
        <span className="font-mono text-[11px] uppercase tracking-[0.2em]">
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

function StatCard({
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
  tone: "cyan" | "emerald";
}) {
  const c = tone === "cyan" ? "text-cyan-400" : "text-emerald-400";
  const border =
    tone === "cyan"
      ? "border-cyan-400/30 bg-cyan-400/[0.06]"
      : "border-emerald-400/30 bg-emerald-400/[0.06]";
  return (
    <div className={`flex flex-col gap-1 rounded-2xl border p-4 ${border}`}>
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3 w-3 ${c}`} />
        <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/50">
          {label}
        </p>
      </div>
      <p className={`text-2xl font-bold leading-none ${c}`} style={{ textShadow: "0 0 14px currentColor" }}>
        {value}
      </p>
      <p className="text-[10px] font-light text-white/55">{sub}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-1.5">
      <p className="font-mono text-[8px] uppercase tracking-wider text-white/45">
        {label}
      </p>
      <p className="text-[12px] font-semibold text-white">{value}</p>
    </div>
  );
}

function Dot() {
  return <span className="h-1 w-1 rounded-full bg-white/20" />;
}
