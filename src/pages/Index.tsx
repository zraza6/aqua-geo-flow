import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
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

interface SelectedBasin {
  id: string;
  name: string;
  areaKm2: number;
  source: "drawn" | "recommended";
}

const Index = () => {
  const mapRef = useRef<AquaMapHandle>(null);

  const [activeSidebarTab, setActiveSidebarTab] = useState<CommandTab>("dashboard");
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
    document.title = "AquaScan — European Hydro-Intelligence Center";
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const handlePolygonComplete = (p: DrawnPolygon) => {
    const z = p.zoneId ? RECOMMENDED_ZONES.find((r) => r.id === p.zoneId) : null;
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
      });
    }, 1800);
    timersRef.current.push(t);
  };

  const handleToggleLayer = (k: keyof LayerState) =>
    setLayers((s) => ({ ...s, [k]: !s[k] }));

  const handleSimulate = () => {
    setSimulationStatus("modeling");
    const t1 = window.setTimeout(() => setSimulationStatus("deviating"), 1500);
    const t2 = window.setTimeout(() => setSimulationStatus("constructing"), 3000);
    const t3 = window.setTimeout(() => {
      // Direct Leaflet mutation — no React re-render of the map
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

  const handleClosePanel = () => {
    if (simulationStatus !== "idle" && simulationStatus !== "complete") return;
    setSelectedBasin(null);
    setSimulationStatus("idle");
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-950">
      {/* === LAYER 0: MAP === */}
      <div className="absolute inset-0 z-0">
        <AquaMap
          ref={mapRef}
          onPolygonComplete={handlePolygonComplete}
          onOpenLayers={() => setActiveSidebarTab("layers")}
          layers={layers}
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

      {/* === LAYER 1: UI OVERLAY === */}
      <div className="pointer-events-none absolute inset-0 z-50 flex flex-col p-3 sm:p-6">
        {/* TOP — brand */}
        <div className="pointer-events-none flex shrink-0 justify-center">
          <TopNavbar />
        </div>

        {/* MIDDLE — left nav + context + analysis */}
        <div className="pointer-events-none mt-4 flex flex-1 items-stretch justify-between gap-3 overflow-hidden sm:gap-4">
          <div className="pointer-events-none flex max-h-full items-stretch gap-3 sm:gap-4">
            <div className="pointer-events-none flex items-center">
              <CommandHub active={activeSidebarTab} onChange={setActiveSidebarTab} />
            </div>
            <div className="pointer-events-none hidden max-h-full md:block">
              <ContextPanel
                tab={activeSidebarTab}
                layers={layers}
                onToggleLayer={handleToggleLayer}
              />
            </div>
          </div>

          {/* RIGHT — basin intelligence (modeless, slides in) */}
          <div className="pointer-events-none flex max-h-full items-stretch">
            {selectedBasin && (
              <AnalysisPanel
                onClose={handleClosePanel}
                onSimulate={handleSimulate}
                onReset={handleReset}
                area={selectedBasin.areaKm2}
                zoneName={selectedBasin.name}
                simulationStatus={simulationStatus}
              />
            )}
          </div>
        </div>

        {/* BOTTOM — legend */}
        <div className="pointer-events-none mt-3 flex shrink-0 justify-start sm:mt-4">
          <MapLegend layers={layers} />
        </div>
      </div>

      {/* HINT */}
      {!hasInteracted &&
        !analyzing &&
        simulationStatus === "idle" &&
        !selectedBasin && (
          <div
            className="pointer-events-none absolute left-1/2 top-24 z-[60] -translate-x-1/2 px-3"
            {...stopMapPropagation}
          >
            <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              <p className="font-mono text-[10px] font-light uppercase tracking-[0.18em] text-white/85">
                Click a gold valley · or draw a custom AOI
              </p>
            </div>
          </div>
        )}

      {analyzing && <LoadingOverlay />}
    </main>
  );
};

export default Index;
