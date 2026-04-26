import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
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
  type SimulationState,
} from "@/components/aquascan/AnalysisPanel";
import { TopNavbar } from "@/components/aquascan/TopNavbar";
import { MapLegend } from "@/components/aquascan/MapLegend";
import { LayersDialog } from "@/components/aquascan/LayersDialog";
import { stopMapPropagation } from "@/components/aquascan/stopMap";

const Index = () => {
  const mapRef = useRef<AquaMapHandle>(null);

  const [layers, setLayers] = useState<LayerState>({
    waterEvolution: false,
    sarUrban: false,
    dem: true,
  });
  const [layersOpen, setLayersOpen] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [reservoirBuilt, setReservoirBuilt] = useState(false);
  const [reservoirTargetId, setReservoirTargetId] = useState<string | null>(null);
  const [areaKm2, setAreaKm2] = useState(0);
  const [zoneName, setZoneName] = useState<string | undefined>(undefined);
  const [resetSignal, setResetSignal] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const [simulationState, setSimulationState] = useState<SimulationState>("idle");
  const timersRef = useRef<number[]>([]);
  const pendingZoneRef = useRef<string | null>(null);

  // Mobile breakpoint detection (sheet vs sidebar)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    document.title = "AquaScan — European Hydro-Intelligence Center";
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const triggerAnalysis = (
    name: string,
    area: number,
    zoneId: string | null,
  ) => {
    setHasInteracted(true);
    setReservoirBuilt(false);
    setReservoirTargetId(null);
    setSimulationState("idle");
    pendingZoneRef.current = zoneId;
    setZoneName(name);
    setAreaKm2(area);
    setAnalyzing(true);
    const t = window.setTimeout(() => {
      setAnalyzing(false);
      setPanelOpen(true);
    }, 1800);
    timersRef.current.push(t);
  };

  const handlePolygonComplete = (p: DrawnPolygon) => {
    const z = p.zoneId ? RECOMMENDED_ZONES.find((r) => r.id === p.zoneId) : null;
    triggerAnalysis(z?.name ?? "Custom AOI · Drawn", p.areaKm2, p.zoneId ?? null);
  };

  const handleToggleLayer = (k: keyof LayerState) =>
    setLayers((s) => ({ ...s, [k]: !s[k] }));

  const handleSimulate = () => {
    setSimulationState("deviating");
    const t1 = window.setTimeout(() => {
      setSimulationState("constructing");
    }, 1500);
    const t2 = window.setTimeout(() => {
      setSimulationState("filling");
    }, 3000);
    const t3 = window.setTimeout(() => {
      setReservoirTargetId(pendingZoneRef.current);
      setReservoirBuilt(true);
      setSimulationState("completed");
      toast.success("PostGIS Database Updated", {
        description: "Reservoir successfully modeled · intervention dispatched.",
        icon: <CheckCircle2 className="h-4 w-4 text-cyan-400" />,
        duration: 5000,
      });
    }, 4000);
    timersRef.current.push(t1, t2, t3);
  };

  const handleReset = () => {
    setResetSignal((s) => s + 1);
    setReservoirBuilt(false);
    setReservoirTargetId(null);
    setSimulationState("idle");
    setPanelOpen(false);
    setHasInteracted(false);
    pendingZoneRef.current = null;
  };

  const handleClosePanel = () => {
    if (
      simulationState !== "idle" &&
      simulationState !== "completed"
    )
      return;
    setPanelOpen(false);
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-950">
      {/* MAP — full bleed */}
      <div className="absolute inset-0 z-0">
        <AquaMap
          ref={mapRef}
          onPolygonComplete={handlePolygonComplete}
          reservoirMode={reservoirBuilt}
          reservoirTargetId={reservoirTargetId}
          onResetSignal={resetSignal}
          layers={layers}
          onOpenLayers={() => setLayersOpen(true)}
        />
      </div>

      {/* Subtle vignette + grid above map, under panels */}
      <div className="pointer-events-none absolute inset-0 z-[5] grid-overlay opacity-15 mix-blend-overlay" />
      <div
        className="pointer-events-none absolute inset-0 z-[5] opacity-50"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(34,211,238,0.10), transparent 60%), radial-gradient(circle at 50% 100%, rgba(2,6,23,0.6), transparent 70%)",
        }}
      />

      {/* TOP GLASS NAVBAR */}
      <TopNavbar />

      {/* HINT — first-run only */}
      {!hasInteracted && !analyzing && simulationState === "idle" && !panelOpen && (
        <div
          className="pointer-events-none absolute left-1/2 top-24 z-[999] -translate-x-1/2 px-3"
          {...stopMapPropagation}
        >
          <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-slate-900/40 px-4 py-2 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            <p className="font-mono text-[10px] font-light uppercase tracking-[0.18em] text-white/85">
              Click a gold zone or use the draw FAB
            </p>
          </div>
        </div>
      )}

      {/* LEGEND */}
      <MapLegend layers={layers} />

      {/* LAYERS DIALOG */}
      <LayersDialog
        open={layersOpen}
        onOpenChange={setLayersOpen}
        layers={layers}
        onToggle={handleToggleLayer}
      />

      {/* LOADING */}
      {analyzing && <LoadingOverlay />}

      {/* ANALYSIS — desktop floating sidebar */}
      {panelOpen && !isMobile && (
        <AnalysisPanel
          onClose={handleClosePanel}
          onSimulate={handleSimulate}
          onReset={handleReset}
          area={areaKm2}
          zoneName={zoneName}
          simulationState={simulationState}
        />
      )}

      {/* ANALYSIS — mobile bottom sheet */}
      <Sheet
        open={panelOpen && isMobile}
        onOpenChange={(v) => {
          if (!v) handleClosePanel();
        }}
      >
        <SheetContent
          side="bottom"
          className="z-[1100] h-[88vh] rounded-t-3xl border-t border-white/10 bg-slate-900/70 p-0 backdrop-blur-2xl"
          {...stopMapPropagation}
        >
          <AnalysisPanel
            inline
            onClose={handleClosePanel}
            onSimulate={handleSimulate}
            onReset={handleReset}
            area={areaKm2}
            zoneName={zoneName}
            simulationState={simulationState}
          />
        </SheetContent>
      </Sheet>
    </main>
  );
};

export default Index;
