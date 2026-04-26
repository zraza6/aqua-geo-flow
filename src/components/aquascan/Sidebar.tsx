import { LayoutDashboard, Layers, FlaskConical, Settings, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SidebarTab = "dashboard" | "layers" | "scenarios";

interface Props {
  active: SidebarTab;
  onChange: (t: SidebarTab) => void;
}

const items: { id: SidebarTab; icon: any; label: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "layers", icon: Layers, label: "Layers" },
  { id: "scenarios", icon: FlaskConical, label: "Scenarios" },
];

export function Sidebar({ active, onChange }: Props) {
  return (
    <aside className="flex w-16 flex-col items-center gap-2 rounded-3xl border border-white/10 bg-black/30 p-3 shadow-2xl backdrop-blur-2xl">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-cyan shadow-glow-cyan">
        <Globe2 className="h-5 w-5 text-primary-foreground" strokeWidth={2} />
      </div>
      <div className="my-1 h-px w-8 bg-white/10" />
      <nav className="flex flex-col items-center gap-2">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onChange(it.id)}
              title={it.label}
              className={cn(
                "group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200",
                isActive
                  ? "bg-primary/20 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.5)]"
                  : "text-foreground/60 hover:bg-white/10 hover:text-foreground"
              )}
            >
              {isActive && (
                <span className="absolute -left-3 h-6 w-1 rounded-r-full bg-primary shadow-glow-cyan" />
              )}
              <Icon className="h-5 w-5" strokeWidth={1.75} />
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 text-[11px] text-foreground/90 opacity-0 backdrop-blur-xl transition-opacity group-hover:opacity-100">
                {it.label}
              </span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col items-center gap-2">
        <div className="my-1 h-px w-8 bg-white/10" />
        <button
          title="Settings"
          className="flex h-11 w-11 items-center justify-center rounded-2xl text-foreground/50 transition-colors hover:bg-white/10 hover:text-foreground"
        >
          <Settings className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>
    </aside>
  );
}
