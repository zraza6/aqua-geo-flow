/**
 * Tiny pub/sub for the active map viewport center.
 * Lives outside React so AquaMap memoization stays intact.
 */
type Coord = { lat: number; lng: number; zoom: number };
type Listener = (c: Coord) => void;

let current: Coord = { lat: 48.5, lng: 11.0, zoom: 5 };
const listeners = new Set<Listener>();

export const viewportBus = {
  get: () => current,
  set(c: Coord) {
    current = c;
    listeners.forEach((l) => l(c));
  },
  subscribe(l: Listener) {
    listeners.add(l);
    l(current);
    return () => listeners.delete(l);
  },
};
