import type { LayerState } from "./AquaMap";
import { GLASS, stopMapPropagation } from "./stopMap";

export function MapLegend({ layers }: { layers: LayerState }) {
  return (
    <div
      className="absolute bottom-3 left-3 z-[1000] sm:bottom-6 sm:left-6"
      {...stopMapPropagation}
    >
      <div className={`${GLASS} flex flex-col gap-2.5 px-4 py-3 sm:px-5 sm:py-4`}>
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">
          Legend
        </p>
        <div className="flex flex-col gap-2 text-[11px]">
          <Item color="bg-amber-400" label="DEM Hotspots" glow />
          <Item color="bg-cyan-400" label="Sentinel Water" glow active={layers.waterEvolution} />
          <Item color="bg-rose-500" label="SAR Urban" glow active={layers.sarUrban} />
          <Item color="bg-cyan-200" label="Drawn AOI" />
          <Item color="bg-sky-700" label="Modeled Reservoir" />
        </div>
      </div>
    </div>
  );
}

function Item({
  color,
  label,
  glow,
  active = true,
}: {
  color: string;
  label: string;
  glow?: boolean;
  active?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${active ? "" : "opacity-35"}`}>
      <span
        className={`h-2.5 w-2.5 rounded-sm ${color} ${
          glow ? "shadow-[0_0_8px_currentColor]" : ""
        }`}
      />
      <span className="font-light text-white/85">{label}</span>
    </div>
  );
}
