import { AnimatePresence, motion } from "framer-motion";
import type { LayerState } from "./AquaMap";
import { GLASS, stopMapPropagation } from "./stopMap";

type LegendItem = {
  id: string;
  color: string;
  label: string;
  glow?: boolean;
};

export function MapLegend({ layers }: { layers: LayerState }) {
  // Always-on baseline items + conditionally rendered toggleable items
  const items: LegendItem[] = [
    { id: "dem", color: "bg-amber-400", label: "DEM Hotspots", glow: true },
    ...(layers.waterEvolution
      ? [{ id: "water", color: "bg-cyan-400", label: "Sentinel Water", glow: true } as LegendItem]
      : []),
    ...(layers.sarUrban
      ? [{ id: "sar", color: "bg-rose-500", label: "SAR Urban", glow: true } as LegendItem]
      : []),
    { id: "aoi", color: "bg-cyan-200", label: "Drawn AOI" },
    { id: "reservoir", color: "bg-sky-700", label: "Modeled Reservoir" },
  ];

  return (
    <div className="pointer-events-auto" {...stopMapPropagation}>
      <motion.div
        layout
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className={`${GLASS} flex h-auto flex-col gap-2.5 px-4 py-3 sm:px-5 sm:py-4`}
      >
        <motion.p
          layout="position"
          className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/45"
        >
          Legend
        </motion.p>
        <motion.div layout className="flex flex-col gap-2 text-[11px]">
          <AnimatePresence initial={false} mode="popLayout">
            {items.map((it) => (
              <motion.div
                key={it.id}
                layout
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`h-2.5 w-2.5 rounded-sm ${it.color} ${
                      it.glow ? "shadow-[0_0_8px_currentColor]" : ""
                    }`}
                  />
                  <span className="font-light text-white/85">{it.label}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
