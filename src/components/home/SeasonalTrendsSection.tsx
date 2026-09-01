/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const safeLocalStorage = {
  getItem(key: string): string | null {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  setItem(key: string, value: string): void {
    try { localStorage.setItem(key, value); } catch (e) {}
  },
  removeItem(key: string): void {
    try { localStorage.removeItem(key); } catch (e) {}
  }
};

import React, { useState, useEffect } from "react";

import { aiStylistService } from "../../services/aiStylistService";
import { FashionTrend, FashionTrendsReport, ClothingCategory } from "../../types";
import { useApp } from "../../context/AppContext";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import {


  Sparkles,
  Globe,
  ExternalLink,
  TrendingUp,
  RefreshCw,
  Palette,
  Layers,
  Search,
  Compass,
  Shirt,
  ArrowRight,
  Info,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";

interface SeasonalTrendsSectionProps {
  className?: string;
}

const SEASONS_LIST = [
  { id: "Current Season", label: "Current Season" },
  { id: "Autumn / Winter 2026", label: "Autumn / Winter" },
  { id: "Spring / Summer 2026", label: "Spring / Summer" },
  { id: "Resort & High Summer", label: "Resort & Cruise" },
];

const CATEGORIES = [
  "All",
  "Key Silhouettes",
  "Color Palettes",
  "Fabrics & Textures",
  "Accessories & Footwear",
];

export function SeasonalTrendsSection({ className = "" }: SeasonalTrendsSectionProps) {
  const { wardrobe, navigateTo, setSelectedWardrobeItemForDetail } = useApp();

  const [selectedSeason, setSelectedSeason] = useState<string>("Current Season");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [report, setReport] = useState<FashionTrendsReport | null>(() => {
    try {
      const cached = localStorage.getItem('pn_trends_current_season');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.report) return parsed.report;
      }
    } catch {}
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(!report);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTrendDetail, setActiveTrendDetail] = useState<FashionTrend | null>(null);
  const [showSourcesModal, setShowSourcesModal] = useState<boolean>(false);

  const fetchTrends = async (season: string, force = false) => {
    if (force) {
      setIsRefreshing(true);
    } else if (!report) {
      setIsLoading(true);
    }

    try {
      const data = await aiStylistService.getFashionTrends({
        season,
        forceRefresh: force,
      });
      setReport(data);
    } catch (err) {
      console.warn("Notice loading fashion trends report:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrends(selectedSeason, false);
  }, [selectedSeason]);

  const handleRefresh = () => {
    fetchTrends(selectedSeason, true);
  };

  const filteredTrends = (report?.trends || []).filter((trend) => {
    if (selectedCategory === "All") return true;
    return trend.category === selectedCategory;
  });

  // Find wardrobe items matching categories of a trend
  const getMatchingWardrobeItems = (matchingCategories: ClothingCategory[]) => {
    if (!matchingCategories || matchingCategories.length === 0) return [];
    return wardrobe.filter((item) =>
      matchingCategories.includes(item.category)
    );
  };

  return (
    <section className={`space-y-6 ${className}`} id="seasonal-fashion-trends-section">
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Globe className="w-3 h-3 text-emerald-600" />
              Google Search Grounded
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">
              Live Fashion Runway Analysis
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-editorial">
            Haute Couture &amp; Seasonal Trends
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Real-time fashion forecasting powered by Google Search grounding across Vogue, GQ, WWD, and runway fashion capitals.
          </p>
        </div>

        {/* Season Selector & Refresh Action */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="bg-slate-100/80 p-1 rounded-2xl flex items-center border border-slate-200/80 text-xs">
            {SEASONS_LIST.map((season) => (
              <button
                key={season.id}
                id={`season-tab-${season.id.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setSelectedSeason(season.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                  selectedSeason === season.id
                    ? "bg-white text-slate-950 font-bold shadow-xs border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {season.label}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            id="refresh-fashion-trends-btn"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="rounded-xl px-3 py-2 shrink-0 border-slate-200 hover:bg-slate-50"
            title="Refresh trends with live Google Search query"
            leftIcon={
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-600" : "text-slate-600"}`}
              />
            }
          >
            {isRefreshing ? "Grounding..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* 2. Editorial Headline & Key Insights Banner */}
      {report && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-6 sm:p-7 border border-slate-800 shadow-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold font-mono">
                  {report.season} Direction
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Updated {new Date(report.lastUpdated).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {report.sources && report.sources.length > 0 && (
                <button
                  id="view-search-sources-btn"
                  onClick={() => setShowSourcesModal(true)}
                  className="text-xs text-slate-300 hover:text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Globe className="w-3 h-3 text-emerald-400" />
                  <span>{report.sources.length} Grounded References</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            <p className="text-base sm:text-lg font-editorial text-slate-100 leading-relaxed max-w-4xl">
              &ldquo;{report.headlineSummary}&rdquo;
            </p>

            {/* Key Takeaways Grid */}
            {report.keyTakeaways && report.keyTakeaways.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {report.keyTakeaways.map((takeaway, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs text-xs text-slate-200"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono text-[10px]">
                      0{idx + 1}
                    </div>
                    <span className="leading-snug">{takeaway}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
        <div className="flex items-center gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              id={`category-filter-${category.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-mono shrink-0 hidden sm:inline-block">
          Showing {filteredTrends.length} {filteredTrends.length === 1 ? "Trend" : "Trends"}
        </span>
      </div>

      {/* 4. Trends Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-slate-200 rounded-full" />
                <div className="h-4 w-12 bg-slate-100 rounded-full" />
              </div>
              <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
              <div className="h-16 w-full bg-slate-100 rounded-xl" />
              <div className="h-6 w-1/2 bg-slate-200 rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredTrends.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrends.map((trend, index) => {
            const matchingItems = getMatchingWardrobeItems(trend.matchingCategories);

            return (
              <div
                key={trend.id || index}
                id={`trend-card-${trend.id}`}
                
                
                
                
                className="group bg-white rounded-3xl border border-slate-200/90 hover:border-slate-300 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Top: Category & Popularity Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-slate-100 text-slate-700 border border-slate-200/70">
                      {trend.category}
                    </span>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                      {trend.tag || "Runway"}
                    </span>
                  </div>

                  {/* Title & Editorial Headline */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-editorial leading-tight group-hover:text-emerald-950 transition-colors">
                      {trend.title}
                    </h3>
                    <p className="text-xs font-medium text-emerald-800 mt-1 italic leading-snug">
                      &ldquo;{trend.headline}&rdquo;
                    </p>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {trend.summary}
                  </p>

                  {/* Signature Key Elements */}
                  {trend.keyElements && trend.keyElements.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Signature Details
                      </p>
                      <ul className="space-y-1">
                        {trend.keyElements.map((el, i) => (
                          <li
                            key={i}
                            className="text-xs text-slate-700 flex items-start gap-1.5"
                          >
                            <span className="text-emerald-600 font-bold text-xs mt-0.5">•</span>
                            <span>{el}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Color Palette Swatches */}
                  {trend.colorPalette && trend.colorPalette.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                          <Palette className="w-3 h-3 text-slate-400" />
                          Curated Palette
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {trend.colorPalette.map((col, ci) => (
                          <div
                            key={ci}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700"
                            title={`${col.name} (${col.hex})`}
                          >
                            <span
                              className="w-3 h-3 rounded-full border border-black/10 shrink-0 shadow-2xs"
                              style={{ backgroundColor: col.hex }}
                            />
                            <span className="truncate max-w-[80px] font-medium text-[10px]">
                              {col.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Wardrobe Matching Integration */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <Shirt className="w-3 h-3 text-emerald-600" />
                          Styling from Wardrobe
                        </span>
                        <span className="font-mono text-emerald-700 font-bold">
                          {matchingItems.length} {matchingItems.length === 1 ? "Piece" : "Pieces"} Match
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed italic">
                        {trend.howToStyle}
                      </p>

                      {matchingItems.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-0.5">
                          {matchingItems.slice(0, 4).map((item) => (
                            <button
                              key={item.id}
                              id={`match-item-thumb-${item.id}`}
                              onClick={() => setSelectedWardrobeItemForDetail(item)}
                              title={item.name}
                              className="w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-slate-300 hover:border-emerald-500 transition-all bg-slate-200"
                            >
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-500 font-bold">
                                  {item.name.charAt(0)}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  {trend.sources && trend.sources.length > 0 ? (
                    <a
                      href={trend.sources[0].uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-500 hover:text-emerald-700 flex items-center gap-1 truncate max-w-[150px] transition-colors"
                      title={trend.sources[0].title}
                    >
                      <Globe className="w-3 h-3 shrink-0 text-emerald-600" />
                      <span className="truncate">{trend.sources[0].title}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-mono">
                      Runway Forecast
                    </span>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    id={`apply-trend-${trend.id}`}
                    onClick={() => {
                      navigateTo("/stylist");
                    }}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 rounded-xl"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Style in Studio
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-700">
            No trends found for category &ldquo;{selectedCategory}&rdquo;.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSelectedCategory("All")}
          >
            Show All Trends
          </Button>
        </div>
      )}

      {/* 5. Google Search Grounding Sources Modal */}
      <div>
        {showSourcesModal && report && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div
              
              
              
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-editorial">
                      Google Search Grounding Sources
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Live web citations consulted for this seasonal forecast
                    </p>
                  </div>
                </div>

                <button
                  id="close-sources-modal-btn"
                  onClick={() => setShowSourcesModal(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Search Queries Used */}
              {report.searchQueries && report.searchQueries.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Search className="w-3 h-3 text-slate-400" />
                    Web Search Queries
                  </span>
                  <div className="space-y-1">
                    {report.searchQueries.map((q, qi) => (
                      <div
                        key={qi}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700"
                      >
                        &ldquo;{q}&rdquo;
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Citations List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Referenced Publications &amp; Fashion Journals
                </span>
                <div className="space-y-2">
                  {report.sources.map((source, si) => (
                    <a
                      key={si}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-3 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 group-hover:text-emerald-900 truncate">
                          {source.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {source.uri}
                        </p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSourcesModal(false)}
                  className="rounded-xl"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
