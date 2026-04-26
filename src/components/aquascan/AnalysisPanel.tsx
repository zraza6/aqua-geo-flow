import { X, Mountain, CloudRain, Gauge, Dam, ShieldCheck, Calendar, Loader2, CheckCircle2, RotateCcw, Waves, Cpu, Droplets } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { stopMapPropagation } from "./stopMap";

export type SimulationState =
  | "idle"
  | "deviating"
  | "constructing"
  | "filling"
  | "completed";

interface Props {
  onClose: () => void;
  onSimulate: () => void;
  onReset: () => void;
  area: number;
  zoneName?: string;
  simulationState: SimulationState;
  /** When true, render inline (inside Sheet on mobile). Otherwise float as right sidebar. */
  inline?: boolean;
}

export function AnalysisPanel(props: Props) {
  if (props.inline) {
    return (
      <div className="flex h-full w-full flex-col" {...stopMapPropagation}>
        <PanelBody {...props} />
      </div>
    );
  }
  return (
    <aside
      className="pointer-events-auto flex h-full w-[calc(100vw-7rem)] max-w-sm animate-[slide-in-right_0.4s_cubic-bezier(0.4,0,0.2,1)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
      {...stopMapPropagation}
    >
      <PanelBody {...props} />
    </aside>
  );
}

function PanelBody({
  onClose,
  onSimulate,
  onReset,
  area,
  zoneName,
  simulationState,
}: Props) {
  const running =
    simulationState === "deviating" ||
    simulationState === "constructing" ||
    simulationState === "filling";
  const done = simulationState === "completed";

  return (
    <>
      {/* Header */}
      <div className="relative flex flex-col gap-2 border-b border-white/10 px-6 py-5">
        <button
          onClick={onClose}
          disabled={running}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400 [text-shadow:0_0_10px_rgba(34,211,238,0.6)]">
          Earth Engine · Intelligence Report
        </p>
        <h2 className="text-lg font-semibold leading-tight text-white">
          {zoneName ?? "Custom AOI"}
        </h2>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] font-light text-white/50">
          <span>{area.toFixed(1)} km²</span>
          <Dot />
          <span>EPSG:4326</span>
          <Dot />
          <span>UTC {new Date().toUTCString().slice(17, 22)}</span>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="no-scrollbar flex-1 overflow-y-auto">
        {/* Viability — always visible */}
        <div className="px-5 pt-4">
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.06] p-4 [box-shadow:inset_0_0_30px_rgba(16,185,129,0.06)]">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-emerald-400" />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                Viability Score
              </p>
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <span
                className="text-4xl font-bold text-emerald-400"
                style={{ textShadow: "0 0 14px rgba(16,185,129,0.6)" }}
              >
                88%
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                Highly Recommended
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                style={{ width: "88%", boxShadow: "0 0 12px rgba(16,185,129,0.6)" }}
              />
            </div>
            <p className="mt-2 text-[11px] font-light leading-relaxed text-white/55">
              Composite of DEM slope, NDWI water proximity, SAR urban exclusion
              and ERA5 precipitation forecast.
            </p>
          </div>
        </div>

        {/* Accordions */}
        <div className="px-5 py-4">
          <Accordion type="multiple" defaultValue={["dem", "weather"]} className="flex flex-col gap-2">
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
                  <Stat label="Mean slope" value="14.2°" />
                  <Stat label="Δ Elevation" value="312 m" />
                  <Stat label="Catchment" value="184 km²" />
                </div>
                <svg viewBox="0 0 200 50" className="mt-3 h-12 w-full">
                  <defs>
                    <linearGradient id="terrain" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,40 L20,32 L40,18 L60,8 L80,22 L100,12 L120,28 L140,16 L160,30 L180,22 L200,38 L200,50 L0,50 Z"
                    fill="url(#terrain)"
                  />
                  <path
                    d="M0,40 L20,32 L40,18 L60,8 L80,22 L100,12 L120,28 L140,16 L160,30 L180,22 L200,38"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="1.2"
                  />
                </svg>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="weather"
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 data-[state=open]:bg-white/[0.05]"
            >
              <AccordionTrigger className="py-3 hover:no-underline">
                <span className="flex items-center gap-2.5">
                  <CloudRain className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
                    Weather Context · 72h
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <p className="text-[12px] font-light leading-relaxed text-white/85">
                  <span className="font-semibold text-cyan-400">
                    Heavy precipitation (+40 mm)
                  </span>{" "}
                  expected. Ideal window for water capture simulation.
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
                      <span className="font-mono text-[8px] text-white/40">
                        {v}mm
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-start gap-1.5 font-mono text-[9px] uppercase tracking-wider text-white/40">
                  <Calendar className="mt-px h-3 w-3 shrink-0" />
                  <span className="leading-relaxed normal-case tracking-normal">
                    Strict 72h window. Long-range forecasts excluded — they are
                    unpredictable beyond ~3 days.
                  </span>
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
                  3 independent inference passes (XGBoost, U-Net SAR, ERA5
                  bias-corrected) converged on the same recommendation.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Decision footer — embedded simulator */}
      <div className="border-t border-white/10 bg-slate-950/40 px-5 py-5">
        <SimulatorButton
          state={simulationState}
          onSimulate={onSimulate}
          onReset={onReset}
        />
        {!done && simulationState === "idle" && (
          <button
            onClick={onClose}
            className="mt-2.5 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[12px] font-medium text-white/65 transition-colors hover:bg-white/10 hover:text-white"
          >
            Cancel
          </button>
        )}
      </div>
    </>
  );
}

function SimulatorButton({
  state,
  onSimulate,
  onReset,
}: {
  state: SimulationState;
  onSimulate: () => void;
  onReset: () => void;
}) {
  if (state === "idle") {
    return (
      <button
        onClick={onSimulate}
        className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-cyan-400/50 bg-gradient-to-br from-cyan-500/30 via-cyan-400/20 to-cyan-600/30 px-5 py-4 text-sm font-semibold text-cyan-100 transition-all hover:border-cyan-300 hover:from-cyan-400/40 hover:to-cyan-500/40 [box-shadow:0_0_24px_rgba(34,211,238,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]"
      >
        <Dam className="h-4 w-4" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em]">
          Simulate Reservoir Construction
        </span>
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      </button>
    );
  }

  if (state === "completed") {
    return (
      <button
        onClick={onReset}
        className="w-full rounded-2xl border border-white/15 bg-white/[0.05] px-5 py-4 text-sm font-medium text-white/85 transition-colors hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
      >
        <RotateCcw className="h-4 w-4" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em]">
          Reset Scenario
        </span>
      </button>
    );
  }

  // running states
  const stages: Record<
    Exclude<SimulationState, "idle" | "completed">,
    { label: string; icon: typeof Waves; n: number }
  > = {
    deviating: { label: "Deviating river flow…", icon: Waves, n: 1 },
    constructing: { label: "Constructing primary wall…", icon: Cpu, n: 2 },
    filling: { label: "Filling basin…", icon: Droplets, n: 3 },
  };
  const { label, icon: Icon, n } = stages[state];

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex items-center justify-center gap-2.5 rounded-2xl border border-cyan-400/40 bg-cyan-400/10 px-5 py-4 text-cyan-200 [box-shadow:0_0_18px_rgba(34,211,238,0.3),inset_0_1px_0_rgba(255,255,255,0.08)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        <Icon className="h-4 w-4 animate-pulse" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em]">
          Step {n}: {label}
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

function Stat({ label, value }: { label: string; value: string }) {
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

// Re-export icon helper to keep API tidy
export { CheckCircle2 };
