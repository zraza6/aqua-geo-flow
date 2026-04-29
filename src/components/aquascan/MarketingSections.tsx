import {
  Activity,
  Droplets,
  FileText,
  MapPin,
  BookOpen,
  Layers,
  Mountain,
  Radar,
  Code2,
  Workflow,
  Database,
  Cpu,
} from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] as const },
};

/* ------------ Interactive Terrain Profile (Section A · Left Card) ------------ */
function InteractiveTerrain() {
  // Larger, more dominant SVG. Same coord system for the curve and the drag node.
  const W = 520;
  const H = 320;
  const x = useMotionValue(W * 0.4);

  // Strict sine wave terrain — much larger amplitude. Same formula for path AND dot Y.
  const curveY = (xv: number) =>
    180 - 92 * Math.sin((xv / W) * Math.PI * 1.4) - 28 * Math.sin((xv / W) * Math.PI * 3.2);

  const clampX = (xv: number) => Math.min(W, Math.max(0, xv));
  const dotY = useTransform(x, (xv) => curveY(clampX(xv)));
  const ksat = useTransform(x, (xv) => (15.4 + (clampX(xv) / W) * (38.0 - 15.4)).toFixed(1));
  const elev = useTransform(x, (xv) => Math.round(450 + ((H - curveY(clampX(xv))) / H) * (1200 - 450)).toString());
  const risk = useTransform(x, (xv) => {
    const v = 15.4 + (clampX(xv) / W) * (38.0 - 15.4);
    if (v > 30) return "Critical Seepage";
    if (v > 20) return "High Seepage";
    return "Stable";
  });
  const rec = useTransform(x, (xv) => {
    const v = 15.4 + (clampX(xv) / W) * (38.0 - 15.4);
    if (v > 30) return "HDPE + Bentonite";
    if (v > 20) return "HDPE Liner";
    return "Compacted Clay";
  });

  // Build a visually smooth SVG path from the exact same formula that drives the locked node.
  const terrainPath = (() => {
    const pts: string[] = [];
    for (let i = 0; i <= W; i += 2) pts.push(`${i.toFixed(2)} ${curveY(i).toFixed(2)}`);
    return `M ${pts.join(" L ")}`;
  })();
  const fillPath = `${terrainPath} L ${W} ${H} L 0 ${H} Z`;

  return (
    <div className="relative h-[420px] rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
      {/* grid */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.18) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* corner labels */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 text-white/50 z-10">
        <MapPin className="h-3 w-3" />
        <span className="font-mono text-[10px] uppercase tracking-widest">
          Terrain Profile · Drag Node
        </span>
      </div>
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400/80">
          Live · DEM
        </span>
        {/* Live tooltip — moved to TOP RIGHT, directly under "LIVE · DEM" */}
        <div className="rounded-xl border border-white/10 bg-slate-900/80 backdrop-blur-md px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
          <p className="font-mono text-[10px] text-white/90 leading-relaxed tabular-nums text-left">
            <span className="text-cyan-400">Elev:</span>{" "}
            <motion.span>{elev}</motion.span> m
            <br />
            <span className="text-cyan-400">Ksat:</span>{" "}
            <motion.span>{ksat}</motion.span> mm/h
            <br />
            <span className="text-cyan-400">Risk:</span>{" "}
            <motion.span className="text-rose-400">{risk}</motion.span>
            <br />
            <span className="text-cyan-400">Rec:</span>{" "}
            <motion.span className="text-emerald-400">{rec}</motion.span>
          </p>
        </div>
      </div>

      {/* SVG terrain — exact pixel coordinates, no aspect-ratio scaling */}
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="absolute left-1/2 bottom-6 -translate-x-1/2 overflow-visible"
      >
        <defs>
          <linearGradient id="terrainFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(34,211,238,0.28)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </linearGradient>
        </defs>
        <path d={fillPath} fill="url(#terrainFill)" />
        <path
          d={terrainPath}
          fill="none"
          stroke="rgba(34,211,238,0.95)"
          strokeWidth="2"
        />

        {/* Drag node lives in the SAME SVG coord system as the polyline. */}
        <foreignObject x={0} y={0} width={W} height={H} style={{ overflow: "visible" }}>
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: W }}
            dragElastic={0}
            dragMomentum={false}
            style={{ x, y: dotY, width: 0, height: 0 }}
            className="absolute left-0 top-0 cursor-grab active:cursor-grabbing"
            whileTap={{ scale: 1.25 }}
          >
            <span className="relative -ml-2.5 -mt-2.5 flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400/70" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400 ring-2 ring-amber-200/40 [box-shadow:0_0_14px_rgba(251,191,36,0.9)]" />
            </span>
            <span className="absolute -top-5 left-3 whitespace-nowrap font-mono text-[10px] font-semibold text-amber-300">
              Node A3
            </span>
          </motion.div>
        </foreignObject>
      </svg>
    </div>
  );
}

/* ------------ Interactive Tech Chip with hover tooltip + glow ------------ */
function TechChip({ name, tip }: { name: string; tip: string }) {
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      className="group relative inline-block cursor-pointer rounded-full border border-white/10 bg-slate-950/75 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/75 backdrop-blur-xl transition-colors hover:border-cyan-400/50 hover:text-cyan-300 hover:[box-shadow:0_0_22px_-4px_rgba(34,211,238,0.65)]"
    >
      {name}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max max-w-[220px] -translate-x-1/2 translate-y-1 rounded-lg border border-white/10 bg-slate-950/95 px-3 py-1.5 text-[10.5px] font-light normal-case tracking-normal text-white/85 opacity-0 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.5),0_0_18px_-4px_rgba(34,211,238,0.4)] transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
      >
        {tip}
      </span>
    </motion.span>
  );
}

export const MarketingSections = () => {
  return (
    <>
      {/* SECTION 0 — HERO / BRAND INTRO */}
      <section className="relative overflow-hidden border-t border-white/5 bg-[#030712] px-6 py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 0%, rgba(34,211,238,0.18), transparent 55%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative mx-auto max-w-5xl text-center">
          <motion.span
            {...fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-300 [text-shadow:0_0_10px_rgba(34,211,238,0.5)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 [box-shadow:0_0_8px_rgba(34,211,238,0.9)]" />
            Spatial Data Science Platform
          </motion.span>
          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="mt-6 bg-gradient-to-br from-white via-white to-cyan-200/80 bg-clip-text text-5xl font-bold text-transparent sm:text-6xl md:text-7xl"
            style={{ letterSpacing: "-0.02em", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
          >
            Aqua Scan{" "}
            <span
              className="bg-gradient-to-br from-cyan-300 via-cyan-400 to-cyan-500 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 30px rgba(34,211,238,0.5)" }}
            >
              Pro
            </span>
            <span
              className="mt-3 block text-xl font-light text-white/55 sm:text-2xl md:text-3xl"
              style={{ letterSpacing: "-0.01em" }}
            >
              HeavyWater Architecture Analysis
            </span>
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="mx-auto mt-10 max-w-2xl text-xl leading-relaxed text-white/75 md:text-2xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            A Spatial Data Science platform for the technical and legal{" "}
            <strong className="font-semibold text-white">pre-feasibility</strong> of
            hydrotechnical infrastructure —{" "}
            <strong className="font-semibold text-cyan-300">Canals, Dams, Reservoirs</strong>.
          </motion.p>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.15 }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/55 md:text-lg"
            style={{ letterSpacing: "-0.015em" }}
          >
            Reducing feasibility studies from{" "}
            <span className="text-white/80">months of field work</span> to{" "}
            <span className="text-cyan-300">seconds of cloud processing</span>, in
            compliance with Romanian Water Law 107/1996.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.22 }}
            className="mx-auto mt-12 flex flex-wrap justify-center gap-2.5"
          >
            {[
              { name: "Python", tip: "Core processing engine." },
              { name: "GeoPandas", tip: "Vector data manipulation." },
              { name: "NetCDF4", tip: "Multi-dimensional climate arrays." },
              { name: "Copernicus API", tip: "Sentinel & CLMS data access." },
              { name: "PostGIS", tip: "Spatial database management." },
              { name: "Earth Engine", tip: "Satellite imagery compute." },
            ].map((t) => (
              <TechChip key={t.name} name={t.name} tip={t.tip} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 0b — DATA & ALGORITHMS */}
      <section className="border-t border-white/5 bg-[#030712] px-6 py-24">
        <motion.div {...fadeUp} className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-400/80">
              Data &amp; Algorithms
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white/90 md:text-4xl">
              Open-Source Earth Observation, Deterministic Logic
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-950/75 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:[box-shadow:0_0_30px_-5px_rgba(34,211,238,0.3)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10">
                  <Database className="h-5 w-5 text-cyan-300" />
                </div>
                <h3 className="text-lg font-semibold text-white">Data Sources</h3>
              </div>
              <ul className="mt-6 flex flex-col gap-3">
                {[
                  { icon: Layers, name: "CLMS", detail: "Imperviousness · urban exclusion zones" },
                  { icon: Mountain, name: "Copernicus GLO-30 DEM", detail: "30m global elevation model" },
                  { icon: Radar, name: "EGMS (InSAR)", detail: "L3 vertical subsidence, mm/yr" },
                  { icon: Droplets, name: "GloFAS & SoilGrids", detail: "Discharge ensembles + Ksat / pH" },
                ].map((d) => (
                  <li
                    key={d.name}
                    className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06]">
                      <d.icon className="h-4 w-4 text-cyan-300" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12.5px] font-semibold text-white">
                        {d.name}
                      </span>
                      <span className="text-[11px] font-light leading-snug text-white/55">
                        {d.detail}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/75 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:[box-shadow:0_0_30px_-5px_rgba(34,211,238,0.3)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10">
                  <Workflow className="h-5 w-5 text-cyan-300" />
                </div>
                <h3 className="text-lg font-semibold text-white">Algorithm Logic</h3>
              </div>
              <ul className="mt-6 flex flex-col gap-3">
                {[
                  {
                    icon: Workflow,
                    name: "Dijkstra — Optimal Routing",
                    detail:
                      "Cost-surface shortest path across DEM + impedance grids for canal alignment.",
                  },
                  {
                    icon: Cpu,
                    name: "minimum_filter — Dam Identification",
                    detail:
                      "SciPy ndimage scan to detect natural valley closures suitable for dam walls.",
                  },
                  {
                    icon: Code2,
                    name: "Pedotransfer — Seepage Risk",
                    detail:
                      "If Ksat > 20 mm/h, automatic recommendation: HDPE impermeable membrane.",
                  },
                ].map((d) => (
                  <li
                    key={d.name}
                    className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06]">
                      <d.icon className="h-4 w-4 text-cyan-300" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12.5px] font-semibold text-white">
                        {d.name}
                      </span>
                      <span className="text-[11px] font-light leading-snug text-white/55">
                        {d.detail}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION A — PRODUCT SYNERGY */}
      <section className="bg-[#030712] py-24 px-6">
        <motion.h2
          {...fadeUp}
          className="text-4xl font-semibold text-white/90 text-center mb-4 tracking-tight"
        >
          Aqua Scan <span className="text-cyan-400">Pro</span> Interface. HeavyWater Engine.
        </motion.h2>
        <motion.p
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.05 }}
          className="text-white/50 text-sm text-center max-w-xl mx-auto mb-16"
        >
          A live UI layer powered by a deterministic Python geospatial backend.
        </motion.p>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left — Interactive UI card */}
          <motion.div
            {...fadeUp}
            className="liquid-glass rounded-3xl p-8 lg:col-span-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.3)]"
          >
            <div className="flex items-center justify-between mb-6">
          <h3 className="text-white/90 text-lg font-medium">
            UI: Aqua Scan <span className="text-cyan-400">Pro</span>
          </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400/80">
                Interactive · GIS Layer
              </span>
            </div>
            <InteractiveTerrain />
            <p className="text-white/50 text-sm mt-6">
              Drag <span className="text-amber-300 font-medium">Node A3</span> across the
              terrain. Permeability, risk and lining recommendation update in real time.
            </p>
          </motion.div>

          {/* Right — Backend terminal */}
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 lg:col-span-2 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.3)]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white/90 text-lg font-medium">Backend: HeavyWater</h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-green-400/70">
                py · 3.11
              </span>
            </div>
            <div className="rounded-2xl bg-black/60 border border-white/5 p-5 font-mono text-sm leading-relaxed">
              <div className="text-white/30 mb-2">$ python decision.py --aoi=custom</div>
              <pre className="whitespace-pre-wrap text-white/80">
{`{
  `}<span className="text-cyan-300">"module"</span>{`: `}<span className="text-emerald-300">"decision.py"</span>{`,
  `}<span className="text-cyan-300">"dijkstra_cost"</span>{`: `}<span className="text-emerald-300">"optimal"</span>{`,
  `}<span className="text-cyan-300">"stability_v_mean"</span>{`: `}<span className="text-amber-300">"-2.1 mm/yr"</span>{`,
  `}<span className="text-cyan-300">"route_score"</span>{`: `}<span className="text-amber-300">82.4</span>{`
}`}
              </pre>
              <div className="mt-3 text-white/30">
                <span className="text-cyan-400/70">→</span> PostGIS commit · 0.42s
              </div>
            </div>
            <p className="text-white/50 text-sm mt-6">
              Python geospatial engine: PostGIS, Earth Engine, Dijkstra & InSAR — all over API.
            </p>
          </motion.div>
        </div>

        {/* Bottom row — Live Telemetry Feed (fills empty space) */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.18 }}
          className="max-w-6xl mx-auto mt-6 liquid-glass rounded-3xl p-6 border border-white/5 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.3)]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
            <h3 className="text-white/90 text-sm font-medium">Live Data Stream</h3>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/80">
              streaming · stdout
            </span>
          </div>
          <div className="rounded-2xl bg-black/60 border border-white/5 p-4 font-mono text-[12px] leading-relaxed text-white/75 max-h-44 overflow-hidden">
            {[
              { t: "19:24:01", msg: "Querying GLO-30 DEM…", tail: "OK", tone: "text-emerald-400" },
              { t: "19:24:02", msg: "SoilGrids v2.0 Sync…", tail: "Ksat 22.4 mm/h", tone: "text-cyan-300" },
              { t: "19:24:03", msg: "Calculating Dijkstra optimal path…", tail: "score 82.4", tone: "text-amber-300" },
              { t: "19:24:04", msg: "InSAR Stability Check…", tail: "OK · -2.1 mm/yr", tone: "text-emerald-400" },
              { t: "19:24:05", msg: "GloFAS discharge ensemble fetched…", tail: "OK", tone: "text-emerald-400" },
              { t: "19:24:06", msg: "PostGIS commit · scenario_v3…", tail: "0.42s", tone: "text-emerald-400" },
            ].map((row) => (
              <div key={row.t} className="flex items-center gap-3">
                <span className="text-white/30">[{row.t}]</span>
                <span className="flex-1 truncate">{row.msg}</span>
                <span className={row.tone}>{row.tail}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION B — ROADMAP */}
      <section className="bg-[#030712] py-24 px-6">
        <motion.h2
          {...fadeUp}
          className="text-3xl text-white/90 text-center mb-16 font-semibold tracking-tight"
        >
          Scaling &amp; Future Capabilities
        </motion.h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Activity,
              title: "Predictive Maintenance (InSAR)",
              text: "Extracting 5-year <strong class='text-white/95 font-semibold'>EGMS time-series</strong>. If subsidence rate accelerates &gt; 2 mm/yr, we trigger a <strong class='text-white/95 font-semibold'>structural failure alert</strong> 6 months in advance.",
            },
            {
              icon: Droplets,
              title: "Climate Resilience (C3S)",
              text: "If Sentinel-1 detects <strong class='text-white/95 font-semibold'>soil moisture &lt; 15%</strong> for 3 consecutive summers, the system automatically runs a feasibility study for <strong class='text-white/95 font-semibold'>preventive irrigation</strong>.",
            },
            {
              icon: FileText,
              title: "B2G Automation",
              text: "Mapping output from <code class='font-mono text-cyan-300/90'>river_metrics.py</code> directly onto official ANAR annexes (<strong class='text-white/95 font-semibold'>Water Law 107/1996</strong>) for <strong class='text-white/95 font-semibold'>Water Management Approvals</strong>.",
            },
          ].map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.08 }}
              className="liquid-glass rounded-3xl p-8 border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.25)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 border border-cyan-400/20">
                <Icon className="h-5 w-5 text-cyan-300" />
              </div>
              <h3 className="text-white/90 text-lg font-medium mt-6">{title}</h3>
              <p className="text-white/70 text-sm mt-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION C — ENTERPRISE ECONOMICS */}
      <section className="bg-[#030712] py-24 px-6 border-t border-white/5">
        <motion.h2
          {...fadeUp}
          className="text-center text-white font-semibold uppercase mb-16 text-3xl md:text-4xl tracking-[0.18em] [text-shadow:0_0_24px_rgba(34,211,238,0.18)]"
        >
          SaaS Financial Model
        </motion.h2>
        <motion.div {...fadeUp} className="liquid-glass rounded-3xl p-12 max-w-5xl mx-auto border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.25)]">
          <div className="flex flex-col md:flex-row items-center justify-around gap-12 md:gap-6">
            {[
              { num: "15k EUR", label: "Annual AWS Cloud Cost (PostGIS/EC2)" },
              { num: "60k EUR", label: "Pilot Development Budget (3 engineers, 6 months)" },
              { num: "3,000 EUR", label: "Estimated B2B License / month / agency" },
            ].map((s) => (
              <div key={s.num} className="text-center">
                <div className="font-mono text-4xl md:text-5xl text-white font-bold tracking-tight tabular-nums [text-shadow:0_0_24px_rgba(34,211,238,0.35)]">
                  {s.num}
                </div>
                <div className="text-white/60 text-sm mt-4 max-w-[200px] mx-auto leading-snug">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-white/80 mt-12 max-w-2xl mx-auto leading-relaxed">
            <span className="text-cyan-300 font-medium">Immediate ROI:</span> Eliminates 6
            months of manual topographical field surveys (average cost &gt;20,000 EUR
            according to SEAP public procurements).
          </p>
        </motion.div>
      </section>

      {/* SECTION D — BIBLIOGRAPHY FOOTER */}
      <footer className="bg-[#030712] py-20 px-6 border-t border-white/5">
        <motion.div {...fadeUp} className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <BookOpen className="h-4 w-4 text-cyan-400/80" />
            <h3 className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/50">
              Bibliography &amp; Documentation
            </h3>
          </div>
          <ul className="flex flex-col gap-3 border-l border-white/10 pl-6">
            {[
              { label: "Copernicus Land Monitoring Service (CLMS)", href: "https://land.copernicus.eu/" },
              { label: "Copernicus Data Space Ecosystem (CDSE)", href: "https://dataspace.copernicus.eu/" },
              { label: "ISRIC SoilGrids v2.0", href: "https://soilgrids.org/" },
              { label: "CEMS GloFAS / EFAS", href: "https://global-flood.emergency.copernicus.eu/" },
              { label: "Legislative Portal: Romanian Water Law No. 107/1996", href: "https://legislatie.just.ro/Public/DetaliiDocument/8709" },
              { label: "SEAP (Electronic System of Public Procurement)", href: "https://e-licitatie.ro/" },
            ].map((item) => (
              <li key={item.label} className="text-sm leading-relaxed">
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/55 transition-colors hover:text-cyan-400 hover:underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 mt-12 text-center">
            Aqua Scan <span className="text-cyan-400">Pro</span> © 2026 · European Hydro-Intelligence Center
          </p>
        </motion.div>
      </footer>
    </>
  );
};
