/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/LoadingState';
import { WardrobeCategoryChart } from '../components/wardrobe/WardrobeCategoryChart';
import { ItemQuickLookModal } from '../components/wardrobe/ItemQuickLookModal';
import { AutoOrganizeModal } from '../components/wardrobe/AutoOrganizeModal';
import { ClothingCategory, WardrobeItem, WardrobeAutoOrganizeResult } from '../types';
import { wardrobeService, WardrobeFilterOptions } from '../services/wardrobeService';
import { aiStylistService } from '../services/aiStylistService';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  Heart,
  SlidersHorizontal,
  Shirt,
  Sparkles,
  RefreshCw,
  X,
  RotateCcw,
  Trash2,
  CheckSquare,
  Square,
  Check,
  Layers,
  Sparkle,
  Upload,
  AlertTriangle,
  Eye,
} from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'All', label: 'All Pieces' },
  { id: 'Tops', label: 'Tops' },
  { id: 'Bottoms', label: 'Bottoms' },
  { id: 'Outerwear', label: 'Outerwear' },
  { id: 'Dresses', label: 'Dresses' },
  { id: 'Footwear', label: 'Footwear' },
  { id: 'Bags', label: 'Bags' },
  { id: 'Accessories', label: 'Accessories' },
];

const STYLES = ['All', 'Casual', 'Smart Casual', 'Formal', 'Minimal', 'Classic', 'Streetwear', 'Old money'];
const SEASONS = ['All', 'All-Season', 'Spring', 'Summer', 'Autumn', 'Winter'];
const OCCASIONS = ['All', 'Work', 'Casual', 'Dinner', 'Date', 'Party', 'Formal', 'Wedding', 'Travel'];
const FORMALITIES = ['All', 'Casual', 'Smart Casual', 'Business Casual', 'Formal', 'Black Tie'];

export function WardrobePage() {
  const {
    wardrobe,
    isLoadingWardrobe,
    setIsAddClothingModalOpen,
    setSelectedWardrobeItemForDetail,
    toggleWardrobeFavorite,
    updateWardrobeItem,
    deleteWardrobeItem,
    deleteMultipleWardrobeItems,
    clearWardrobe,
    resetToSampleWardrobe,
    reloadWardrobe,
    navigateTo,
    showToast,
  } = useApp();

  /* Search & Filter State */
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string>('All');
  const [selectedStyle, setSelectedStyle] = useState<string>('All');
  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('All');
  const [selectedFormality, setSelectedFormality] = useState<string>('All');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<WardrobeFilterOptions['sortBy']>('newest');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  /* Batch Selection State */
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);
  const [itemPendingDelete, setItemPendingDelete] = useState<string | null>(null);

  /* Quick Look Modal State */
  const [quickLookItem, setQuickLookItem] = useState<WardrobeItem | null>(null);

  /* AI Auto-Organize State */
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [autoOrganizeResult, setAutoOrganizeResult] = useState<WardrobeAutoOrganizeResult | null>(null);
  const [isAutoOrganizeModalOpen, setIsAutoOrganizeModalOpen] = useState(false);
  const [activeClusterFilter, setActiveClusterFilter] = useState<{ name: string; itemIds: string[] } | null>(null);

  const handleAutoOrganize = async () => {
    if (wardrobe.length === 0) {
      showToast({
        title: 'Wardrobe is Empty',
        description: 'Please add items to your wardrobe before using AI Auto-Organize.',
        type: 'warning',
      });
      return;
    }

    setIsOrganizing(true);
    try {
      const result = await aiStylistService.organizeWardrobe(wardrobe);
      setAutoOrganizeResult(result);
      setIsAutoOrganizeModalOpen(true);
      showToast({
        title: 'Wardrobe Auto-Organized',
        description: `Created ${result.clusters.length} aesthetic color & style clusters.`,
        type: 'success',
      });
    } catch {
      showToast({
        title: 'Organization Failed',
        description: 'Unable to auto-organize wardrobe right now.',
        type: 'error',
      });
    } finally {
      setIsOrganizing(false);
    }
  };

  /* Filtered and sorted items */
  const filteredItems = useMemo(() => {
    const safeWardrobe = Array.isArray(wardrobe) ? wardrobe : [];
    const baseItems = activeClusterFilter
      ? safeWardrobe.filter(w => activeClusterFilter.itemIds.includes(w.id))
      : safeWardrobe;

    return wardrobeService.filter(baseItems || [], {
      searchQuery,
      category: selectedCategory as ClothingCategory | 'All',
      color: selectedColor,
      style: selectedStyle,
      season: selectedSeason,
      occasion: selectedOccasion,
      formality: selectedFormality,
      onlyFavorites,
      sortBy,
    });
  }, [
    wardrobe,
    activeClusterFilter,
    searchQuery,
    selectedCategory,
    selectedColor,
    selectedStyle,
    selectedSeason,
    selectedOccasion,
    selectedFormality,
    onlyFavorites,
    sortBy,
  ]);


  /* Category counts map */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: wardrobe.length };
    wardrobe.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [wardrobe]);

  /* Dynamically extract colors present in user's wardrobe */
  const availableColors = useMemo(() => {
    const set = new Set<string>();
    wardrobe.forEach(item => {
      if (item.color) set.add(item.color);
    });
    return ['All', ...Array.from(set)];
  }, [wardrobe]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'All') count++;
    if (selectedColor !== 'All') count++;
    if (selectedStyle !== 'All') count++;
    if (selectedSeason !== 'All') count++;
    if (selectedOccasion !== 'All') count++;
    if (selectedFormality !== 'All') count++;
    if (onlyFavorites) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [
    selectedCategory,
    selectedColor,
    selectedStyle,
    selectedSeason,
    selectedOccasion,
    selectedFormality,
    onlyFavorites,
    searchQuery,
  ]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedColor('All');
    setSelectedStyle('All');
    setSelectedSeason('All');
    setSelectedOccasion('All');
    setSelectedFormality('All');
    setOnlyFavorites(false);
    setSortBy('newest');
  };

  const handleWearToday = async (e: React.MouseEvent, item: WardrobeItem) => {
    e.stopPropagation();
    const today = new Date().toISOString().split('T')[0];
    await updateWardrobeItem(item.id, {
      timesWorn: (item.timesWorn || 0) + 1,
      lastWornDate: today,
    });
    showToast({
      title: 'Wear Recorded',
      description: `Wore "${item.name}" today (${(item.timesWorn || 0) + 1} total wears).`,
      type: 'success',
    });
  };

  const handleQuickDelete = async (e: React.MouseEvent, item: WardrobeItem) => {
    e.stopPropagation();
    await deleteWardrobeItem(item.id);
    setItemPendingDelete(null);
  };

  const toggleItemSelection = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    setSelectedItemIds(filteredItems.map(i => i.id));
  };

  const deselectAll = () => {
    setSelectedItemIds([]);
  };

  const handleDeleteSelected = async () => {
    if (selectedItemIds.length === 0) return;
    await deleteMultipleWardrobeItems(selectedItemIds);
    setSelectedItemIds([]);
    setIsSelectMode(false);
  };

  const handleClearAllConfirmed = async () => {
    await clearWardrobe();
    setIsConfirmingClearAll(false);
    setIsSelectMode(false);
    setSelectedItemIds([]);
  };

  return (
    <div className="space-y-8">
      {/* 1. High-Fashion Atelier Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Atelier Capsule
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-300 font-mono">
                {wardrobe.length} {wardrobe.length === 1 ? 'Piece' : 'Total Pieces'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-editorial">
              Wardrobe Inventory
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
              Curate, organize, and manage your digitized garments. Remove unwanted pieces, batch upload newly acquired items, and inspect capsule metrics.
            </p>

            {/* Micro Breakdown Stats */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-700/60">
              <span className="text-[11px] text-slate-400 font-medium">Capsule Breakdown:</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[11px] text-slate-300 border border-slate-700">
                {categoryCounts['Tops'] || 0} Tops
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[11px] text-slate-300 border border-slate-700">
                {categoryCounts['Bottoms'] || 0} Bottoms
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[11px] text-slate-300 border border-slate-700">
                {categoryCounts['Outerwear'] || 0} Outerwear
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[11px] text-slate-300 border border-slate-700">
                {categoryCounts['Footwear'] || 0} Footwear
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {wardrobe.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleAutoOrganize}
                  disabled={isOrganizing}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  title="Auto-organize your wardrobe by color palettes and style aesthetics"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-emerald-400 ${isOrganizing ? 'animate-spin' : ''}`} />
                  <span>{isOrganizing ? 'Organizing...' : 'Auto-Organize'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSelectMode(!isSelectMode);
                    if (isSelectMode) setSelectedItemIds([]);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    isSelectMode
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-bold'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>{isSelectMode ? 'Exit Selection' : 'Select / Batch Remove'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsConfirmingClearAll(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  title="Empty your wardrobe"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Empty Wardrobe</span>
                </button>
              </>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddClothingModalOpen(true)}
              className="rounded-xl px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Pieces
            </Button>
          </div>
        </div>
      </div>

      {/* Active Cluster Filter Indicator */}
      {activeClusterFilter && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-emerald-950">Filtered to Cluster: </span>
              <span className="font-bold text-emerald-900">"{activeClusterFilter.name}"</span>
              <span className="text-emerald-700 ml-1.5">({filteredItems.length} items)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {autoOrganizeResult && (
              <button
                type="button"
                onClick={() => setIsAutoOrganizeModalOpen(true)}
                className="text-xs text-emerald-700 hover:text-emerald-900 underline font-medium"
              >
                View Clusters
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveClusterFilter(null)}
              className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Show All Pieces</span>
            </button>
          </div>
        </div>
      )}


      {/* Confirmation Modal for Empty Wardrobe */}
      {isConfirmingClearAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-editorial">
                Empty Entire Wardrobe?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                This will remove all {wardrobe.length} garments from your digital catalogue so you can start completely fresh with only your own uploads.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsConfirmingClearAll(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
                onClick={handleClearAllConfirmed}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Yes, Empty All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Select Toolbar (When active) */}
      {isSelectMode && (
        <div
          
          
          className="bg-emerald-950/90 text-emerald-100 border border-emerald-700/60 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <span className="font-semibold text-xs text-white">
              {selectedItemIds.length} of {filteredItems.length} pieces selected
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={selectAllFiltered}
                className="text-xs text-emerald-300 hover:text-white underline font-medium px-2 py-0.5"
              >
                Select All
              </button>
              <span className="text-emerald-700">·</span>
              <button
                type="button"
                onClick={deselectAll}
                className="text-xs text-emerald-300 hover:text-white underline font-medium px-2 py-0.5"
              >
                Deselect All
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              disabled={selectedItemIds.length === 0}
              onClick={handleDeleteSelected}
              className="rounded-xl text-xs"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Selected ({selectedItemIds.length})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsSelectMode(false);
                setSelectedItemIds([]);
              }}
              className="text-xs text-emerald-200 hover:text-white hover:bg-emerald-900/60"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* 2. Recharts Data Visualization: Capsule Category Distribution */}
      {wardrobe.length > 0 && (
        <WardrobeCategoryChart
          wardrobe={wardrobe}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_TABS.map(tab => {
          const isSelected = selectedCategory === tab.id;
          const count = categoryCounts[tab.id] || 0;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Luxury Search & Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="lg:col-span-4">
            <Input
              placeholder="Search by brand, color, material, or style..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          {/* Color Filter */}
          <div className="lg:col-span-2">
            <Select
              value={selectedColor}
              onChange={e => setSelectedColor(e.target.value)}
            >
              {availableColors.map(c => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Colors' : `Color: ${c}`}
                </option>
              ))}
            </Select>
          </div>

          {/* Style Filter */}
          <div className="lg:col-span-2">
            <Select
              value={selectedStyle}
              onChange={e => setSelectedStyle(e.target.value)}
            >
              {STYLES.map(s => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Styles' : `Style: ${s}`}
                </option>
              ))}
            </Select>
          </div>

          {/* Sorting */}
          <div className="lg:col-span-2">
            <Select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as WardrobeFilterOptions['sortBy'])}
            >
              <option value="newest">Sort: Newest Added</option>
              <option value="oldest">Sort: Oldest Added</option>
              <option value="category">Sort: Category</option>
              <option value="favoritesFirst">Sort: Favorites First</option>
              <option value="mostWorn">Sort: Most Worn</option>
              <option value="leastWorn">Sort: Least Worn</option>
            </Select>
          </div>

          {/* Action Buttons: Favorites Toggle & Advanced Filters */}
          <div className="lg:col-span-2 flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                onlyFavorites
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Filter favorites"
            >
              <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Favorites</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                showAdvancedFilters
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="More filters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Extended Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-200">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                Seasonality
              </label>
              <Select
                value={selectedSeason}
                onChange={e => setSelectedSeason(e.target.value)}
              >
                {SEASONS.map(s => (
                  <option key={s} value={s}>
                    {s === 'All' ? 'All Seasons' : s}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                Occasion Context
              </label>
              <Select
                value={selectedOccasion}
                onChange={e => setSelectedOccasion(e.target.value)}
              >
                {OCCASIONS.map(o => (
                  <option key={o} value={o}>
                    {o === 'All' ? 'All Occasions' : o}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                Formality Level
              </label>
              <Select
                value={selectedFormality}
                onChange={e => setSelectedFormality(e.target.value)}
              >
                {FORMALITIES.map(f => (
                  <option key={f} value={f}>
                    {f === 'All' ? 'All Formalities' : f}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}

        {/* Active Filter Badges */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium">Active filters:</span>
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                Category: {selectedCategory}
                <X className="w-3 h-3 cursor-pointer hover:text-slate-900" onClick={() => setSelectedCategory('All')} />
              </span>
            )}
            {selectedColor !== 'All' && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                Color: {selectedColor}
                <X className="w-3 h-3 cursor-pointer hover:text-slate-900" onClick={() => setSelectedColor('All')} />
              </span>
            )}
            {selectedStyle !== 'All' && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                Style: {selectedStyle}
                <X className="w-3 h-3 cursor-pointer hover:text-slate-900" onClick={() => setSelectedStyle('All')} />
              </span>
            )}
            {selectedSeason !== 'All' && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                Season: {selectedSeason}
                <X className="w-3 h-3 cursor-pointer hover:text-slate-900" onClick={() => setSelectedSeason('All')} />
              </span>
            )}
            {onlyFavorites && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-medium">
                Favorites Only
                <X className="w-3 h-3 cursor-pointer hover:text-rose-900" onClick={() => setOnlyFavorites(false)} />
              </span>
            )}
            <button
              onClick={resetAllFilters}
              className="text-xs text-emerald-600 hover:underline font-semibold ml-auto flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Wardrobe Cards Grid */}
      {isLoadingWardrobe ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-sm space-y-4">
          {wardrobe.length === 0 ? (
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto">
                <Shirt className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-editorial">
                  Your Digital Wardrobe is Empty
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  Start fresh by uploading your own clothing pieces (up to 5+ images simultaneously with batch analysis), or load sample pieces to explore styling features.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsAddClothingModalOpen(true)}
                  className="rounded-2xl px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Upload Your Pieces
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={resetToSampleWardrobe}
                  className="rounded-2xl px-4"
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Load Sample Collection
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Search className="w-6 h-6 text-slate-600" />}
              title="No Matching Pieces Found"
              description="Try clearing your active filters or searching for different keywords to locate your garments."
              primaryAction={{
                label: 'Clear Filters',
                onClick: resetAllFilters,
                variant: 'secondary',
                icon: <RotateCcw className="w-3.5 h-3.5" />,
              }}
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div>
            {filteredItems.map(item => {
              const isSelected = selectedItemIds.includes(item.id);
              const isPendingDelete = itemPendingDelete === item.id;

              return (
                <div
                  
                  
                  
                  
                  
                  key={item.id}
                  onClick={() => {
                    if (isSelectMode) {
                      toggleItemSelection(item.id);
                    } else {
                      setSelectedWardrobeItemForDetail(item);
                    }
                  }}
                  className={`group relative bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'border-slate-200/90 hover:border-emerald-400/80'
                  }`}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      referrerPolicy="no-referrer"
                    />

                    {/* Gradient shade on bottom of image for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20 pointer-events-none" />

                    {/* Quick Look Center Hover Action Pill */}
                    {!isSelectMode && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-15 pointer-events-none">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setQuickLookItem(item);
                          }}
                          className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-slate-950/85 hover:bg-slate-900 text-white text-xs font-semibold backdrop-blur-md shadow-lg border border-white/20 flex items-center gap-1.5 transition-all transform translate-y-2 group-hover:translate-y-0 hover:scale-105 active:scale-95"
                          title="Quick Look"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Quick Look</span>
                        </button>
                      </div>
                    )}

                    {/* Batch Selection Checkbox (Top Left) */}
                    {isSelectMode && (
                      <div
                        onClick={e => toggleItemSelection(item.id, e)}
                        className="absolute top-3 left-3 z-20 p-2 rounded-xl bg-white/90 backdrop-blur-md shadow-md cursor-pointer hover:bg-white transition-all"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    )}

                    {/* Top Right Action Overlay: Favorite & Direct Remove (Trash) Button */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                      {/* Direct Remove Button */}
                      {!isSelectMode && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setItemPendingDelete(item.id);
                          }}
                          className="p-2 rounded-full bg-white/80 hover:bg-rose-500 hover:text-white text-slate-600 backdrop-blur-md transition-all shadow-xs"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Favorite Button */}
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          toggleWardrobeFavorite(item.id);
                        }}
                        className={`p-2 rounded-full backdrop-blur-md transition-all shadow-xs ${
                          item.isFavorite
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500'
                        }`}
                        title={item.isFavorite ? 'Remove favorite' : 'Add favorite'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Category & Type Pills (Bottom Left) */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-1.5 z-10">
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/95 text-slate-900 backdrop-blur-sm shadow-xs border border-white/40">
                          {item.category}
                        </span>
                        {item.type && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-900/80 text-white backdrop-blur-sm">
                            {item.type}
                          </span>
                        )}
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/90 text-slate-800 backdrop-blur-sm">
                        {item.color}
                      </span>
                    </div>

                    {/* Quick Delete Confirmation Overlay if clicked */}
                    {isPendingDelete && (
                      <div
                        onClick={e => e.stopPropagation()}
                        className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-30 p-4 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in duration-150"
                      >
                        <Trash2 className="w-8 h-8 text-rose-400" />
                        <p className="text-xs text-white font-medium">
                          Remove "{item.name}"?
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={e => handleQuickDelete(e, item)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md"
                          >
                            Yes, Remove
                          </button>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setItemPendingDelete(null);
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Meta Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {item.brand && (
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600 mb-0.5">
                          {item.brand}
                        </div>
                      )}
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span>{item.material || 'Standard Fabric'}</span>
                        {item.style && (
                          <>
                            <span>•</span>
                            <span className="line-clamp-1">{item.style}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Footer Badges & Quick Actions */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setQuickLookItem(item);
                        }}
                        className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                        title="Quick Look preview and styling recommendations"
                      >
                        <Eye className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                        <span>Quick Look</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[10px] font-mono">
                          {item.timesWorn || 0}w
                        </span>

                        <button
                          type="button"
                          onClick={e => handleWearToday(e, item)}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-0.5"
                        >
                          + Wear
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Item Quick Look Modal */}
      <ItemQuickLookModal
        item={quickLookItem}
        isOpen={!!quickLookItem}
        onClose={() => setQuickLookItem(null)}
        onOpenFullDetail={item => setSelectedWardrobeItemForDetail(item)}
      />

      {/* 6. AI Wardrobe Auto-Organize Modal */}
      <AutoOrganizeModal
        isOpen={isAutoOrganizeModalOpen}
        onClose={() => setIsAutoOrganizeModalOpen(false)}
        result={autoOrganizeResult}
        wardrobe={wardrobe}
        onApplyClusterFilter={(itemIds, clusterName) => {
          setActiveClusterFilter({ name: clusterName, itemIds });
          showToast({
            title: 'Cluster Filter Applied',
            description: `Showing pieces in "${clusterName}".`,
            type: 'info',
          });
        }}
        onSelectGarment={item => setSelectedWardrobeItemForDetail(item)}
      />
    </div>
  );
}

