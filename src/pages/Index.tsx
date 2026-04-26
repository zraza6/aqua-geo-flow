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
import { CommandHub, type CommandTab } from "@/components/aquascan/CommandHub";
import { ContextPanel } from "@/components/aquascan/ContextPanel";
import { stopMapPropagation } from "@/components/aquascan/stopMap";

const Index = () => {
  const mapRef = useRef<AquaMapHandle>(null);

  const [activeTab, setActiveTab] = useState<CommandTab>("dashboard");
  const [layers, setLayers] = useState<LayerState>({
    waterEvolution: false,
    sarUrban: false,
    dem: true,
  });

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

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
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

  const triggerAnalysis = (name: string, area: number, zoneId: string | null) => {
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

  const handleZoneClickFromPanel = (id: string) => {
    const z = RECOMMENDED_ZONES.find((r) => r.id === id);
    if (!z) return;
    const approxArea = 95 + Math.random() * 40;
    triggerAnalysis(z.name, approxArea, id);
  };

  const handleToggleLayer = (k: keyof LayerState) =>
    setLayers((s) => ({ ...s, [k]: !s[k] }));

  const handleSimulate = () => {
    setSimulationState("deviating");
    const t1 = window.setTimeout(() => setSimulationState("constructing"), 1500);
    const t2 = window.setTimeout(() => setSimulationState("filling"), 3000);
    const t3 = window.setTimeout(() => {
      setReservoirTargetId(pendingZoneRef.current);
      setReservoirBuilt(true);
      setSimulationState("completed");
      toast.success("PostGIS Database Updated", {
        description: "Reservoir modeled successfully · intervention dispatched.",
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
      {/* === LAYER 0: MAP === */}
      <div className="absolute inset-0 z-0">
        <AquaMap
          ref={mapRef}
          onPolygonComplete={handlePolygonComplete}
          reservoirMode={reservoirBuilt}
          reservoirTargetId={reservoirTargetId}
          onResetSignal={resetSignal}
          layers={layers}
          onOpenLayers={() => setActiveTab("layers")}
        />
      </div>

      {/* Decorative grid + vignette (pointer-events-none, between map and UI) */}
      <div className="pointer-events-none absolute inset-0 z-[5] grid-overlay opacity-15 mix-blend-overlay" />
      <div
        className="pointer-events-none absolute inset-0 z-[5] opacity-50"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(34,211,238,0.10), transparent 60%), radial-gradient(circle at 50% 100%, rgba(2,6,23,0.6), transparent 70%)",
        }}
      />

      {/* === LAYER 1: UI OVERLAY (anti-freeze single overlay, panels opt-in to events) === */}
      <div className="pointer-events-none absolute inset-0 z-50 flex flex-col p-3 sm:p-6">
        {/* TOP — brand bar */}
        <div className="pointer-events-none flex shrink-0 justify-center">
          <TopNavbar />
        </div>

        {/* MIDDLE — left nav + context panel + right analysis */}
        <div className="pointer-events-none mt-4 flex flex-1 items-stretch justify-between gap-3 overflow-hidden sm:gap-4">
          {/* LEFT: Command Hub + (optional) Context panel */}
          <div className="pointer-events-none flex max-h-full items-stretch gap-3 sm:gap-4">
            <div className="pointer-events-none flex items-center">
              <CommandHub active={activeTab} onChange={setActiveTab} />
            </div>
            {/* Hide context panel on mobile (handled via top nav tap) */}
            <div className="pointer-events-none hidden max-h-full md:block">
              <ContextPanel
                tab={activeTab}
                layers={layers}
                onToggleLayer={handleToggleLayer}
                onZoneClick={handleZoneClickFromPanel}
              />
            </div>
          </div>

          {/* RIGHT: Analysis panel (desktop only — mobile uses Sheet) */}
          <div className="pointer-events-none flex max-h-full items-stretch">
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
          </div>
        </div>

        {/* BOTTOM — legend (always visible, glass) */}
        <div className="pointer-events-none mt-3 flex shrink-0 justify-start sm:mt-4">
          <MapLegend layers={layers} />
        </div>
      </div>

      {/* HINT — first-run, above everything */}
      {!hasInteracted && !analyzing && simulationState === "idle" && !panelOpen && (
        <div
          className="pointer-events-none absolute left-1/2 top-24 z-[60] -translate-x-1/2 px-3"
          {...stopMapPropagation}
        >
          <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-slate-900/40 px-4 py-2 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
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

      {/* LOADING OVERLAY */}
      {analyzing && <LoadingOverlay />}

      {/* MOBILE ANALYSIS — bottom sheet */}
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
