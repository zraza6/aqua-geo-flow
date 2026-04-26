import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Sidebar, type SidebarTab } from "@/components/aquascan/Sidebar";
import { SidePanel } from "@/components/aquascan/SidePanel";
import { AquaMap, RECOMMENDED_ZONES, type DrawnPolygon, type LayerState } from "@/components/aquascan/AquaMap";
import { LoadingOverlay } from "@/components/aquascan/LoadingOverlay";
import { AnalysisPanel } from "@/components/aquascan/AnalysisPanel";
import { MapHint, MapLegend, StatusStrip, ZonesBadge, TopBrand } from "@/components/aquascan/MapOverlays";
import { CheckCircle2 } from "lucide-react";

const SCENARIO_STEPS = [
  "Deviating river flow…",
  "Constructing primary wall…",
  "Filling reservoir basin…",
];

const Index = () => {
  const [tab, setTab] = useState<SidebarTab>("dashboard");
  const [layers, setLayers] = useState<LayerState>({
    waterEvolution: false,
    sarUrban: false,
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [reservoirBuilt, setReservoirBuilt] = useState(false);
  const [reservoirTargetId, setReservoirTargetId] = useState<string | null>(null);
  const [areaKm2, setAreaKm2] = useState(0);
  const [zoneName, setZoneName] = useState<string | undefined>(undefined);
  const [resetSignal, setResetSignal] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const [scenarioStep, setScenarioStep] = useState(0);
  const scenarioTimers = useRef<number[]>([]);
  const pendingZoneRef = useRef<string | null>(null);

  useEffect(() => {
    document.title = "AquaScan — European Hydro-Intelligence Center";
    return () => {
      scenarioTimers.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const handlePolygonComplete = (p: DrawnPolygon) => {
    setHasInteracted(true);
    setReservoirBuilt(false);
    setReservoirTargetId(null);
    setAreaKm2(p.areaKm2);
    pendingZoneRef.current = p.zoneId ?? null;
    const z = p.zoneId ? RECOMMENDED_ZONES.find((r) => r.id === p.zoneId) : null;
    setZoneName(z?.name ?? "Custom AOI · Drawn");
    setAnalyzing(true);
    const t = window.setTimeout(() => {
      setAnalyzing(false);
      setPanelOpen(true);
    }, 1800);
    scenarioTimers.current.push(t);
  };

  const handleZoneClickFromPanel = (id: string) => {
    const z = RECOMMENDED_ZONES.find((r) => r.id === id);
    if (!z) return;
    const approxArea = 95 + Math.random() * 40;
    pendingZoneRef.current = id;
    setHasInteracted(true);
    setReservoirBuilt(false);
    setReservoirTargetId(null);
    setAreaKm2(approxArea);
    setZoneName(z.name);
    setAnalyzing(true);
    const t = window.setTimeout(() => {
      setAnalyzing(false);
      setPanelOpen(true);
    }, 1800);
    scenarioTimers.current.push(t);
  };

  const handleToggleLayer = (k: keyof LayerState) => {
    setLayers((s) => ({ ...s, [k]: !s[k] }));
  };

  const handleSimulate = () => {
    setScenarioStep(1);
    setTab("scenarios");
    toast(SCENARIO_STEPS[0], { duration: 1400 });

    const t1 = window.setTimeout(() => {
      setScenarioStep(2);
      toast(SCENARIO_STEPS[1], { duration: 1400 });
    }, 1500);
    const t2 = window.setTimeout(() => {
      setScenarioStep(3);
      toast(SCENARIO_STEPS[2], { duration: 1400 });
    }, 3000);
    const t3 = window.setTimeout(() => {
      setReservoirTargetId(pendingZoneRef.current);
      setReservoirBuilt(true);
      setPanelOpen(false);
      setScenarioStep(4);
      toast.success("Reservoir successfully modeled", {
        description: "PostGIS database updated · intervention dispatched.",
        icon: <CheckCircle2 className="h-4 w-4 text-primary" />,
        duration: 5000,
      });
    }, 4500);
    const t4 = window.setTimeout(() => setScenarioStep(0), 9000);
    scenarioTimers.current.push(t1, t2, t3, t4);
  };

  const handleNewAOI = () => {
    setResetSignal((s) => s + 1);
    setReservoirBuilt(false);
    setReservoirTargetId(null);
    setHasInteracted(false);
    pendingZoneRef.current = null;
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* MAP – full bleed underneath everything */}
      <div className="absolute inset-0 z-0">
        <AquaMap
          onPolygonComplete={handlePolygonComplete}
          reservoirMode={reservoirBuilt}
          reservoirTargetId={reservoirTargetId}
          onResetSignal={resetSignal}
          layers={layers}
        />
      </div>

      {/* Decorative grid + glow vignette over map but under panels */}
      <div className="pointer-events-none absolute inset-0 z-[5] grid-overlay opacity-20 mix-blend-overlay" />
      <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-radial-glow opacity-60" />

      {/* TOP BRAND BAR (floating) */}
      <TopBrand />

      {/* FLOATING LEFT SIDEBAR (icons) */}
      <div className="absolute left-4 top-1/2 z-[1000] -translate-y-1/2">
        <Sidebar active={tab} onChange={setTab} />
      </div>

      {/* FLOATING LEFT CONTEXT PANEL */}
      <div className="absolute left-24 top-20 bottom-20 z-[1000] w-[320px] max-w-[calc(100vw-7rem)]">
        <SidePanel
          tab={tab}
          layers={layers}
          onToggleLayer={handleToggleLayer}
          onZoneClick={handleZoneClickFromPanel}
          scenarioStep={scenarioStep}
        />
      </div>

      {/* FLOATING OVERLAYS */}
      <ZonesBadge />
      <MapHint visible={!hasInteracted && !analyzing && scenarioStep === 0} />
      <MapLegend layers={layers} />
      <StatusStrip />

      {analyzing && <LoadingOverlay />}

      {/* RIGHT GLASS PANEL – only when AOI selected */}
      {panelOpen && (
        <AnalysisPanel
          onClose={() => setPanelOpen(false)}
          onSimulate={handleSimulate}
          area={areaKm2}
          zoneName={zoneName}
          scenarioStep={scenarioStep}
        />
      )}

      {reservoirBuilt && (
        <button
          onClick={handleNewAOI}
          className="absolute right-6 top-6 z-[1100] rounded-full border border-white/15 bg-black/40 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-primary backdrop-blur-xl transition-all hover:border-primary/50 hover:shadow-glow-cyan"
        >
          + New AOI Analysis
        </button>
      )}
    </div>
  );
};

export default Index;
