import React, { useState, useEffect } from "react";
import { ShieldCheck, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";

export function SafeModeScreen() {
  const [mountTime, setMountTime] = useState<string>("");

  useEffect(() => {
    setMountTime(new Date().toISOString());
  }, []);

  const handleReturnToNormal = () => {
    // Strip safe=1 from URL search and hash
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("safe");
      // also handle if hash contains ?safe=1
      let cleanHash = url.hash.replace(/[?&]safe=[^&]*/, "");
      if (cleanHash === "#" || cleanHash === "#/") cleanHash = "";
      window.location.href = url.origin + url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : "") + cleanHash;
    } catch {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-emerald-500/30">
      <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        {/* Brand & Badge */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-serif">
            PN Outfit Suggester
          </h1>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Safe Mode Active (?safe=1)
          </span>
        </div>

        {/* Informational Body */}
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed text-left bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <p className="font-semibold text-slate-200">
            Minimal Recovery Environment:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-400">
            <li>Heavy background filters and blurs bypassed</li>
            <li>External AI stylist &amp; weather API calls disabled</li>
            <li>Wardrobe database queries suspended</li>
            <li>React virtual DOM mounted cleanly</li>
          </ul>
        </div>

        {/* Diagnostic Status Box */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> React Mount
            </span>
            <span className="text-[11px] uppercase tracking-wider">SUCCESS (200 OK)</span>
          </div>
          <div className="text-slate-400 text-[11px] truncate">
            <span className="text-slate-500">Route:</span> {typeof window !== "undefined" ? window.location.pathname + window.location.search : "/"}
          </div>
          {mountTime && (
            <div className="text-slate-400 text-[11px] truncate">
              <span className="text-slate-500">Mounted:</span> {mountTime}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleReturnToNormal}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <span>Return to Normal App</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>
        </div>
      </div>
    </div>
  );
}
