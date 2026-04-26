import L from "leaflet";

/**
 * Leaflet-Draw 1.0.4 ships a buggy `readableArea` that references an undeclared
 * global `type` variable, causing "ReferenceError: type is not defined" while
 * the user moves the mouse during polygon drawing. We patch the prototype with
 * a safe implementation that never throws.
 *
 * Must be imported once, after `leaflet-draw`.
 */
export function patchLeafletDraw() {
  const GeometryUtil = (L as any).GeometryUtil;
  if (!GeometryUtil) return;

  GeometryUtil.readableArea = function (
    area: number,
    isMetric: boolean | string[] = true,
    precision?: Record<string, number>,
  ) {
    const p = { km: 2, ha: 2, m: 0, mi: 2, ac: 2, yd: 0, ft: 0, ...(precision || {}) };
    const round = (v: number, d: number) =>
      Math.round(v * Math.pow(10, d)) / Math.pow(10, d);

    if (isMetric) {
      const units = Array.isArray(isMetric) ? isMetric : ["km", "ha", "m"];
      if (area >= 1_000_000 && units.indexOf("km") !== -1) {
        return `${round(area * 1e-6, p.km)} km²`;
      }
      if (area >= 10_000 && units.indexOf("ha") !== -1) {
        return `${round(area * 1e-4, p.ha)} ha`;
      }
      return `${round(area, p.m)} m²`;
    }

    const sqYards = area / 0.836127;
    if (sqYards >= 3_097_600) return `${round(sqYards / 3_097_600, p.mi)} mi²`;
    if (sqYards >= 4840) return `${round(sqYards / 4840, p.ac)} ac`;
    return `${round(sqYards, p.yd)} yd²`;
  };
}
