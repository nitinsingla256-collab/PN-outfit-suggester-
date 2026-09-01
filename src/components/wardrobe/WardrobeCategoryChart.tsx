/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { ClothingCategory, WardrobeItem } from '../../types';
import {
  PieChart as PieChartIcon,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Filter,
  CheckCircle2,
  TrendingUp,
  Shirt,
} from 'lucide-react';

interface WardrobeCategoryChartProps {
  wardrobe: WardrobeItem[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  className?: string;
}

interface CategoryDataPoint {
  name: ClothingCategory | string;
  displayName: string;
  value: number;
  percentage: number;
  color: string;
  hoverColor: string;
  items: WardrobeItem[];
  totalWears: number;
}

const CATEGORY_COLOR_PALETTE: Record<string, { color: string; hoverColor: string; label: string }> = {
  Tops: { color: '#059669', hoverColor: '#10B981', label: 'Tops & Shirts' },
  Bottoms: { color: '#2563EB', hoverColor: '#3B82F6', label: 'Trousers & Pants' },
  Outerwear: { color: '#D97706', hoverColor: '#F59E0B', label: 'Coats & Jackets' },
  Dresses: { color: '#0D9488', hoverColor: '#14B8A6', label: 'Dresses & Sets' },
  Footwear: { color: '#7C3AED', hoverColor: '#8B5CF6', label: 'Shoes & Boots' },
  Bags: { color: '#DB2777', hoverColor: '#EC4899', label: 'Bags & Carryalls' },
  Accessories: { color: '#CA8A04', hoverColor: '#EAB308', label: 'Accessories' },
  Jewelry: { color: '#E11D48', hoverColor: '#F43F5E', label: 'Jewelry' },
  Activewear: { color: '#0284C7', hoverColor: '#0EA5E9', label: 'Activewear' },
  Formalwear: { color: '#475569', hoverColor: '#64748B', label: 'Formalwear' },
};

const DEFAULT_COLOR = { color: '#64748B', hoverColor: '#94A3B8', label: 'Other Pieces' };

export function WardrobeCategoryChart({
  wardrobe,
  selectedCategory,
  onSelectCategory,
  className = '',
}: WardrobeCategoryChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Compute category breakdown data
  const chartData = useMemo<CategoryDataPoint[]>(() => {
    if (!wardrobe || wardrobe.length === 0) return [];

    const categoryMap = new Map<string, { count: number; items: WardrobeItem[]; totalWears: number }>();

    wardrobe.forEach(item => {
      const cat = item.category || 'Other';
      const current = categoryMap.get(cat) || { count: 0, items: [], totalWears: 0 };
      current.count += 1;
      current.items.push(item);
      current.totalWears += item.timesWorn || 0;
      categoryMap.set(cat, current);
    });

    const totalItems = wardrobe.length;

    // Convert map to array sorted by count descending
    return Array.from(categoryMap.entries())
      .map(([cat, data]) => {
        const config = CATEGORY_COLOR_PALETTE[cat] || DEFAULT_COLOR;
        const percentage = totalItems > 0 ? Math.round((data.count / totalItems) * 100) : 0;
        return {
          name: cat,
          displayName: config.label,
          value: data.count,
          percentage,
          color: config.color,
          hoverColor: config.hoverColor,
          items: data.items,
          totalWears: data.totalWears,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [wardrobe]);

  // Derive dominant category & stats
  const dominantCategory = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData[0];
  }, [chartData]);

  const activeCategoryData = useMemo(() => {
    if (activeIndex !== null && chartData[activeIndex]) {
      return chartData[activeIndex];
    }
    if (selectedCategory && selectedCategory !== 'All') {
      return chartData.find(d => d.name === selectedCategory) || null;
    }
    return dominantCategory;
  }, [activeIndex, selectedCategory, chartData, dominantCategory]);

  const totalWearsAll = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.totalWears, 0);
  }, [chartData]);

  if (!wardrobe || wardrobe.length === 0) {
    return null;
  }

  return (
    <div
      id="wardrobe-category-recharts-section"
      className={`bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all ${className}`}
    >
      {/* Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 font-editorial">
                Capsule Category Distribution
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/80">
                {chartData.length} Categories
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive visualization of your wardrobe breakdown, proportions, and utilization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {selectedCategory !== 'All' && (
            <button
              id="reset-category-chart-filter-btn"
              onClick={() => onSelectCategory('All')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Filter className="w-3 h-3 text-slate-500" />
              <span>Reset Filter ({selectedCategory})</span>
            </button>
          )}

          <button
            id="toggle-category-chart-expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title={isExpanded ? 'Collapse Chart' : 'Expand Chart'}
            aria-label={isExpanded ? 'Collapse Category Distribution Chart' : 'Expand Category Distribution Chart'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      <div>
        {isExpanded && (
          <div
            
            
            
            
            className="overflow-hidden"
          >
            <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* 1. Recharts Donut Chart Container */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
                <div className="w-full h-64 sm:h-72 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        content={<CustomTooltip />}
                        wrapperStyle={{ outline: 'none', zIndex: 50 }}
                      />
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={68}
                        outerRadius={105}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="#ffffff"
                        strokeWidth={2}
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                        onClick={(entry) => {
                          if (entry && entry.name) {
                            onSelectCategory(selectedCategory === entry.name ? 'All' : (entry.name as string));
                          }
                        }}
                        cursor="pointer"
                        animationDuration={800}
                        animationEasing="ease-out"
                      >
                        {chartData.map((entry, index) => {
                          const isSelected = selectedCategory === entry.name;
                          const isHovered = activeIndex === index;
                          return (
                            <Cell
                              key={`cell-${entry.name}`}
                              fill={isSelected ? '#0f172a' : isHovered ? entry.hoverColor : entry.color}
                              opacity={
                                selectedCategory === 'All'
                                  ? 1
                                  : isSelected
                                  ? 1
                                  : 0.35
                              }
                              className="transition-all duration-300"
                            />
                          );
                        })}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered Donut Stat Insight */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
                    <div
                      key={activeCategoryData ? activeCategoryData.name : 'total'}
                      
                      
                      
                      className="space-y-0.5"
                    >
                      <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 font-mono block">
                        {activeCategoryData ? activeCategoryData.name : 'Total Capsule'}
                      </span>
                      <span className="text-2xl sm:text-3xl font-bold font-editorial text-slate-900 leading-tight block">
                        {activeCategoryData ? `${activeCategoryData.value}` : `${wardrobe.length}`}
                        <span className="text-xs font-normal text-slate-500 ml-1">
                          {activeCategoryData && activeCategoryData.value === 1 ? 'piece' : 'pieces'}
                        </span>
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-mono">
                        {activeCategoryData ? `${activeCategoryData.percentage}% of wardrobe` : '100%'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 font-medium text-center mt-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Click any segment or badge to filter your wardrobe items
                </p>
              </div>

              {/* 2. Interactive Category Legend & Breakdown Cards */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {chartData.map((cat, idx) => {
                    const isSelected = selectedCategory === cat.name;
                    const isHovered = activeIndex === idx;

                    return (
                      <button
                        key={cat.name}
                        id={`category-chart-pill-${cat.name.toLowerCase()}`}
                        onClick={() => onSelectCategory(isSelected ? 'All' : cat.name)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onMouseLeave={() => setActiveIndex(null)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
                            : isHovered
                            ? 'bg-slate-50 border-slate-300 shadow-xs'
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-white/20"
                            style={{ backgroundColor: isSelected ? '#10b981' : cat.color }}
                          />
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-bold truncate ${
                                isSelected ? 'text-white' : 'text-slate-800'
                              }`}
                            >
                              {cat.displayName}
                            </p>
                            <p
                              className={`text-[11px] truncate ${
                                isSelected ? 'text-slate-300' : 'text-slate-500'
                              }`}
                            >
                              {cat.totalWears} logged {cat.totalWears === 1 ? 'wear' : 'wears'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`text-xs font-bold font-mono ${
                              isSelected ? 'text-emerald-400' : 'text-slate-900'
                            }`}
                          >
                            {cat.value} {cat.value === 1 ? 'pc' : 'pcs'}
                          </span>
                          <span
                            className={`block text-[10px] font-mono ${
                              isSelected ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          >
                            {cat.percentage}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 3. Capsule Health & Balance Metric Highlights */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 font-mono">
                      <Layers className="w-3 h-3 text-slate-400" />
                      Total Pieces
                    </span>
                    <p className="text-base font-bold text-slate-900 font-editorial">
                      {wardrobe.length}{' '}
                      <span className="text-xs font-normal text-slate-500">catalogued</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 font-mono">
                      <Shirt className="w-3 h-3 text-emerald-600" />
                      Dominant Core
                    </span>
                    <p className="text-base font-bold text-slate-900 font-editorial truncate">
                      {dominantCategory ? dominantCategory.name : '—'}{' '}
                      <span className="text-xs font-normal text-emerald-700 font-mono">
                        ({dominantCategory ? `${dominantCategory.percentage}%` : '0%'})
                      </span>
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 font-mono">
                      <TrendingUp className="w-3 h-3 text-slate-400" />
                      Total Utilizations
                    </span>
                    <p className="text-base font-bold text-slate-900 font-editorial">
                      {totalWearsAll}{' '}
                      <span className="text-xs font-normal text-slate-500">logged wears</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Custom Tooltip component for Recharts
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data: CategoryDataPoint = payload[0].payload;
    const topItem = data.items.length > 0 ? data.items[0] : null;

    return (
      <div className="bg-slate-950/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-800 backdrop-blur-md max-w-xs space-y-2">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-bold text-xs text-white">{data.displayName}</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/10 text-emerald-400 font-bold">
            {data.percentage}%
          </span>
        </div>

        <div className="space-y-1 text-xs text-slate-300">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Total Count:</span>
            <span className="font-bold text-white font-mono">{data.value} garments</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Wear Count:</span>
            <span className="font-bold text-white font-mono">{data.totalWears} times</span>
          </div>
          {topItem && (
            <div className="pt-1 text-[10px] text-slate-400 italic truncate border-t border-slate-800/80">
              e.g., &ldquo;{topItem.name}&rdquo;
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}
