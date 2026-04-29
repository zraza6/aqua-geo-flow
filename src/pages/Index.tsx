import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import L from "leaflet";
import {
  AquaMap,
  RECOMMENDED_ZONES,
  type AquaMapHandle,
  type DrawnPolygon,
  type LayerState,
} from "@/components/aquascan/AquaMap";
import { LoadingOverlay } from "@/components/aquascan/LoadingOverlay";
import {
  AnalysisPanel,
  type SimulationStatus,
} from "@/components/aquascan/AnalysisPanel";
import { TopNavbar } from "@/components/aquascan/TopNavbar";
import { MapLegend } from "@/components/aquascan/MapLegend";
import { CommandHub, type CommandTab } from "@/components/aquascan/CommandHub";
import { ContextPanel } from "@/components/aquascan/ContextPanel";
import { stopMapPropagation } from "@/components/aquascan/stopMap";
import { MarketingSections } from "@/components/aquascan/MarketingSections";
import { SubNavPill } from "@/components/aquascan/SubNavPill";

interface SelectedBasin {
  id: string;
  name: string;
  areaKm2: number;
  source: "drawn" | "recommended";
  lat: number;
  lng: number;
}

function polygonCentroid(layer: L.Polygon): { lat: number; lng: number } {
  const latlngs = layer.getLatLngs()[0] as L.LatLng[];
  if (!latlngs?.length) return { lat: 0, lng: 0 };
  let lat = 0;
  let lng = 0;
  latlngs.forEach((p) => {
    lat += p.lat;
    lng += p.lng;
  });
  return { lat: lat / latlngs.length, lng: lng / latlngs.length };
}

const Index = () => {
  const mapRef = useRef<AquaMapHandle>(null);

  const [activeSidebarTab, setActiveSidebarTab] = useState<CommandTab>("dashboard");
  const [showContext, setShowContext] = useState(true);
  const [layers, setLayers] = useState<LayerState>({
    waterEvolution: false,
    sarUrban: false,
    dem: true,
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [selectedBasin, setSelectedBasin] = useState<SelectedBasin | null>(null);
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus>("idle");
  const [hasInteracted, setHasInteracted] = useState(false);

  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    document.title = "Aqua Scan Pro — European Hydro-Intelligence Center";
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const handlePolygonComplete = (p: DrawnPolygon) => {
    const z = p.zoneId ? RECOMMENDED_ZONES.find((r) => r.id === p.zoneId) : null;
    const { lat, lng } = polygonCentroid(p.layer);
    setHasInteracted(true);
    setSimulationStatus("idle");
    setAnalyzing(true);
    const t = window.setTimeout(() => {
      setAnalyzing(false);
      setSelectedBasin({
        id: p.zoneId ?? `drawn-${Date.now()}`,
        name: z?.name ?? "Custom AOI · Drawn",
        areaKm2: p.areaKm2,
        source: p.source,
        lat,
        lng,
      });
    }, 1400);
    timersRef.current.push(t);
  };

  const handleToggleLayer = (k: keyof LayerState) =>
    setLayers((s) => ({ ...s, [k]: !s[k] }));

  const handleSimulate = () => {
    setSimulationStatus("modeling");
    const t1 = window.setTimeout(() => setSimulationStatus("deviating"), 1500);
    const t2 = window.setTimeout(() => setSimulationStatus("constructing"), 3000);
    const t3 = window.setTimeout(() => {
      mapRef.current?.applyReservoirStyle();
      setSimulationStatus("complete");
      toast.success("Simulation Complete", {
        description: "River basin diverted successfully · PostGIS updated.",
        icon: <CheckCircle2 className="h-4 w-4 text-cyan-400" />,
        duration: 5000,
      });
    }, 4500);
    timersRef.current.push(t1, t2, t3);
  };

  const handleReset = () => {
    mapRef.current?.reset();
    setSelectedBasin(null);
    setSimulationStatus("idle");
    setHasInteracted(false);
  };

  const handleResetDemo = () => {
    mapRef.current?.reset();
    setSelectedBasin(null);
    setSimulationStatus("idle");
    setHasInteracted(false);
    setAnalyzing(false);
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    window.dispatchEvent(new CustomEvent("aquascan:reset-demo"));
    toast.success("Demo reset", {
      description: "Map cleared · AOI removed · Node A3 restored.",
      icon: <RefreshCw className="h-4 w-4 text-cyan-400" />,
      duration: 3000,
    });
  };

  const handleAreaChange = (km2: number) => {
    setSelectedBasin((b) => (b ? { ...b, areaKm2: km2 } : b));
  };

  const handleClosePanel = () => {
    if (simulationStatus !== "idle" && simulationStatus !== "complete") return;
    setSelectedBasin(null);
    setSimulationStatus("idle");
  };

  const handleSidebarChange = (t: CommandTab) => {
    if (t === activeSidebarTab) {
      setShowContext((s) => !s);
    } else {
      setActiveSidebarTab(t);
      setShowContext(true);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col bg-[#030712] text-slate-200">
      <div className="relative h-[85vh] w-full shrink-0 overflow-hidden">
        {/* === LAYER 0: MAP === */}
        <div className="absolute inset-0 z-0">
          <AquaMap
            ref={mapRef}
            onPolygonComplete={handlePolygonComplete}
            onAreaChange={handleAreaChange}
            onOpenLayers={() => {
              setActiveSidebarTab("layers");
              setShowContext(true);
            }}
            layers={layers}
            panelOpen={!!selectedBasin}
          />
        </div>

        {/* Decorative grid + vignette */}
        <div className="pointer-events-none absolute inset-0 z-[5] grid-overlay opacity-15 mix-blend-overlay" />
        <div
          className="pointer-events-none absolute inset-0 z-[5] opacity-50"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(34,211,238,0.10), transparent 60%), radial-gradient(circle at 50% 100%, rgba(2,6,23,0.6), transparent 70%)",
          }}
        />

        {/* === LAYER 1: UI OVERLAY (flex grid, no overlaps) === */}
        <div className="pointer-events-none absolute inset-0 z-50 grid grid-rows-[auto_1fr_auto] gap-3 p-3 sm:gap-4 sm:p-5">
          {/* TOP — brand only */}
          <div className="pointer-events-none flex flex-col items-center">
            <TopNavbar />
          </div>

          {/* MIDDLE — left nav/context + RIGHT analysis */}
          <div className="pointer-events-none flex items-stretch justify-between gap-3 overflow-hidden sm:gap-4">
            {/* LEFT cluster */}
            <div className="pointer-events-none flex max-h-full items-stretch gap-3 sm:gap-4">
              <div className="pointer-events-none flex items-center">
                <CommandHub active={activeSidebarTab} onChange={handleSidebarChange} />
              </div>
              <AnimatePresence mode="wait">
                {showContext && (
                  <motion.div
                    key={activeSidebarTab}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                    className="pointer-events-none hidden max-h-full md:block"
                  >
                    <ContextPanel
                      tab={activeSidebarTab}
                      layers={layers}
                      onToggleLayer={handleToggleLayer}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT — basin intelligence */}
            <div className="pointer-events-none flex max-h-full items-stretch">
              <AnimatePresence>
                {selectedBasin && (
                  <AnalysisPanel
                    key={selectedBasin.id}
                    onClose={handleClosePanel}
                    onSimulate={handleSimulate}
                    onReset={handleReset}
                    area={selectedBasin.areaKm2}
                    zoneName={selectedBasin.name}
                    lat={selectedBasin.lat}
                    lng={selectedBasin.lng}
                    simulationStatus={simulationStatus}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* BOTTOM — legend */}
          <div className="pointer-events-none flex justify-start">
            <MapLegend layers={layers} />
          </div>
        </div>

        {/* HINT — bottom centered, far from navbar & side panels */}
        <AnimatePresence>
          {!hasInteracted &&
            !analyzing &&
            simulationStatus === "idle" &&
            !selectedBasin && (
              <motion.div
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 8, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="pointer-events-none absolute bottom-12 left-1/2 z-[60] -translate-x-1/2 px-3"
                {...stopMapPropagation}
              >
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-3.5 py-1.5 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  </span>
                  <p className="font-mono text-[9.5px] font-light uppercase tracking-[0.18em] text-white/85">
                    Click any zone · or draw an AOI anywhere on the globe
                  </p>
                </div>
              </motion.div>
            )}
        </AnimatePresence>

        {/* RESET DEMO — bottom-left FAB */}
        <button
          onClick={handleResetDemo}
          {...stopMapPropagation}
          title="Reset Demo"
          aria-label="Reset Demo"
          className="group pointer-events-auto absolute bottom-6 left-6 z-[1100] flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/75 px-3.5 py-2 text-white/80 backdrop-blur-xl transition-all hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-cyan-200 [box-shadow:0_8px_32px_rgba(0,0,0,0.4)]"
        >
          <RefreshCw className="h-3.5 w-3.5 transition-transform group-hover:-rotate-180 duration-500" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em]">
            Reset Demo
          </span>
        </button>

        {analyzing && <LoadingOverlay />}

        {/* SUB-NAV PILL — bottom center of hero map */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-[1100] -translate-x-1/2">
          <SubNavPill />
        </div>
      </div>

      {/* === SCROLLABLE LANDING SECTIONS === */}
      <MarketingSections />
    </main>
  );
};

export default Index;
