import { Layers, Compass, FlaskConical, Activity } from "lucide-react";
import { GLASS, stopMapPropagation } from "./stopMap";

interface Props {
  onOpenLayers: () => void;
  onOpenDashboard: () => void;
  onOpenScenarios: () => void;
}

/** Bottom navbar for small screens. */
export function MobileNav({ onOpenLayers, onOpenDashboard, onOpenScenarios }: Props) {
  return (
    <div
      className="absolute bottom-3 left-1/2 z-[1000] -translate-x-1/2 sm:hidden"
      {...stopMapPropagation}
    >
      <div className={`${GLASS} flex items-center gap-1 px-2 py-1.5`}>
        <NavBtn icon={Activity} label="Dashboard" onClick={onOpenDashboard} />
        <NavBtn icon={Layers} label="Layers" onClick={onOpenLayers} accent />
        <NavBtn icon={FlaskConical} label="Scenarios" onClick={onOpenScenarios} />
        <NavBtn icon={Compass} label="Map" onClick={() => {}} />
      </div>
    </div>
  );
}

function NavBtn({
  icon: Icon,
  label,
  onClick,
  accent,
}: {
  icon: any;
  label: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 rounded-2xl px-3.5 py-2 transition-colors ${
        accent
          ? "text-cyan-400"
          : "text-white/65 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      <span className="text-[9px] font-medium uppercase tracking-wider">
        {label}
      </span>
    </button>
  );
}
