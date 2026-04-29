import { stopMapPropagation } from "./stopMap";

const ITEMS: { id: string; label: string }[] = [
  { id: "introducere", label: "Introducere" },
  { id: "date-utilizate", label: "Date utilizate" },
  { id: "algoritmi", label: "Algoritmi" },
  { id: "business-finante", label: "Business & Finanțe" },
  { id: "produs", label: "Produs" },
  { id: "roadmap", label: "Roadmap" },
  { id: "economics", label: "Economics" },
];

export function SubNavPill() {
  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      {...stopMapPropagation}
      className="pointer-events-auto flex max-w-[95vw] items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-black/40 px-2 py-1.5 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.45)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Section navigation"
    >
      {ITEMS.map((item, i) => (
        <div key={item.id} className="flex items-center">
          {i > 0 && (
            <span className="px-1 text-white/25 select-none" aria-hidden="true">
              ·
            </span>
          )}
          <button
            onClick={() => handleClick(item.id)}
            className="whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/70 transition-all hover:bg-cyan-400/10 hover:text-cyan-300"
          >
            {item.label}
          </button>
        </div>
      ))}
    </nav>
  );
}
