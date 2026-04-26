import { MapContainer, TileLayer, FeatureGroup, useMap, Polygon, Rectangle, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw"; // side-effect: registers L.Draw on the global L
import { EditControl } from "react-leaflet-draw";
import { useEffect, useMemo, useRef } from "react";

// Fix default marker icon paths
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
}

interface Props {
  onPolygonComplete: (p: DrawnPolygon) => void;
  reservoirMode: boolean;
  reservoirTargetId: string | null;
  onResetSignal: number;
  layers: LayerState;
}

// --- Mock geo data --------------------------------------------------
// Recommended zones (DEM-derived) — Andalusia region
export const RECOMMENDED_ZONES: { id: string; name: string; coords: [number, number][] }[] = [
  {
    id: "zone-1",
    name: "Sierra de Cazorla Valley",
    coords: [
      [37.92, -2.95], [37.96, -2.86], [37.92, -2.78], [37.85, -2.80], [37.83, -2.90],
    ],
  },
  {
    id: "zone-2",
    name: "Alto Guadalquivir Gorge",
    coords: [
      [37.55, -3.55], [37.60, -3.45], [37.55, -3.36], [37.48, -3.40], [37.47, -3.52],
    ],
  },
  {
    id: "zone-3",
    name: "Sierra Nevada Foothills",
    coords: [
      [37.18, -3.20], [37.22, -3.10], [37.16, -3.02], [37.10, -3.08], [37.11, -3.18],
    ],
  },
];

// Mock river paths for water-evolution heatmap dots
const RIVER_HEATMAP: [number, number][] = [
  [37.38, -5.99], [37.40, -5.85], [37.45, -5.65], [37.48, -5.40], [37.52, -5.15],
  [37.58, -4.85], [37.62, -4.55], [37.65, -4.25], [37.68, -3.95], [37.70, -3.65],
  [37.72, -3.35], [37.55, -3.50], [37.40, -3.65], [37.30, -3.80], [37.20, -3.90],
  [37.92, -2.88], [37.85, -2.78], [37.50, -3.45], [37.15, -3.10], [37.05, -3.20],
];

// Mock urban / SAR footprints
const URBAN_FOOTPRINTS: { name: string; bounds: [[number, number], [number, number]] }[] = [
  { name: "Sevilla", bounds: [[37.32, -6.05], [37.44, -5.92]] },
  { name: "Córdoba", bounds: [[37.85, -4.83], [37.92, -4.72]] },
  { name: "Granada", bounds: [[37.15, -3.65], [37.22, -3.55]] },
  { name: "Málaga", bounds: [[36.68, -4.50], [36.75, -4.38]] },
  { name: "Jaén", bounds: [[37.74, -3.82], [37.80, -3.74]] },
];

function polygonAreaKm2(latlngs: L.LatLng[]): number {
  if (latlngs.length < 3) return 0;
  const R = 6378137;
  let total = 0;
  for (let i = 0; i < latlngs.length; i++) {
    const p1 = latlngs[i];
    const p2 = latlngs[(i + 1) % latlngs.length];
    total += ((p2.lng - p1.lng) * Math.PI / 180) *
             (2 + Math.sin(p1.lat * Math.PI / 180) + Math.sin(p2.lat * Math.PI / 180));
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

export function AquaMap({
  onPolygonComplete,
  reservoirMode,
  reservoirTargetId,
  onResetSignal,
  layers,
}: Props) {
  const fgRef = useRef<L.FeatureGroup | null>(null);
  const lastLayerRef = useRef<L.Polygon | null>(null);
  const recommendedRefs = useRef<Record<string, L.Polygon | null>>({});

  // Restyle drawn polygon when reservoir built
  useEffect(() => {
    if (!reservoirMode) return;
    const target =
      (reservoirTargetId && recommendedRefs.current[reservoirTargetId]) ||
      lastLayerRef.current;
    if (target) {
      target.setStyle({
        color: "#38bdf8",
        weight: 2,
        fillColor: "#0c4a6e",
        fillOpacity: 0.7,
        dashArray: undefined,
      });
    }
  }, [reservoirMode, reservoirTargetId]);

  useEffect(() => {
    if (onResetSignal > 0 && fgRef.current) {
      fgRef.current.clearLayers();
      lastLayerRef.current = null;
      // Reset recommended zone styles
      Object.values(recommendedRefs.current).forEach((p) => {
        p?.setStyle(recommendedStyle);
      });
    }
  }, [onResetSignal]);

  const recommendedStyle = useMemo<L.PathOptions>(() => ({
    color: "#fbbf24",
    weight: 2.5,
    dashArray: "4 4",
    fillColor: "#fde047",
    fillOpacity: 0.18,
  }), []);

  return (
    <MapContainer
      center={[37.55, -4.2]}
      zoom={7}
      minZoom={3}
      zoomControl={true}
      className="h-full w-full z-0"
      worldCopyJump
    >
      <MapTuning />

      {/* Topographic base — reveals rivers + elevation contours */}
      <TileLayer
        attribution='Map data: &copy; OpenStreetMap, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        maxZoom={17}
      />

      {/* Recommended Zones (always visible, styled gold) */}
      {RECOMMENDED_ZONES.map((z) => {
        const isReservoir = reservoirMode && reservoirTargetId === z.id;
        return (
          <Polygon
            key={z.id}
            positions={z.coords}
            ref={(r) => { recommendedRefs.current[z.id] = r as unknown as L.Polygon | null; }}
            pathOptions={
              isReservoir
                ? { color: "#38bdf8", weight: 2, fillColor: "#0c4a6e", fillOpacity: 0.7 }
                : recommendedStyle
            }
            eventHandlers={{
              click: (e) => {
                const layer = e.target as L.Polygon;
                const latlngs = layer.getLatLngs()[0] as L.LatLng[];
                const area = polygonAreaKm2(latlngs);
                onPolygonComplete({ layer, areaKm2: area, source: "recommended", zoneId: z.id });
              },
              mouseover: (e) => {
                const l = e.target as L.Polygon;
                if (!(reservoirMode && reservoirTargetId === z.id)) {
                  l.setStyle({ fillOpacity: 0.32, weight: 3 });
                }
              },
              mouseout: (e) => {
                const l = e.target as L.Polygon;
                if (!(reservoirMode && reservoirTargetId === z.id)) {
                  l.setStyle(recommendedStyle);
                }
              },
            }}
          />
        );
      })}

      {/* Sentinel Water Evolution — blue heatmap dots along rivers */}
      {layers.waterEvolution &&
        RIVER_HEATMAP.map((pt, i) => (
          <CircleMarker
            key={`w-${i}`}
            center={pt}
            radius={14}
            pathOptions={{
              color: "#22d3ee",
              weight: 0,
              fillColor: "#22d3ee",
              fillOpacity: 0.35,
            }}
          />
        ))}
      {layers.waterEvolution &&
        RIVER_HEATMAP.map((pt, i) => (
          <CircleMarker
            key={`wc-${i}`}
            center={pt}
            radius={5}
            pathOptions={{
              color: "#67e8f9",
              weight: 0,
              fillColor: "#67e8f9",
              fillOpacity: 0.85,
            }}
          />
        ))}

      {/* SAR Urban Footprint — red grid rectangles (do NOT flood) */}
      {layers.sarUrban &&
        URBAN_FOOTPRINTS.map((u) => (
          <Rectangle
            key={u.name}
            bounds={u.bounds}
            pathOptions={{
              color: "#ef4444",
              weight: 1.5,
              dashArray: "2 3",
              fillColor: "#ef4444",
              fillOpacity: 0.22,
            }}
          />
        ))}

      <FeatureGroup ref={(r) => { fgRef.current = r as unknown as L.FeatureGroup; }}>
        <EditControl
          position="topright"
          onCreated={(e: any) => {
            const layer = e.layer as L.Polygon;
            layer.setStyle({
              color: "#22d3ee",
              weight: 2,
              dashArray: "6 4",
              fillColor: "#22d3ee",
              fillOpacity: 0.15,
            });
            lastLayerRef.current = layer;
            const latlngs = (layer.getLatLngs()[0] as L.LatLng[]);
            const area = polygonAreaKm2(latlngs);
            onPolygonComplete({ layer, areaKm2: area, source: "drawn" });
          }}
          draw={{
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false,
            polyline: false,
            polygon: {
              allowIntersection: false,
              showArea: true,
              shapeOptions: {
                color: "#22d3ee",
                weight: 2,
                dashArray: "6 4",
                fillColor: "#22d3ee",
                fillOpacity: 0.15,
              },
            },
          }}
          edit={{ edit: false, remove: true }}
        />
      </FeatureGroup>
    </MapContainer>
  );
}
