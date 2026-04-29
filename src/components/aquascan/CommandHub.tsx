import { LayoutDashboard, Layers } from "lucide-react";
import { stopMapPropagation, GLASS } from "./stopMap";

export type CommandTab = "dashboard" | "layers";

interface Props {
  active: CommandTab;
  onChange: (t: CommandTab) => void;
}

const items: { id: CommandTab; icon: any; label: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "layers", icon: Layers, label: "Satellite Layers" },
];

export function CommandHub({ active, onChange }: Props) {
  return (
    <nav
      className={`${GLASS} pointer-events-auto flex flex-col items-center gap-1.5 p-2`}
      {...stopMapPropagation}
    >
      <div className="flex flex-col items-center gap-1">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onChange(it.id)}
              title={it.label}
              aria-label={it.label}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-cyan-400/15 text-cyan-300 [box-shadow:inset_0_0_0_1px_rgba(34,211,238,0.5),0_0_18px_rgba(34,211,238,0.25)]"
                  : "text-white/65 hover:bg-white/10 hover:text-white"
              }`}
            >
              {isActive && (
                <span className="absolute -left-2.5 h-5 w-1 rounded-r-full bg-cyan-400 [box-shadow:0_0_10px_rgba(34,211,238,0.8)]" />
              )}
              <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg border border-white/10 bg-slate-900/80 px-2 py-1 text-[10px] font-medium text-white/90 opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
