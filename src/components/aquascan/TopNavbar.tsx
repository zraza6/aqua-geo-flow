import { Globe2, Bell, Radio, Activity } from "lucide-react";
import { GLASS, stopMapPropagation } from "./stopMap";

export function TopNavbar() {
  return (
    <div
      className="absolute left-1/2 top-3 z-[1000] -translate-x-1/2 px-3 sm:top-4"
      {...stopMapPropagation}
    >
      <div
        className={`${GLASS} flex items-center gap-3 px-4 py-2.5 sm:gap-5 sm:px-6 sm:py-3`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-[0_0_18px_rgba(34,211,238,0.55)]">
            <Globe2 className="h-4 w-4 text-slate-950" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-tight">
            <h1 className="text-[12px] font-bold tracking-wide text-white sm:text-[13px]">
              AquaScan{" "}
              <span className="font-mono font-semibold text-cyan-400 [text-shadow:0_0_10px_rgba(34,211,238,0.7)]">
                Pro
              </span>
            </h1>
            <p className="hidden font-mono text-[9px] uppercase tracking-[0.22em] text-white/45 sm:block">
              European Hydro-Intelligence Center
            </p>
          </div>
        </div>

        <span className="hidden h-7 w-px bg-white/10 md:block" />

        <div className="hidden items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-white/55 md:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <span>Sentinel-2 · Live</span>
        </div>

        <span className="hidden h-7 w-px bg-white/10 lg:block" />

        <div className="hidden items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-white/55 lg:flex">
          <Radio className="h-3 w-3 text-cyan-400" />
          <span>37.55° · −4.20°</span>
        </div>

        <span className="hidden h-7 w-px bg-white/10 lg:block" />

        <div className="hidden items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-white/55 lg:flex">
          <Activity className="h-3 w-3 text-amber-400" />
          <span>3 DEM · 38 alerts</span>
        </div>

        <button className="relative flex h-8 w-8 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition-colors hover:text-cyan-400">
          <Bell className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose-500 [box-shadow:0_0_6px_rgba(244,63,94,0.9)]" />
        </button>
      </div>
    </div>
  );
}
