import React from 'react';
import { Sparkles, PlusCircle } from 'lucide-react';

export interface Piece {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  color: string;
  material: string;
  formality: string;
}

export interface ColorStrategy {
  rule: string;
  dominant_60: string;
  secondary_30: string;
  accent_10: string;
}

export interface Look {
  lookId: string;
  lookType: 'SAFE & REFINED' | 'MODERN' | 'STATEMENT' | string;
  title?: string;
  subtitle: string;
  pieces: {
    top: Piece | null;
    bottom: Piece | null;
    footwear: Piece | null;
    outerwear: Piece | null;
    accessories?: Piece[];
  };
  stylingExecution?: string;
  stylingAdjustments?: string;
  colorStrategy: ColorStrategy;
  whyItWorks: string;
  gapAnalysis: string[];
}

export const LookCard: React.FC<{ look: Look }> = ({ look }) => {
  const executionText = look.stylingExecution || look.stylingAdjustments;

  return (
    <div className="rounded-2xl border border-emerald-100 dark:border-emerald-950/60 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all duration-200 max-w-2xl">
      {/* Header Badge & Title */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {look.lookType}
          </span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {look.title || look.lookType}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {look.subtitle}
        </p>
      </div>

      {/* Wardrobe Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5">
        {Object.entries(look.pieces).map(([slot, item]) => {
          if (!item || (Array.isArray(item) && item.length === 0)) return null;
          const displayItem = Array.isArray(item) ? item[0] : item;
          if (!displayItem) return null;
          return (
            <div
              key={slot}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
            >
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
                {slot}
              </span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {displayItem.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {displayItem.color} • {displayItem.material}
              </p>
            </div>
          );
        })}
      </div>

      {/* Styling Execution Directive */}
      {executionText && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-0.5">
                Styling Execution
              </h4>
              <p className="text-xs leading-relaxed text-emerald-950 dark:text-emerald-200 font-medium">
                {executionText}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 60-30-10 Color Strategy */}
      <div className="mb-5 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
          60-30-10 Color Strategy
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
              60%
            </span>
            <span className="text-slate-700 dark:text-slate-300 leading-tight">
              {look.colorStrategy.dominant_60}
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
              30%
            </span>
            <span className="text-slate-700 dark:text-slate-300 leading-tight">
              {look.colorStrategy.secondary_30}
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-800/40 shrink-0">
              10%
            </span>
            <span className="text-slate-700 dark:text-slate-300 leading-tight">
              {look.colorStrategy.accent_10}
            </span>
          </div>
        </div>
      </div>

      {/* Rationale / Why It Works */}
      <div className="mb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        <strong className="text-slate-900 dark:text-slate-100 font-semibold block mb-1">
          Why It Works
        </strong>
        {look.whyItWorks}
      </div>

      {/* Gap Analysis Badges */}
      {look.gapAnalysis && look.gapAnalysis.length > 0 && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
            Suggested Wardrobe Additions (Gap Analysis)
          </h4>
          <div className="flex flex-wrap gap-2">
            {look.gapAnalysis.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-200/70 dark:border-amber-800/50"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
