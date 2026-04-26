import { MapContainer, TileLayer, FeatureGroup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw"; // side-effect: registers L.Draw on the global L
import { EditControl } from "react-leaflet-draw";
import { useEffect, useRef } from "react";

// Fix default marker icon paths (avoids 404s when leaflet is bundled)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface DrawnPolygon {
  layer: L.Polygon;
  areaKm2: number;
}

interface Props {
  onPolygonComplete: (p: DrawnPolygon) => void;
  reservoirMode: boolean;
  onResetSignal: number; // increments to clear shapes
}

// Simple spherical area approximation (good enough for demo)
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

export function AquaMap({ onPolygonComplete, reservoirMode, onResetSignal }: Props) {
  const fgRef = useRef<L.FeatureGroup | null>(null);
  const lastLayerRef = useRef<L.Polygon | null>(null);

  // Restyle drawn polygon when reservoir is built
  useEffect(() => {
    if (!lastLayerRef.current) return;
    if (reservoirMode) {
      lastLayerRef.current.setStyle({
        color: "#38bdf8",
        weight: 2,
        fillColor: "#0ea5e9",
        fillOpacity: 0.55,
        dashArray: undefined,
      });
    }
  }, [reservoirMode]);

  // Clear drawn shapes
  useEffect(() => {
    if (onResetSignal > 0 && fgRef.current) {
      fgRef.current.clearLayers();
      lastLayerRef.current = null;
    }
  }, [onResetSignal]);

  return (
    <MapContainer
      center={[37.38, -5.99]}
      zoom={7}
      minZoom={3}
      zoomControl={true}
      className="h-full w-full"
      worldCopyJump
    >
      <MapTuning />
      <TileLayer
        attribution='Tiles &copy; Esri — Source: Esri, Maxar, GeoEye'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        maxZoom={19}
      />
      {/* Optional labels overlay */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        opacity={0.55}
        maxZoom={19}
        attribution=""
      />

      <FeatureGroup ref={(r) => { fgRef.current = r as unknown as L.FeatureGroup; }}>
        <EditControl
          position="topright"
          onCreated={(e: any) => {
            const layer = e.layer as L.Polygon;
            // Style as analysis AOI (cyan dashed)
            layer.setStyle({
              color: "#22d3ee",
              weight: 2,
              dashArray: "6 4",
              fillColor: "#22d3ee",
              fillOpacity: 0.12,
            });
            lastLayerRef.current = layer;
            const latlngs = (layer.getLatLngs()[0] as L.LatLng[]);
            const area = polygonAreaKm2(latlngs);
            onPolygonComplete({ layer, areaKm2: area });
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
                fillOpacity: 0.12,
              },
            },
          }}
          edit={{
            edit: false,
            remove: true,
          }}
        />
      </FeatureGroup>
    </MapContainer>
  );
}
