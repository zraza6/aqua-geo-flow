import { useState } from "react";
import { toast } from "sonner";
import { Sidebar } from "@/components/aquascan/Sidebar";
import { Header } from "@/components/aquascan/Header";
import { AquaMap } from "@/components/aquascan/AquaMap";
import { LoadingOverlay } from "@/components/aquascan/LoadingOverlay";
import { AnalysisPanel } from "@/components/aquascan/AnalysisPanel";
import { MapHint, MapLegend, StatusStrip } from "@/components/aquascan/MapOverlays";
import { CheckCircle2 } from "lucide-react";

const Index = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [reservoirBuilt, setReservoirBuilt] = useState(false);
  const [areaKm2, setAreaKm2] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(false);

  const handlePolygonComplete = ({ areaKm2 }: { areaKm2: number }) => {
    setHasDrawn(true);
    setReservoirBuilt(false);
    setAreaKm2(areaKm2);
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setPanelOpen(true);
    }, 2000);
  };

  const handleBuildReservoir = () => {
    setPanelOpen(false);
    setReservoirBuilt(true);
    toast.success("Decision recorded in PostGIS Database", {
      description: "Reservoir AOI persisted · intervention dispatched to ops queue.",
      icon: <CheckCircle2 className="h-4 w-4 text-primary" />,
      duration: 4500,
    });
  };

  const handleDivertRiver = () => {
    setPanelOpen(false);
    toast.success("River diversion plan saved", {
      description: "Hydrological model recalculating downstream impact…",
      duration: 4000,
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="relative flex flex-1 flex-col">
        <Header />
        <main className="relative flex-1 overflow-hidden">
          {/* Decorative grid + glow vignette */}
          <div className="pointer-events-none absolute inset-0 z-[400] grid-overlay opacity-40 mix-blend-overlay" />
          <div className="pointer-events-none absolute inset-0 z-[400] bg-gradient-radial-glow" />

          <AquaMap
            onPolygonComplete={handlePolygonComplete}
            reservoirMode={reservoirBuilt}
            onResetSignal={resetSignal}
          />

          <MapHint visible={!hasDrawn && !analyzing} />
          <MapLegend />
          <StatusStrip />

          {analyzing && <LoadingOverlay />}
          {panelOpen && (
            <AnalysisPanel
              onClose={() => setPanelOpen(false)}
              onBuildReservoir={handleBuildReservoir}
              onDivertRiver={handleDivertRiver}
              area={areaKm2}
            />
          )}

          {/* Reset / new AOI button after reservoir built */}
          {reservoirBuilt && (
            <button
              onClick={() => {
                setResetSignal((s) => s + 1);
                setReservoirBuilt(false);
                setHasDrawn(false);
              }}
              className="absolute right-5 top-5 z-[450] glass-panel rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-primary hover:shadow-glow-cyan transition-shadow"
            >
              + New AOI Analysis
            </button>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
