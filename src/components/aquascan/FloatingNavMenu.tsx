import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUp } from "lucide-react";

const ITEMS: { id: string; label: string; top?: boolean }[] = [
  { id: "__top", label: "Sus la pagina principală", top: true },
  { id: "introducere", label: "Introducere" },
  { id: "date-algoritmi", label: "Date și Algoritmi" },
  { id: "arhitectura", label: "Arhitectura Produsului" },
  { id: "scaling", label: "Scaling & Future Capabilities" },
  { id: "business", label: "Business" },
  { id: "bibliografie", label: "Bibliografie" },
];

export function FloatingNavMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    if (id === "__top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1200] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="w-64 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/85 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          >
            <ul className="flex flex-col py-2">
              {ITEMS.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => go(item.id)}
                    className="group flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] font-light text-white/75 transition-colors hover:bg-cyan-400/10 hover:text-cyan-300"
                  >
                    {item.top && (
                      <ArrowUp className="h-3.5 w-3.5 text-cyan-400/80" />
                    )}
                    <span className={item.top ? "" : "ml-[26px]"}>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/40 bg-slate-950/80 text-cyan-300 backdrop-blur-md transition-all hover:border-cyan-400 hover:bg-cyan-400/15 hover:scale-105 [box-shadow:0_8px_32px_rgba(0,0,0,0.5),0_0_22px_-4px_rgba(34,211,238,0.55)]"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Menu className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
