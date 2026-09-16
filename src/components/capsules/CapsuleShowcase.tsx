// src/components/capsules/CapsuleShowcase.tsx
import React from 'react';
import { CapsuleGroup } from '../../services/capsuleEngine';
import { Sparkles, Layers, ShieldCheck } from 'lucide-react';

export interface CapsuleShowcaseProps {
  capsules: CapsuleGroup[];
  onSelectCapsule?: (capsuleId: string) => void;
}

export const CapsuleShowcase: React.FC<CapsuleShowcaseProps> = ({
  capsules,
  onSelectCapsule,
}) => {
  if (!capsules.length) {
    return (
      <div className="p-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-900/30">
        <Layers className="w-8 h-8 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          No automated capsules available yet.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Add at least 3 garments to activate auto-clustering.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Automated Capsule Collections
          </h2>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          60-30-10 Color Stratified
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {capsules.map((capsule) => (
          <div
            key={capsule.id}
            onClick={() => onSelectCapsule?.(capsule.id)}
            className="group relative p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            {/* Header Meta */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-0.5">
                  {capsule.aesthetic}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {capsule.title}
                </h3>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                {capsule.harmonyScore}% Score
              </div>
            </div>

            {/* 60-30-10 Proportion Visualizer */}
            <div className="space-y-1.5 mb-5">
              <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span>Color Ratio</span>
                <span className="font-mono text-[10px]">60% / 30% / 10%</span>
              </div>
              <div className="h-2.5 w-full rounded-full overflow-hidden flex gap-0.5 p-0.5 bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-l-full bg-slate-800 dark:bg-slate-200 w-[60%]" title={`Dominant: ${capsule.dominantColor}`} />
                <div className="h-full bg-slate-400 dark:bg-slate-500 w-[30%]" title={`Secondary: ${capsule.secondaryColor}`} />
                <div className="h-full rounded-r-full bg-emerald-500 w-[10%]" title={`Accent: ${capsule.accentColor}`} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="truncate max-w-[80px]">{capsule.dominantColor}</span>
                <span className="truncate max-w-[80px] text-center">{capsule.secondaryColor}</span>
                <span className="truncate max-w-[80px] text-right font-bold text-emerald-600 dark:text-emerald-400">{capsule.accentColor}</span>
              </div>
            </div>

            {/* Garment Preview Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <span className="font-medium">{capsule.items.length} Curated Items</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                Explore Capsule &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
