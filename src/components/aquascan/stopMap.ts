/**
 * Stops Leaflet from receiving drag / wheel / click events when the user
 * interacts with floating UI panels overlayed on top of the map.
 *
 * Usage: <div {...stopMapPropagation}>...</div>
 */
export const stopMapPropagation = {
  onClick: (e: React.MouseEvent) => e.stopPropagation(),
  onDoubleClick: (e: React.MouseEvent) => e.stopPropagation(),
  onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
  onPointerUp: (e: React.PointerEvent) => e.stopPropagation(),
  onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
  onMouseUp: (e: React.MouseEvent) => e.stopPropagation(),
  onTouchStart: (e: React.TouchEvent) => e.stopPropagation(),
  onTouchEnd: (e: React.TouchEvent) => e.stopPropagation(),
  onWheel: (e: React.WheelEvent) => e.stopPropagation(),
} as const;

/** Tailwind classes for the canonical Liquid Glass panel.
 *  Unified premium obsidian/cyan theme — used by every floating panel. */
export const GLASS =
  "bg-slate-950/75 backdrop-blur-xl border border-white/10 shadow-[0_0_20px_-5px_rgba(34,211,238,0.15),0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl";
