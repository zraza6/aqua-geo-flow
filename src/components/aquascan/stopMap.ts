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

/** Tailwind classes for the canonical Liquid Glass panel. */
export const GLASS =
  "bg-slate-900/70 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-2xl";
