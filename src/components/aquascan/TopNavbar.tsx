import {
  Globe2,
  Bell,
  Radio,
  Activity,
  Satellite,
  Database,
  Waves,
  ShieldAlert,
  Droplets,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GLASS, stopMapPropagation } from "./stopMap";
import { viewportBus } from "./viewportBus";

export function TopNavbar() {
  const [vp, setVp] = useState(viewportBus.get());
  useEffect(() => {
    const unsub = viewportBus.subscribe(setVp);
    return () => {
      unsub();
    };
  }, []);

  const fmt = (n: number) =>
    `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(2)}°`;

  return (
    <div className="pointer-events-auto" {...stopMapPropagation}>
      <TooltipProvider delayDuration={150}>
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

          {/* 1 — API TELEMETRY POPOVER */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="hidden items-center gap-1.5 rounded-xl border border-transparent px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-white/65 transition-colors hover:border-white/10 hover:bg-white/5 hover:text-white md:flex"
                aria-label="API telemetry"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                <span>Sentinel-2 · Live</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={10}
              className="w-72 rounded-2xl border border-white/10 bg-slate-900/85 p-3 text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md"
            >
              <PopoverHeader
                kicker="System"
                title="API Telemetry"
                icon={Satellite}
              />
              <div className="flex flex-col gap-1.5">
                <PingRow
                  icon={Satellite}
                  name="Copernicus CDSE"
                  detail="Sentinel 1 / 2"
                  ms={24}
                />
                <PingRow
                  icon={Database}
                  name="ISRIC SoilGrids"
                  detail="v2.0 · Ksat / pH"
                  ms={42}
                />
                <PingRow
                  icon={Waves}
                  name="CEMS GloFAS / EFAS"
                  detail="Discharge ensemble"
                  ms={18}
                />
              </div>
            </PopoverContent>
          </Popover>

          <span className="hidden h-7 w-px bg-white/10 lg:block" />

          {/* 2 — DYNAMIC COORDS + TOOLTIP */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="hidden cursor-default items-center gap-1.5 rounded-xl border border-transparent px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-white/65 transition-colors hover:border-white/10 hover:bg-white/5 hover:text-white lg:flex"
                aria-label="Active viewport center"
              >
                <Radio className="h-3 w-3 text-cyan-400" />
                <motion.span
                  key={`${vp.lat.toFixed(2)}_${vp.lng.toFixed(2)}`}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="tabular-nums text-white/85"
                >
                  {fmt(vp.lat)} · {fmt(vp.lng)}
                </motion.span>
              </button>
            </TooltipTrigger>
            <TooltipContent
              sideOffset={8}
              className="max-w-[220px] rounded-xl border border-white/10 bg-slate-900/90 px-3 py-2 text-[10.5px] font-light leading-relaxed text-white/85 backdrop-blur-md"
            >
              Active Viewport Center (EPSG:4326). Data dynamically fetched for
              this extent.
            </TooltipContent>
          </Tooltip>

          <span className="hidden h-7 w-px bg-white/10 lg:block" />

          {/* 3 — VIEWPORT ANALYTICS POPOVER */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="hidden items-center gap-1.5 rounded-xl border border-transparent px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-white/65 transition-colors hover:border-white/10 hover:bg-white/5 hover:text-white lg:flex"
                aria-label="Viewport analytics"
              >
                <Activity className="h-3 w-3 text-amber-400" />
                <span>3 DEM · 38 Alerts</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={10}
              className="w-80 rounded-2xl border border-white/10 bg-slate-900/85 p-3 text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md"
            >
              <PopoverHeader
                kicker="Insights"
                title="Viewport Analytics"
                icon={Activity}
              />
              <div className="flex flex-col gap-2">
                <AnalyticRow
                  icon={Activity}
                  tone="amber"
                  metric="3"
                  label="DEM hotspots"
                  body="High-potential dam-candidate valleys identified algorithmically using GLO-30."
                />
                <AnalyticRow
                  icon={ShieldAlert}
                  tone="rose"
                  metric="38"
                  label="Risk anomalies"
                  body="Subsidence (EGMS L3) or drought (GloFAS) events detected in the current view."
                />
              </div>
            </PopoverContent>
          </Popover>

          {/* 4 — NOTIFICATION BELL POPOVER */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="relative flex h-8 w-8 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-cyan-400"
                aria-label="Notifications"
              >
                <Bell className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose-500 [box-shadow:0_0_6px_rgba(244,63,94,0.9)]" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={10}
              className="w-[340px] rounded-2xl border border-white/10 bg-slate-900/85 p-3 text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md"
            >
              <PopoverHeader
                kicker="HeavyWater Engine"
                title="System Alerts"
                icon={Bell}
                trailing="3 new"
              />
              <div className="flex flex-col gap-2">
                <NotifRow
                  icon={ShieldAlert}
                  tone="rose"
                  title="EGMS Warning"
                  body="High subsidence (-3.2 mm/yr) detected in custom AOI."
                  time="2 min ago"
                />
                <NotifRow
                  icon={Droplets}
                  tone="amber"
                  title="GloFAS Alert"
                  body="Low discharge (< 1.2 m³/s) projected for Q3 in selected basin."
                  time="14 min ago"
                />
                <NotifRow
                  icon={FileText}
                  tone="cyan"
                  title="Compliance"
                  body="Water Law 107/1996 pre-feasibility report successfully generated."
                  time="1 h ago"
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </TooltipProvider>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function PopoverHeader({
  kicker,
  title,
  icon: Icon,
  trailing,
}: {
  kicker: string;
  title: string;
  icon: any;
  trailing?: string;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-white/10 pb-2">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10">
          <Icon className="h-3.5 w-3.5 text-cyan-400" />
        </div>
        <div className="flex flex-col leading-tight">
          <p className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-cyan-300">
            {kicker}
          </p>
          <p className="text-[12px] font-semibold text-white">{title}</p>
        </div>
      </div>
      {trailing && (
        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-cyan-300">
          {trailing}
        </span>
      )}
    </div>
  );
}

function PingRow({
  icon: Icon,
  name,
  detail,
  ms,
}: {
  icon: any;
  name: string;
  detail: string;
  ms: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-2.5 py-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-400/25 bg-emerald-400/10">
          <Icon className="h-3.5 w-3.5 text-emerald-300" />
        </div>
        <div className="flex min-w-0 flex-col leading-tight">
          <p className="truncate text-[11px] font-semibold text-white">{name}</p>
          <p className="truncate font-mono text-[9px] uppercase tracking-wider text-white/45">
            {detail}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 [box-shadow:0_0_6px_rgba(52,211,153,0.9)]" />
          Connected
        </span>
        <span className="font-mono text-[10px] font-semibold tabular-nums text-white/80">
          {ms}ms
        </span>
      </div>
    </div>
  );
}

function AnalyticRow({
  icon: Icon,
  tone,
  metric,
  label,
  body,
}: {
  icon: any;
  tone: "amber" | "rose" | "cyan";
  metric: string;
  label: string;
  body: string;
}) {
  const c = {
    amber: "border-amber-400/25 bg-amber-400/10 text-amber-300",
    rose: "border-rose-400/25 bg-rose-400/10 text-rose-300",
    cyan: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
  }[tone];
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${c}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex items-baseline gap-1.5">
          <span
            className={`font-mono text-base font-bold tabular-nums leading-none ${
              tone === "amber"
                ? "text-amber-300"
                : tone === "rose"
                  ? "text-rose-300"
                  : "text-cyan-300"
            }`}
            style={{ textShadow: "0 0 10px currentColor" }}
          >
            {metric}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/55">
            {label}
          </span>
        </div>
        <p className="text-[10.5px] font-light leading-snug text-white/70">
          {body}
        </p>
      </div>
    </div>
  );
}

function NotifRow({
  icon: Icon,
  tone,
  title,
  body,
  time,
}: {
  icon: any;
  tone: "rose" | "amber" | "cyan";
  title: string;
  body: string;
  time: string;
}) {
  const map = {
    rose: {
      box: "border-rose-400/30 bg-rose-400/10",
      icon: "text-rose-300",
      title: "text-rose-200",
    },
    amber: {
      box: "border-amber-400/30 bg-amber-400/10",
      icon: "text-amber-300",
      title: "text-amber-200",
    },
    cyan: {
      box: "border-cyan-400/30 bg-cyan-400/10",
      icon: "text-cyan-300",
      title: "text-cyan-200",
    },
  }[tone];
  return (
    <motion.div
      initial={{ x: 8, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] p-2.5 transition-colors hover:bg-white/[0.06]"
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${map.box}`}
      >
        <Icon className={`h-3.5 w-3.5 ${map.icon}`} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-[11px] font-semibold leading-tight ${map.title}`}>
            {title}
          </p>
          <span className="shrink-0 font-mono text-[8.5px] uppercase tracking-wider text-white/35">
            {time}
          </span>
        </div>
        <p className="text-[10.5px] font-light leading-snug text-white/75">
          {body}
        </p>
      </div>
    </motion.div>
  );
}
