import { Layers, ZoomIn, ZoomOut, Locate, Pencil } from "lucide-react";
import { useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";
import { GLASS, stopMapPropagation } from "./stopMap";

interface FabsProps {
  onOpenLayers: () => void;
  onStartDraw: () => void;
  shifted?: boolean;
}

/** Inner controls — must be inside <MapContainer> so useMap() works. */
export function MapFabsInner({ onOpenLayers, onStartDraw, shifted }: FabsProps) {
  const map = useMap();
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Bullet-proof Leaflet event isolation — kills click-through to the map underneath.
  useEffect(() => {
    if (!wrapRef.current) return;
    L.DomEvent.disableClickPropagation(wrapRef.current);
    L.DomEvent.disableScrollPropagation(wrapRef.current);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="absolute right-6 top-1/2 z-[1100] flex -translate-y-1/2 flex-col gap-2.5"
      {...stopMapPropagation}
    >
      <Fab label="Layers" onClick={onOpenLayers} accent>
        <Layers className="h-5 w-5" />
      </Fab>
      <Fab label="Draw AOI" onClick={onStartDraw}>
        <Pencil className="h-5 w-5" />
      </Fab>
      <div className={`${GLASS} flex flex-col overflow-hidden p-1`}>
        <button
          aria-label="Zoom in"
          onClick={() => map.zoomIn()}
          className="flex h-9 w-9 items-center justify-center rounded-2xl text-white/80 transition-colors hover:bg-white/10 hover:text-cyan-400"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <div className="mx-1 h-px bg-white/10" />
        <button
          aria-label="Zoom out"
          onClick={() => map.zoomOut()}
          className="flex h-9 w-9 items-center justify-center rounded-2xl text-white/80 transition-colors hover:bg-white/10 hover:text-cyan-400"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
      </div>
      <Fab
        label="Recenter"
        onClick={() => map.flyTo([48.5, 11.0], 5, { duration: 1.2 })}
      >
        <Locate className="h-5 w-5" />
      </Fab>
    </div>
  );
}

function Fab({
  children,
  onClick,
  label,
  accent,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`${GLASS} group relative flex h-11 w-11 items-center justify-center transition-all hover:scale-105 ${
        accent
          ? "text-cyan-400 [box-shadow:0_0_18px_rgba(34,211,238,0.35),0_8px_32px_rgba(0,0,0,0.3)] hover:bg-cyan-400/10"
          : "text-white/85 hover:bg-white/10 hover:text-cyan-300"
      }`}
    >
      {children}
      <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1 text-[10px] font-medium text-white/90 opacity-0 backdrop-blur-xl transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}
