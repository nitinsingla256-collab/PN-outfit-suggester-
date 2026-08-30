/** * @license * SPDX-License-Identifier: Apache-2.0 */ import React, {
  useState,
  useMemo,
} from "react";
import { useApp } from "../context/AppContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingSpinner, CardSkeleton } from "../components/ui/LoadingState";
import { Tabs } from "../components/ui/Tabs";
import { ClothingCategory, WardrobeItem } from "../types";
import {
  wardrobeService,
  WardrobeFilterOptions,
} from "../services/wardrobeService";
import {
  Search,
  Plus,
  Heart,
  LayoutGrid,
  List,
  Filter,
  SlidersHorizontal,
  Shirt,
  Sparkles,
  RefreshCw,
  Tag,
  CheckCircle2,
  Calendar,
  X,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
const CATEGORY_TABS = [
  { id: "All", label: "All Pieces" },
  { id: "Tops", label: "Tops" },
  { id: "Bottoms", label: "Bottoms" },
  { id: "Outerwear", label: "Outerwear" },
  { id: "Dresses", label: "Dresses" },
  { id: "Footwear", label: "Footwear" },
  { id: "Bags", label: "Bags" },
  { id: "Accessories", label: "Accessories" },
];
const STYLES = [
  "All",
  "Casual",
  "Smart Casual",
  "Formal",
  "Minimal",
  "Classic",
  "Streetwear",
  "Old money",
];
const SEASONS = ["All", "All-Season", "Spring", "Summer", "Autumn", "Winter"];
const OCCASIONS = [
  "All",
  "Work",
  "Casual",
  "Dinner",
  "Date",
  "Party",
  "Formal",
  "Wedding",
  "Travel",
];
const FORMALITIES = [
  "All",
  "Casual",
  "Smart Casual",
  "Business Casual",
  "Formal",
  "Black Tie",
];
export function WardrobePage() {
  const {
    wardrobe,
    isLoadingWardrobe,
    setIsAddClothingModalOpen,
    setSelectedWardrobeItemForDetail,
    toggleWardrobeFavorite,
    updateWardrobeItem,
    reloadWardrobe,
    navigateTo,
    showToast,
  } = useApp(); /* Search & Filter State */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedColor, setSelectedColor] = useState<string>("All");
  const [selectedStyle, setSelectedStyle] = useState<string>("All");
  const [selectedSeason, setSelectedSeason] = useState<string>("All");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("All");
  const [selectedFormality, setSelectedFormality] = useState<string>("All");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] =
    useState<WardrobeFilterOptions["sortBy"]>("newest");
  const [showAdvancedFilters, setShowAdvancedFilters] =
    useState(false); /* Filtered and sorted items */
  const filteredItems = useMemo(() => {
    return wardrobeService.filter(wardrobe, {
      searchQuery,
      category: selectedCategory as ClothingCategory | "All",
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
    searchQuery,
    selectedCategory,
    selectedColor,
    selectedStyle,
    selectedSeason,
    selectedOccasion,
    selectedFormality,
    onlyFavorites,
    sortBy,
  ]); /* Dynamically extract colors present in user's wardrobe */
  const availableColors = useMemo(() => {
    const set = new Set<string>();
    wardrobe.forEach((item) => {
      if (item.color) set.add(item.color);
    });
    return ["All", ...Array.from(set)];
  }, [wardrobe]);
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "All") count++;
    if (selectedColor !== "All") count++;
    if (selectedStyle !== "All") count++;
    if (selectedSeason !== "All") count++;
    if (selectedOccasion !== "All") count++;
    if (selectedFormality !== "All") count++;
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
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedColor("All");
    setSelectedStyle("All");
    setSelectedSeason("All");
    setSelectedOccasion("All");
    setSelectedFormality("All");
    setOnlyFavorites(false);
    setSortBy("newest");
  };
  const handleWearToday = async (e: React.MouseEvent, item: WardrobeItem) => {
    e.stopPropagation();
    const today = new Date().toISOString().split("T")[0];
    await updateWardrobeItem(item.id, {
      timesWorn: (item.timesWorn || 0) + 1,
      lastWornDate: today,
    });
    showToast({
      title: "Wear Recorded",
      description: `Wore "${item.name}" today (${(item.timesWorn || 0) + 1} total wears).`,
      type: "success",
    });
  };
  return (
    <div className="space-y-6">
      {" "}
      {/* 1. Header & Controls Banner */}{" "}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-gray-200 ">
        {" "}
        <div>
          {" "}
          <div className="flex items-center gap-2 mb-1">
            {" "}
            <span className="text-xs uppercase font-semibold tracking-wider text-emerald-600 ">
              {" "}
              Digital Wardrobe{" "}
            </span>{" "}
            <span className="text-gray-400 ">·</span>{" "}
            <span className="text-xs text-gray-500 font-mono">
              {" "}
              {wardrobe.length} Total Pieces{" "}
            </span>{" "}
          </div>{" "}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 font-editorial">
            {" "}
            Wardrobe Inventory{" "}
          </h1>{" "}
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {" "}
            Manage, filter, and inspect your catalogued clothing items,
            essentials, and signature pieces.{" "}
          </p>{" "}
        </div>{" "}
        <div className="flex items-center gap-2.5">
          {" "}
          <Button
            variant="secondary"
            size="sm"
            onClick={reloadWardrobe}
            className="rounded-xl"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            {" "}
            Refresh{" "}
          </Button>{" "}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddClothingModalOpen(true)}
            className="rounded-xl px-4"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            {" "}
            Add Clothing Piece{" "}
          </Button>{" "}
        </div>{" "}
      </div>{" "}
      {/* 2. Category Filter Tabs */}{" "}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {" "}
        {CATEGORY_TABS.map((tab) => {
          const isSelected = selectedCategory === tab.id;
          const count =
            tab.id === "All"
              ? wardrobe.length
              : wardrobe.filter((i) => i.category === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${isSelected ? "bg-gray-900 text-gray-900 shadow-xs" : "bg-gray-100 text-gray-600 hover:bg-gray-200 "}`}
            >
              {" "}
              <span>{tab.label}</span>{" "}
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/20 " : "bg-gray-200 text-gray-500 "}`}
              >
                {" "}
                {count}{" "}
              </span>{" "}
            </button>
          );
        })}{" "}
      </div>{" "}
      {/* 3. Smart Search & Filter Bar */}{" "}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm space-y-3">
        {" "}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {" "}
          {/* Search Input */}{" "}
          <div className="lg:col-span-4">
            {" "}
            <Input
              placeholder="Search by name, type, brand, color, material..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            />{" "}
          </div>{" "}
          {/* Color Filter */}{" "}
          <div className="lg:col-span-2">
            {" "}
            <Select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            >
              {" "}
              {availableColors.map((c) => (
                <option key={c} value={c}>
                  {" "}
                  {c === "All" ? "All Colors" : `Color: ${c}`}{" "}
                </option>
              ))}{" "}
            </Select>{" "}
          </div>{" "}
          {/* Style Filter */}{" "}
          <div className="lg:col-span-2">
            {" "}
            <Select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
            >
              {" "}
              {STYLES.map((s) => (
                <option key={s} value={s}>
                  {" "}
                  {s === "All" ? "All Styles" : `Style: ${s}`}{" "}
                </option>
              ))}{" "}
            </Select>{" "}
          </div>{" "}
          {/* Sorting */}{" "}
          <div className="lg:col-span-2">
            {" "}
            <Select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as WardrobeFilterOptions["sortBy"])
              }
            >
              {" "}
              <option value="newest">Sort: Newest Added</option>{" "}
              <option value="oldest">Sort: Oldest Added</option>{" "}
              <option value="category">Sort: By Category</option>{" "}
              <option value="favoritesFirst">Sort: Favourites First</option>{" "}
              <option value="mostWorn">Sort: Most Worn</option>{" "}
              <option value="leastWorn">Sort: Least Worn</option>{" "}
            </Select>{" "}
          </div>{" "}
          {/* Action Buttons: Favorites Toggle & Advanced Filters */}{" "}
          <div className="lg:col-span-2 flex items-center gap-2 justify-end">
            {" "}
            <button
              type="button"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${onlyFavorites ? "bg-rose-50 border-rose-200 text-rose-600 " : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              title="Filter favourites"
            >
              {" "}
              <Heart
                className={`w-3.5 h-3.5 ${onlyFavorites ? "fill-current" : ""}`}
              />{" "}
              <span className="hidden sm:inline">Favourites</span>{" "}
            </button>{" "}
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${showAdvancedFilters ? "bg-emerald-50 border-emerald-200 text-emerald-600 " : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              title="More filters"
            >
              {" "}
              <SlidersHorizontal className="w-3.5 h-3.5" />{" "}
              <span className="hidden sm:inline">Filters</span>{" "}
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-gray-900 text-[10px] flex items-center justify-center">
                  {" "}
                  {activeFilterCount}{" "}
                </span>
              )}{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
        {/* Extended Advanced Filters Drawer */}{" "}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {" "}
            <div>
              {" "}
              <label className="text-[11px] font-semibold text-gray-500 mb-1 block">
                {" "}
                Season{" "}
              </label>{" "}
              <Select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
              >
                {" "}
                {SEASONS.map((s) => (
                  <option key={s} value={s}>
                    {" "}
                    {s === "All" ? "All Seasons" : s}{" "}
                  </option>
                ))}{" "}
              </Select>{" "}
            </div>{" "}
            <div>
              {" "}
              <label className="text-[11px] font-semibold text-gray-500 mb-1 block">
                {" "}
                Occasion{" "}
              </label>{" "}
              <Select
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value)}
              >
                {" "}
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>
                    {" "}
                    {o === "All" ? "All Occasions" : o}{" "}
                  </option>
                ))}{" "}
              </Select>{" "}
            </div>{" "}
            <div>
              {" "}
              <label className="text-[11px] font-semibold text-gray-500 mb-1 block">
                {" "}
                Formality Level{" "}
              </label>{" "}
              <Select
                value={selectedFormality}
                onChange={(e) => setSelectedFormality(e.target.value)}
              >
                {" "}
                {FORMALITIES.map((f) => (
                  <option key={f} value={f}>
                    {" "}
                    {f === "All" ? "All Formalities" : f}{" "}
                  </option>
                ))}{" "}
              </Select>{" "}
            </div>{" "}
          </div>
        )}{" "}
        {/* Active Filter Badges */}{" "}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 flex-wrap">
            {" "}
            <span className="text-[11px] text-gray-400 ">
              Active filters:
            </span>{" "}
            {selectedCategory !== "All" && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                {" "}
                Category: {selectedCategory}{" "}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setSelectedCategory("All")}
                />{" "}
              </span>
            )}{" "}
            {selectedColor !== "All" && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                {" "}
                Color: {selectedColor}{" "}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setSelectedColor("All")}
                />{" "}
              </span>
            )}{" "}
            {selectedStyle !== "All" && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                {" "}
                Style: {selectedStyle}{" "}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setSelectedStyle("All")}
                />{" "}
              </span>
            )}{" "}
            {selectedSeason !== "All" && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                {" "}
                Season: {selectedSeason}{" "}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setSelectedSeason("All")}
                />{" "}
              </span>
            )}{" "}
            {onlyFavorites && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-medium">
                {" "}
                Favourites Only{" "}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setOnlyFavorites(false)}
                />{" "}
              </span>
            )}{" "}
            <button
              onClick={resetAllFilters}
              className="text-xs text-emerald-600 hover:underline font-semibold ml-auto flex items-center gap-1"
            >
              {" "}
              <RotateCcw className="w-3 h-3" /> Reset All{" "}
            </button>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* 4. Wardrobe Cards Grid */}{" "}
      {isLoadingWardrobe ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {" "}
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}{" "}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
          {" "}
          {wardrobe.length === 0 ? (
            <EmptyState
              icon={<Shirt className="w-6 h-6 text-gray-600" />}
              title="Your wardrobe is empty."
              description="Upload your first piece and let the stylist build from what you actually own."
              primaryAction={{
                label: "Add Piece",
                onClick: () => setIsAddClothingModalOpen(true),
                icon: <Plus className="w-4 h-4" />,
              }}
            />
          ) : (
            <EmptyState
              icon={<Search className="w-6 h-6 text-gray-600" />}
              title="No Matching Pieces Found"
              description="Try clearing your active filters or searching for different keywords to locate your garments."
              primaryAction={{
                label: "Clear Filters",
                onClick: resetAllFilters,
                variant: "secondary",
                icon: <RotateCcw className="w-3.5 h-3.5" />,
              }}
            />
          )}{" "}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {" "}
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedWardrobeItemForDetail(item)}
              className="group bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col"
            >
              {" "}
              {/* Image Container */}{" "}
              <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                {" "}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />{" "}
                {/* Favorite Heart Button */}{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWardrobeFavorite(item.id);
                  }}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${item.isFavorite ? "bg-rose-500 text-gray-900 shadow-md" : "bg-white/80 text-gray-700 hover:bg-white hover:text-rose-500"}`}
                >
                  {" "}
                  <Heart
                    className={`w-4 h-4 ${item.isFavorite ? "fill-current" : ""}`}
                  />{" "}
                </button>{" "}
                {/* Category & Type Pills */}{" "}
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                  {" "}
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-900 backdrop-blur-sm shadow-2xs">
                    {" "}
                    {item.category}{" "}
                  </span>{" "}
                  {item.type && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/80 text-gray-700 backdrop-blur-sm">
                      {" "}
                      {item.type}{" "}
                    </span>
                  )}{" "}
                </div>{" "}
              </div>{" "}
              {/* Card Meta Content */}{" "}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                {" "}
                <div>
                  {" "}
                  <h3 className="font-bold text-sm text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {" "}
                    {item.name}{" "}
                  </h3>{" "}
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 ">
                    {" "}
                    <span>{item.color}</span>{" "}
                    {item.material && (
                      <>
                        {" "}
                        <span>•</span>{" "}
                        <span className="line-clamp-1">
                          {item.material}
                        </span>{" "}
                      </>
                    )}{" "}
                  </div>{" "}
                </div>{" "}
                {/* Footer Badges & Wear Action */}{" "}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  {" "}
                  <div className="text-gray-400 font-medium">
                    {" "}
                    Worn {item.timesWorn || 0}x{" "}
                  </div>{" "}
                  <button
                    type="button"
                    onClick={(e) => handleWearToday(e, item)}
                    className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    {" "}
                    + Wear Today{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
            </div>
          ))}{" "}
        </div>
      )}{" "}
    </div>
  );
}
