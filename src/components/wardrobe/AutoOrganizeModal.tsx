/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WardrobeAutoOrganizeResult, WardrobeClusterGroup, WardrobeItem } from '../../types';
import { FALLBACK_GARMENT_IMAGE } from '../../utils/imageOptimizer';
import { Button } from '../ui/Button';
import {
  Sparkles,
  Palette,
  Layers,
  CheckCircle2,
  X,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Eye,
  Sliders,
  RotateCcw,
} from 'lucide-react';

interface AutoOrganizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: WardrobeAutoOrganizeResult | null;
  wardrobe: WardrobeItem[];
  onApplyClusterFilter?: (itemIds: string[], clusterName: string) => void;
  onSelectGarment?: (item: WardrobeItem) => void;
}

export function AutoOrganizeModal({
  isOpen,
  onClose,
  result,
  wardrobe,
  onApplyClusterFilter,
  onSelectGarment,
}: AutoOrganizeModalProps) {
  const [activeClusterId, setActiveClusterId] = useState<string | null>(null);

  if (!isOpen || !result) return null;

  const currentCluster = result.clusters.find(c => c.id === activeClusterId) || result.clusters[0];

  // Helper map for fast item lookup
  const wardrobeMap = new Map<string, WardrobeItem>();
  wardrobe.forEach(item => wardrobeMap.set(item.id, item));

  return (
    <div>
      <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto pb-24 lg:pb-6">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 transition-opacity"
        />

        {/* Modal Window */}
        <div
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto flex flex-col max-h-[88vh]"
        >
          {/* Header Banner */}
          <div className="relative bg-slate-950 text-white p-6 sm:p-7 border-b border-slate-800 shrink-0">
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1.5 pr-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Haute Couture Curation
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-emerald-400 font-mono font-semibold">
                    {result.capsuleHarmonyScore}% Capsule Synergy
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-editorial">
                  AI Color & Style Wardrobe Organization
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {result.executiveAestheticSummary}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors shrink-0"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content (Scrollable) */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* 1. Harmony Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <Palette className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Aesthetic Clusters</span>
                </div>
                <div className="text-xl font-bold text-slate-900">
                  {result.clusters.length} Harmonized Groups
                </div>
                <div className="text-[11px] text-slate-500">
                  Organized by tonal palette & silhouette
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Top Style Archetype</span>
                </div>
                <div className="text-xl font-bold text-slate-900">
                  {result.styleDistribution[0]?.styleName || 'Smart Casual'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {result.styleDistribution[0]?.percentage || 45}% of your wardrobe pieces
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dominant Palette</span>
                </div>
                <div className="text-xl font-bold text-slate-900 truncate">
                  {result.paletteBreakdown[0]?.colorName || 'Neutral Slate & Dark'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Seamless inter-outfit layering
                </div>
              </div>
            </div>

            {/* 2. Cluster Selection Tabs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Select Visual Grouping ({result.clusters.length})
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Click a cluster to inspect its pieces
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.clusters.map(cluster => {
                  const isSelected = cluster.id === (activeClusterId || result.clusters[0].id);
                  const itemCount = cluster.itemIds.length;

                  return (
                    <button
                      key={cluster.id}
                      type="button"
                      onClick={() => setActiveClusterId(cluster.id)}
                      className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/20 shadow-md ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                            {cluster.styleVibe}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {itemCount} {itemCount === 1 ? 'Piece' : 'Pieces'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {cluster.name}
                        </h4>
                      </div>

                      {/* Color dots bar */}
                      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 font-mono mr-1">Palette:</span>
                        {cluster.primaryColorPalette.map((color, i) => (
                          <span
                            key={i}
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs inline-block"
                            style={{
                              backgroundColor: color.startsWith('#')
                                ? color
                                : color.toLowerCase() === 'white'
                                ? '#ffffff'
                                : color.toLowerCase() === 'black'
                                ? '#0f172a'
                                : color.toLowerCase() === 'navy'
                                ? '#1e3a8a'
                                : color.toLowerCase() === 'beige'
                                ? '#f5f5dc'
                                : color.toLowerCase() === 'blue'
                                ? '#3b82f6'
                                : '#64748b',
                            }}
                            title={color}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Detailed Active Cluster Inspection */}
            {currentCluster && (
              <div className="bg-slate-50 rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 font-bold">
                      Aesthetic Cluster Focus
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 font-editorial">
                      {currentCluster.name}
                    </h3>
                  </div>

                  {onApplyClusterFilter && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        onApplyClusterFilter(currentCluster.itemIds, currentCluster.name);
                        onClose();
                      }}
                      className="rounded-xl px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Filter Wardrobe to this Group
                    </Button>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {currentCluster.aestheticDescription}
                </p>

                {/* Styling Rule Callout */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 flex items-start gap-3 shadow-2xs">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900">Styling Recommendation: </span>
                    {currentCluster.stylingTip}
                  </div>
                </div>

                {/* Garments in this cluster */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Garments in this Group ({currentCluster.itemIds.length})
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Click piece to inspect tailoring details
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {currentCluster.itemIds.map(id => {
                      const item = wardrobeMap.get(id);
                      if (!item) return null;

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (onSelectGarment) {
                              onSelectGarment(item);
                              onClose();
                            }
                          }}
                          className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-emerald-500/80 transition-all cursor-pointer flex flex-col"
                        >
                          <div className="aspect-[3/4] relative bg-slate-100 overflow-hidden">
                            <img
                              src={item.imageUrl || FALLBACK_GARMENT_IMAGE}
                              alt={item.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = FALLBACK_GARMENT_IMAGE;
                              }}
                            />
                            <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between">
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-white/95 text-slate-900 shadow-2xs">
                                {item.category}
                              </span>
                              {item.color && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-slate-900 text-white shadow-2xs">
                                  {item.color}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="p-2.5">
                            <h5 className="text-xs font-bold text-slate-900 truncate">
                              {item.name}
                            </h5>
                            <p className="text-[10px] text-slate-500 truncate">
                              {item.style || 'Classic'} • {item.fit || 'Regular'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-500 text-center sm:text-left">
              AI has sorted your collection into synchronized aesthetic color and silhouette groupings.
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-xs text-slate-600 rounded-xl"
              >
                Close View
              </Button>
              {onApplyClusterFilter && currentCluster && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onApplyClusterFilter(currentCluster.itemIds, currentCluster.name);
                    onClose();
                  }}
                  className="rounded-xl px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  View "{currentCluster.name}" in Wardrobe
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
