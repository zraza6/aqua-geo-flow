import { Activity, Droplets, FileText, MapPin } from "lucide-react";

export const MarketingSections = () => {
  return (
    <>
      {/* PRODUCT SYNERGY */}
      <section className="bg-[#030712] py-24 px-6">
        <h2 className="text-4xl font-semibold text-white/90 text-center mb-16 tracking-tight">
          Interfața AquaScan. Motorul HeavyWater.
        </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left card */}
          <div className="liquid-glass rounded-3xl p-8 lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white/90 text-lg font-medium">UI: AquaScan</h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400/80">
                Live · GIS Layer
              </span>
            </div>
            <div className="relative h-64 rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
              {/* Mock map grid */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(34,211,238,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.15) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              {/* Mock river */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 256" preserveAspectRatio="none">
                <path
                  d="M0,180 C80,160 120,90 200,100 C280,110 320,200 400,170"
                  stroke="rgba(34,211,238,0.6)"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M0,180 C80,160 120,90 200,100 C280,110 320,200 400,170"
                  stroke="rgba(34,211,238,0.15)"
                  strokeWidth="14"
                  fill="none"
                />
              </svg>
              {/* Node pin */}
              <div className="absolute top-[42%] left-[48%] flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
                </span>
                <span className="font-mono text-[10px] text-amber-300">A3</span>
              </div>
              {/* Floating data box */}
              <div className="absolute bottom-4 right-4 liquid-glass rounded-xl px-3 py-2">
                <p className="text-xs font-mono text-white/90 leading-relaxed">
                  <span className="text-cyan-400">Node A3</span> | Ksat: 22mm/h
                  <br />
                  Risk: <span className="text-red-400">High Seepage</span>
                  <br />
                  Rec: <span className="text-emerald-400">HDPE Liner</span>
                </p>
              </div>
              <div className="absolute top-4 left-4 flex items-center gap-1.5 text-white/50">
                <MapPin className="h-3 w-3" />
                <span className="font-mono text-[10px] uppercase tracking-widest">46.7°N · 23.6°E</span>
              </div>
            </div>
            <p className="text-white/50 text-sm mt-6">
              Stratul vizual interactiv pentru analiză AOI, simulări de baraje și raportare instant.
            </p>
          </div>

          {/* Right card */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white/90 text-lg font-medium">Backend: HeavyWater</h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-green-400/70">
                py · 3.11
              </span>
            </div>
            <div className="rounded-2xl bg-black/60 border border-white/5 p-5 font-mono text-sm text-green-400/80 leading-relaxed">
              <div className="text-white/30 mb-2">$ python decision.py --basin=apuseni</div>
              <pre className="whitespace-pre-wrap">{`{
  "module": "decision.py",
  "dijkstra_cost": "optimal",
  "stability_v_mean": "-2.1 mm/yr",
  "route_score": 82.4
}`}</pre>
              <div className="mt-3 text-white/30">
                <span className="text-cyan-400/70">→</span> PostGIS commit · 0.42s
              </div>
            </div>
            <p className="text-white/50 text-sm mt-6">
              Motor geospațial Python: PostGIS, Earth Engine, Dijkstra & InSAR — totul prin API.
            </p>
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="bg-[#030712] py-24 px-6">
        <h2 className="text-3xl text-white/90 text-center mb-16 font-semibold tracking-tight">
          Scalare & Funcționalități Viitoare
        </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Activity,
              title: "Mentenanță Predictivă (InSAR)",
              text: "Extragem serii de timp EGMS pe 5 ani. Dacă rata de subsidență accelerează cu > 2 mm/an, declanșăm o alertă de ruptură cu 6 luni în avans.",
            },
            {
              icon: Droplets,
              title: "Reziliență Climatică (C3S)",
              text: "Dacă senzorii Sentinel-1 detectează umiditate < 15% timp de 3 veri consecutive, rulăm automat un SF pentru irigații preventive.",
            },
            {
              icon: FileText,
              title: "Automatizare B2G",
              text: "Mapăm output-ul din river_metrics.py direct pe formatul oficial al Anexelor ANAR (Legea 107/1996) pentru Avizul de Gospodărire a Apelor.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="liquid-glass rounded-3xl p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 border border-cyan-400/20">
                <Icon className="h-5 w-5 text-cyan-300" />
              </div>
              <h3 className="text-white/90 text-lg font-medium mt-6">{title}</h3>
              <p className="text-white/70 text-sm mt-4 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ENTERPRISE ECONOMICS */}
      <section className="bg-[#030712] py-24 px-6 border-t border-white/5">
        <h2 className="text-center text-white/50 text-sm tracking-widest uppercase mb-12">
          Modelul Financiar SaaS
        </h2>
        <div className="liquid-glass rounded-3xl p-12 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-around gap-10 md:gap-6">
            {[
              { num: "15k EUR", label: "Cost cloud AWS (PostGIS/EC2)" },
              { num: "60k EUR", label: "Buget pilot (3 ingineri, 6 luni)" },
              { num: "3.000 EUR", label: "Licență / lună / agenție B2B" },
            ].map((s) => (
              <div key={s.num} className="text-center">
                <div className="text-5xl text-white font-semibold tracking-tight">{s.num}</div>
                <div className="text-white/50 text-sm mt-2">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-white/80 mt-12 max-w-2xl mx-auto leading-relaxed">
            <span className="text-cyan-300 font-medium">ROI Imediat:</span> Eliminarea a 6 luni de
            prospecțiuni topografice pe teren (cost mediu &gt;20.000 EUR conform licitațiilor SEAP).
          </p>
        </div>
      </section>

      <footer className="bg-[#030712] py-10 px-6 border-t border-white/5 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
          AquaScan © 2026 · European Hydro-Intelligence Center
        </p>
      </footer>
    </>
  );
};
