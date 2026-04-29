import { MapContainer, TileLayer, FeatureGroup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";
import { EditControl } from "react-leaflet-draw";
import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { MapFabsInner } from "./MapFabs";
import { patchLeafletDraw } from "./patchLeafletDraw";

// Patch leaflet-draw 1.0.4 readableArea ReferenceError (mousemove crash)
patchLeafletDraw();

// Default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface DrawnPolygon {
  layer: L.Polygon;
  areaKm2: number;
  source: "drawn" | "recommended";
  zoneId?: string;
}

export interface LayerState {
  waterEvolution: boolean;
  sarUrban: boolean;
  dem: boolean;
}

export interface AquaMapHandle {
  startDraw: () => void;
  /** Mutate the currently active layer's style — used by the simulator to model the reservoir. */
  applyReservoirStyle: () => void;
  /** Reset all drawn shapes and recommended zones to base style. */
  reset: () => void;
}

interface Props {
  onPolygonComplete: (p: DrawnPolygon) => void;
  onOpenLayers: () => void;
  layers: LayerState;
}

/* ---- Mock geo data — Cluj-Napoca / Apuseni Mountains ---- */
export const RECOMMENDED_ZONES: { id: string; name: string; coords: [number, number][] }[] = [
  {
    id: "zone-1",
    name: "Someșul Cald Valley",
    coords: [
      [46.74, 23.04],
      [46.78, 23.12],
      [46.74, 23.20],
      [46.69, 23.18],
      [46.68, 23.08],
    ],
  },
  {
    id: "zone-2",
    name: "Arieș Gorge · Apuseni",
    coords: [
      [46.45, 23.30],
      [46.50, 23.40],
      [46.46, 23.50],
      [46.40, 23.46],
      [46.39, 23.34],
    ],
  },
  {
    id: "zone-3",
    name: "Crișul Repede Headwaters",
    coords: [
      [46.92, 22.80],
      [46.96, 22.90],
      [46.92, 23.00],
      [46.86, 22.96],
      [46.85, 22.84],
    ],
  },
];

const RIVER_HEATMAP: [number, number][] = [
  // Someș system
  [46.77, 23.59], [46.74, 23.45], [46.72, 23.30], [46.70, 23.15], [46.69, 23.02],
  [46.78, 23.78], [46.82, 23.95], [46.85, 24.10],
  // Arieș
  [46.46, 23.42], [46.43, 23.55], [46.40, 23.70], [46.38, 23.85],
  // Crișul Repede
  [46.93, 22.87], [46.92, 22.70], [46.90, 22.55], [46.88, 22.40],
  // Around DEM zones
  [46.75, 23.10], [46.72, 23.18], [46.46, 23.40], [46.94, 22.92],
];

const URBAN_FOOTPRINTS: { name: string; bounds: [[number, number], [number, number]] }[] = [
  { name: "Cluj-Napoca", bounds: [[46.73, 23.55], [46.80, 23.66]] },
  { name: "Turda", bounds: [[46.55, 23.77], [46.59, 23.82]] },
  { name: "Dej", bounds: [[47.13, 23.85], [47.17, 23.93]] },
  { name: "Huedin", bounds: [[46.86, 23.05], [46.89, 23.10]] },
  { name: "Câmpia Turzii", bounds: [[46.54, 23.87], [46.57, 23.93]] },
];

function polygonAreaKm2(latlngs: L.LatLng[]): number {
  if (latlngs.length < 3) return 0;
  const R = 6378137;
  let total = 0;
  for (let i = 0; i < latlngs.length; i++) {
    const p1 = latlngs[i];
    const p2 = latlngs[(i + 1) % latlngs.length];
    total +=
      ((p2.lng - p1.lng) * Math.PI) / 180 *
      (2 + Math.sin((p1.lat * Math.PI) / 180) + Math.sin((p2.lat * Math.PI) / 180));
  }
  total = (total * R * R) / 2;
  return Math.abs(total) / 1_000_000;
}

function MapTuning() {
  const map = useMap();
  useEffect(() => {
    map.attributionControl.setPrefix("");
  }, [map]);
  return null;
}

const DEM_STYLE: L.PathOptions = {
  color: "#fbbf24",
  weight: 2,
  fillColor: "#fde047",
  fillOpacity: 0.1,
  dashArray: "5, 5",
};

const DEM_HOVER_STYLE: L.PathOptions = {
  color: "#fcd34d",
  weight: 3,
  fillOpacity: 0.25,
};

const RESERVOIR_STYLE: L.PathOptions = {
  fillColor: "#0284c7",
  fillOpacity: 0.7,
  color: "#0369a1",
  weight: 2.5,
  dashArray: undefined,
};

const DRAWN_STYLE: L.PathOptions = {
  color: "#22d3ee",
  weight: 2,
  dashArray: "6 4",
  fillColor: "#22d3ee",
  fillOpacity: 0.15,
};

/**
 * DrawBridge — exposes Leaflet.Draw.Polygon imperatively.
 * Lives inside MapContainer because it needs useMap().
 */
function DrawBridge({ onReady }: { onReady: (start: () => void) => void }) {
  const map = useMap();
  useEffect(() => {
    const start = () => {
      const drawer = new (L as any).Draw.Polygon(map, {
        allowIntersection: false,
        showArea: true,
        shapeOptions: DRAWN_STYLE,
      });
      drawer.enable();
    };
    onReady(start);
  }, [map, onReady]);
  return null;
}

/**
 * Pre-renders DEM hotspots & URBAN footprints + manages layer toggles
 * via DIRECT Leaflet API (no React reconciliation while user is drawing).
 */
function StaticOverlays({
  layers,
  onZoneClick,
  zoneRefs,
}: {
  layers: LayerState;
  onZoneClick: (zoneId: string, layer: L.Polygon) => void;
  zoneRefs: React.MutableRefObject<Record<string, L.Polygon | null>>;
}) {
  const map = useMap();

  // DEM zones group (mounted once, visibility toggled imperatively)
  const demGroup = useRef<L.LayerGroup | null>(null);
  // Sentinel water heatmap group
  const waterGroup = useRef<L.LayerGroup | null>(null);
  // SAR urban group
  const sarGroup = useRef<L.LayerGroup | null>(null);

  // Build groups ONCE on mount
  useEffect(() => {
    // DEM
    demGroup.current = L.layerGroup();
    RECOMMENDED_ZONES.forEach((z) => {
      const poly = L.polygon(z.coords, DEM_STYLE);
      poly.bindTooltip("High Potential Elevation Zone (DEM)", {
        direction: "top",
        offset: [0, -8],
        sticky: true,
      });
      poly.on("mouseover", () => {
        if (zoneRefs.current[z.id]?.options.fillColor !== RESERVOIR_STYLE.fillColor) {
          poly.setStyle(DEM_HOVER_STYLE);
        }
      });
      poly.on("mouseout", () => {
        if (zoneRefs.current[z.id]?.options.fillColor !== RESERVOIR_STYLE.fillColor) {
          poly.setStyle(DEM_STYLE);
        }
      });
      poly.on("click", () => onZoneClick(z.id, poly));
      zoneRefs.current[z.id] = poly;
      demGroup.current!.addLayer(poly);
    });

    // Water heatmap (two layers per point: outer glow + core)
    waterGroup.current = L.layerGroup();
    RIVER_HEATMAP.forEach((pt) => {
      const outer = L.circleMarker(pt, {
        radius: 14,
        weight: 0,
        fillColor: "#22d3ee",
        fillOpacity: 0.32,
      });
      const core = L.circleMarker(pt, {
        radius: 5,
        weight: 0,
        fillColor: "#67e8f9",
        fillOpacity: 0.85,
      });
      waterGroup.current!.addLayer(outer);
      waterGroup.current!.addLayer(core);
    });

    // SAR urban
    sarGroup.current = L.layerGroup();
    URBAN_FOOTPRINTS.forEach((u) => {
      const rect = L.rectangle(u.bounds, {
        color: "#ef4444",
        weight: 1.5,
        dashArray: "2 3",
        fillColor: "#ef4444",
        fillOpacity: 0.22,
      });
      rect.bindTooltip(`SAR · ${u.name} · DO NOT flood`, {
        direction: "center",
        sticky: true,
      });
      sarGroup.current!.addLayer(rect);
    });

    return () => {
      demGroup.current?.remove();
      waterGroup.current?.remove();
      sarGroup.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle visibility imperatively — no React tree change
  useEffect(() => {
    if (!demGroup.current) return;
    if (layers.dem) demGroup.current.addTo(map);
    else demGroup.current.remove();
  }, [layers.dem, map]);

  useEffect(() => {
    if (!waterGroup.current) return;
    if (layers.waterEvolution) waterGroup.current.addTo(map);
    else waterGroup.current.remove();
  }, [layers.waterEvolution, map]);

  useEffect(() => {
    if (!sarGroup.current) return;
    if (layers.sarUrban) sarGroup.current.addTo(map);
    else sarGroup.current.remove();
  }, [layers.sarUrban, map]);

  return null;
}

const AquaMapInner = forwardRef<AquaMapHandle, Props>(function AquaMapInner(
  { onPolygonComplete, onOpenLayers, layers },
  ref,
) {
  const fgRef = useRef<L.FeatureGroup | null>(null);
  const startDrawRef = useRef<(() => void) | null>(null);
  const zoneRefs = useRef<Record<string, L.Polygon | null>>({});
  /** The single "active" layer the simulator will mutate. */
  const activeLayerRef = useRef<L.Polygon | null>(null);
  const drawnLayersRef = useRef<L.Polygon[]>([]);

  useImperativeHandle(ref, () => ({
    startDraw: () => startDrawRef.current?.(),
    applyReservoirStyle: () => {
      activeLayerRef.current?.setStyle(RESERVOIR_STYLE);
    },
    reset: () => {
      // Reset DEM zones
      Object.values(zoneRefs.current).forEach((p) => p?.setStyle(DEM_STYLE));
      // Remove drawn shapes
      drawnLayersRef.current.forEach((l) => fgRef.current?.removeLayer(l));
      drawnLayersRef.current = [];
      activeLayerRef.current = null;
    },
  }));

  // Stable handlers — never change identity
  const onZoneClick = useMemo(
    () => (zoneId: string, layer: L.Polygon) => {
      // Reset all DEM zones, highlight clicked one
      Object.entries(zoneRefs.current).forEach(([id, p]) => {
        if (p && id !== zoneId) p.setStyle(DEM_STYLE);
      });
      activeLayerRef.current = layer;
      const latlngs = layer.getLatLngs()[0] as L.LatLng[];
      const area = polygonAreaKm2(latlngs);
      onPolygonComplete({ layer, areaKm2: area, source: "recommended", zoneId });
    },
    [onPolygonComplete],
  );

  return (
    <MapContainer
      center={[48.5, 11.0]}
      zoom={5}
      minZoom={2}
      maxZoom={17}
      zoomControl={false}
      className="h-full w-full z-0"
      worldCopyJump
    >
      <MapTuning />
      <DrawBridge onReady={(s) => (startDrawRef.current = s)} />

      <TileLayer
        attribution='Map data: &copy; OpenStreetMap, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        maxZoom={17}
      />

      <StaticOverlays layers={layers} onZoneClick={onZoneClick} zoneRefs={zoneRefs} />

      <FeatureGroup
        ref={(r) => {
          fgRef.current = r as unknown as L.FeatureGroup;
        }}
      >
        <EditControl
          position="topright"
          onCreated={(e: any) => {
            const layer = e.layer as L.Polygon;
            layer.setStyle(DRAWN_STYLE);
            drawnLayersRef.current.push(layer);
            activeLayerRef.current = layer;
            const latlngs = layer.getLatLngs()[0] as L.LatLng[];
            const area = polygonAreaKm2(latlngs);
            onPolygonComplete({ layer, areaKm2: area, source: "drawn" });
          }}
          draw={{
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false,
            polyline: false,
            polygon: false, // FAB triggers via DrawBridge
          }}
          edit={{ edit: false, remove: false }}
        />
      </FeatureGroup>

      <MapFabsInner
        onOpenLayers={onOpenLayers}
        onStartDraw={() => startDrawRef.current?.()}
      />
    </MapContainer>
  );
});

/**
 * Memoized map. Compares only `layers` field-by-field; handler/ref identity
 * is intentionally ignored to guarantee zero re-renders during draw.
 */
export const AquaMap = memo(AquaMapInner, (prev, next) => {
  return (
    prev.layers.dem === next.layers.dem &&
    prev.layers.waterEvolution === next.layers.waterEvolution &&
    prev.layers.sarUrban === next.layers.sarUrban
  );
});
