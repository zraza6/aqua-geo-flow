import { Activity, Droplets, FileText, MapPin, BookOpen } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] as const },
};

/* ------------ Interactive Terrain Profile (Section A · Left Card) ------------ */
function InteractiveTerrain() {
  // Single shared coordinate system: a 300×220 SVG. Drag node lives INSIDE
  // the SVG so the math for the curve and the dot is identical.
  const W = 300;
  const H = 220;
  const x = useMotionValue(120);

  // Strict sine wave terrain. Same formula used for SVG path AND dot Y.
  const curveY = (xv: number) =>
    140 - 50 * Math.sin((xv / W) * Math.PI * 1.4) - 16 * Math.sin((xv / W) * Math.PI * 3.2);

  const dotY = useTransform(x, (xv) => curveY(xv));
  const ksat = useTransform(x, (xv) => (8 + (xv / W) * 30).toFixed(1));
  const elev = useTransform(x, (xv) => (640 - curveY(xv) * 1.6).toFixed(0));
  const risk = useTransform(x, (xv) => {
    const v = 8 + (xv / W) * 30;
    if (v > 28) return "Critical Seepage";
    if (v > 18) return "High Seepage";
    return "Stable";
  });
  const rec = useTransform(x, (xv) => {
    const v = 8 + (xv / W) * 30;
    if (v > 28) return "HDPE + Bentonite";
    if (v > 18) return "HDPE Liner";
    return "Compacted Clay";
  });

  // Build the polyline string for the SVG curve.
  const points = (() => {
    const pts: string[] = [];
    for (let i = 0; i <= W; i += 4) pts.push(`${i},${curveY(i).toFixed(2)}`);
    return pts.join(" ");
  })();
  const fillPoints = `0,${H} ${points} ${W},${H}`;

  return (
    <div className="relative h-72 rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
      {/* grid */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.18) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* corner labels */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 text-white/50 z-10">
        <MapPin className="h-3 w-3" />
        <span className="font-mono text-[10px] uppercase tracking-widest">
          Terrain Profile · Drag Node
        </span>
      </div>
      <div className="absolute top-3 right-3 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400/80 z-10">
        Live · DEM
      </div>

      {/* SVG terrain — uses exact pixel coordinates (no preserveAspectRatio scaling) */}
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="absolute left-1/2 bottom-4 -translate-x-1/2 overflow-visible"
      >
        <defs>
          <linearGradient id="terrainFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(34,211,238,0.25)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </linearGradient>
        </defs>
        <polygon points={fillPoints} fill="url(#terrainFill)" />
        <polyline
          points={points}
          fill="none"
          stroke="rgba(34,211,238,0.9)"
          strokeWidth="1.5"
        />

        {/* Drag node — lives in the SAME SVG coord system as the polyline.
            Foreign-object hosts the framer-motion draggable so its (x,y) maps 1:1 to viewBox units. */}
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

      {/* Live tooltip */}
      <div className="absolute bottom-4 right-4 rounded-xl border border-white/10 bg-slate-900/80 backdrop-blur-md px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-10">
        <p className="font-mono text-[10px] text-white/90 leading-relaxed tabular-nums">
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
  );
}

export const MarketingSections = () => {
  return (
    <>
      {/* SECTION A — PRODUCT SYNERGY */}
      <section className="bg-[#030712] py-24 px-6">
        <motion.h2
          {...fadeUp}
          className="text-4xl font-semibold text-white/90 text-center mb-4 tracking-tight"
        >
          AquaScan Interface. HeavyWater Engine.
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
            className="liquid-glass rounded-3xl p-8 lg:col-span-3"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white/90 text-lg font-medium">UI: AquaScan</h3>
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
            className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 lg:col-span-2"
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
          className="text-center text-white/50 text-sm tracking-widest uppercase mb-12"
        >
          SaaS Financial Model
        </motion.h2>
        <motion.div {...fadeUp} className="liquid-glass rounded-3xl p-12 max-w-5xl mx-auto border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.25)]">
          <div className="flex flex-col md:flex-row items-center justify-around gap-10 md:gap-6">
            {[
              { num: "15k EUR", label: "Annual AWS Cloud Cost (PostGIS/EC2)" },
              { num: "60k EUR", label: "Pilot Development Budget (3 engineers, 6 months)" },
              { num: "3,000 EUR", label: "Estimated B2B License / month / agency" },
            ].map((s) => (
              <div key={s.num} className="text-center">
                <div className="font-mono text-5xl text-white font-semibold tracking-tight tabular-nums">
                  {s.num}
                </div>
                <div className="text-white/50 text-sm mt-2 max-w-[180px] mx-auto leading-snug">
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
            AquaScan © 2026 · European Hydro-Intelligence Center
          </p>
        </motion.div>
      </footer>
    </>
  );
};
