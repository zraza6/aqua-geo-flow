import { Home, Satellite, Building2, Layers, Activity, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const items = [
  { id: "home", icon: Home, label: "Command Home" },
  { id: "sat", icon: Satellite, label: "Satellite Data" },
  { id: "infra", icon: Building2, label: "Infrastructure" },
  { id: "layers", icon: Layers, label: "Map Layers" },
  { id: "activity", icon: Activity, label: "Live Activity" },
];

export function Sidebar() {
  const [active, setActive] = useState("home");
  return (
    <aside className="z-30 flex h-full w-16 flex-col items-center border-r border-border/60 bg-surface/80 backdrop-blur-xl py-3">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-cyan shadow-glow-cyan">
        <span className="font-mono text-sm font-bold text-primary-foreground">AQ</span>
      </div>
      <nav className="flex flex-1 flex-col items-center gap-1.5">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setActive(it.id)}
              title={it.label}
              className={cn(
                "group relative flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.4)]"
                  : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
              )}
            >
              {isActive && (
                <span className="absolute left-0 h-6 w-0.5 rounded-r bg-primary shadow-glow-cyan" />
              )}
              <Icon className="h-5 w-5" strokeWidth={1.75} />
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs opacity-0 shadow-panel transition-opacity group-hover:opacity-100">
                {it.label}
              </span>
            </button>
          );
        })}
      </nav>
      <button
        title="Settings"
        className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
      >
        <Settings className="h-5 w-5" strokeWidth={1.75} />
      </button>
    </aside>
  );
}
