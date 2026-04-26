import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Waves, Radar, Mountain } from "lucide-react";
import type { LayerState } from "./AquaMap";
import { stopMapPropagation } from "./stopMap";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  layers: LayerState;
  onToggle: (k: keyof LayerState) => void;
}

export function LayersDialog({ open, onOpenChange, layers, onToggle }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="z-[1300] max-w-md border-white/10 bg-slate-900/70 p-0 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        {...stopMapPropagation}
      >
        <DialogHeader className="px-6 pt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400 [text-shadow:0_0_10px_rgba(34,211,238,0.6)]">
            Earth Observation
          </p>
          <DialogTitle className="text-lg font-semibold text-white">
            Satellite Layers
          </DialogTitle>
          <DialogDescription className="text-[12px] font-light leading-relaxed text-white/55">
            Toggle remote-sensing overlays. Each layer is mocked from real data
            sources (Sentinel-1/3, Copernicus DEM).
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 px-6 pb-6 pt-2">
          <ToggleRow
            icon={Waves}
            tone="cyan"
            title="Sentinel-3 Water Evolution"
            sub="Mock NDWI heatmap dots along major rivers."
            checked={layers.waterEvolution}
            onChange={() => onToggle("waterEvolution")}
          />
          <ToggleRow
            icon={Radar}
            tone="rose"
            title="SAR Urban Footprint"
            sub="Sentinel-1 backscatter — DO NOT flood zones."
            checked={layers.sarUrban}
            onChange={() => onToggle("sarUrban")}
          />
          <ToggleRow
            icon={Mountain}
            tone="amber"
            title="DEM Hotspots"
            sub="High-potential elevation zones (always on)."
            checked={layers.dem}
            onChange={() => onToggle("dem")}
          />

          <p className="mt-2 px-1 font-mono text-[9px] uppercase tracking-wider text-white/35">
            Source: Copernicus Open Access Hub · ESA · 2024
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  sub,
  checked,
  onChange,
  tone,
}: {
  icon: any;
  title: string;
  sub: string;
  checked: boolean;
  onChange: () => void;
  tone: "cyan" | "rose" | "amber";
}) {
  const c = {
    cyan: "text-cyan-400",
    rose: "text-rose-400",
    amber: "text-amber-400",
  }[tone];
  const bg = {
    cyan: "bg-cyan-400/10 border-cyan-400/20",
    rose: "bg-rose-400/10 border-rose-400/20",
    amber: "bg-amber-400/10 border-amber-400/20",
  }[tone];
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.06]">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border ${bg}`}
      >
        <Icon className={`h-4 w-4 ${c}`} />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-[13px] font-semibold leading-tight text-white">
          {title}
        </p>
        <p className="text-[11px] font-light leading-relaxed text-white/55">
          {sub}
        </p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} className="mt-1" />
    </label>
  );
}
