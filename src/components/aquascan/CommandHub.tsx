import { LayoutDashboard, Layers, TestTubes, Settings, Globe2 } from "lucide-react";
import { stopMapPropagation, GLASS } from "./stopMap";

export type CommandTab = "dashboard" | "layers" | "scenarios" | "settings";

interface Props {
  active: CommandTab;
  onChange: (t: CommandTab) => void;
}

const items: { id: CommandTab; icon: any; label: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "layers", icon: Layers, label: "Satellite Layers" },
  { id: "scenarios", icon: TestTubes, label: "Scenarios" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export function CommandHub({ active, onChange }: Props) {
  return (
    <nav
      className={`${GLASS} pointer-events-auto flex flex-col items-center gap-2 p-3`}
      {...stopMapPropagation}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-[0_0_20px_rgba(34,211,238,0.55)]">
        <Globe2 className="h-5 w-5 text-slate-950" strokeWidth={2.5} />
      </div>
      <div className="my-1 h-px w-8 bg-white/10" />
      <div className="flex flex-col items-center gap-1.5">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.id;
          return (
            <button
              key={it.id}
              onClick={() =>
                onChange(isActive && it.id !== "dashboard" ? "dashboard" : it.id)
              }
              title={it.label}
              aria-label={it.label}
              className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 ${
                isActive
                  ? "bg-cyan-400/15 text-cyan-300 [box-shadow:inset_0_0_0_1px_rgba(34,211,238,0.5),0_0_18px_rgba(34,211,238,0.25)]"
                  : "text-white/65 hover:bg-white/10 hover:text-white"
              }`}
            >
              {isActive && (
                <span className="absolute -left-3 h-6 w-1 rounded-r-full bg-cyan-400 [box-shadow:0_0_10px_rgba(34,211,238,0.8)]" />
              )}
              <Icon className="h-5 w-5" strokeWidth={1.75} />
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-xl border border-white/10 bg-slate-900/80 px-2.5 py-1 text-[10px] font-medium text-white/90 opacity-0 backdrop-blur-xl transition-opacity group-hover:opacity-100">
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
