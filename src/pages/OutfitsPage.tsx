/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { Outfit } from "../types";
import {
  Layers,
  Plus,
  Sparkles,
  Heart,
  Calendar,
  Share2,
  Trash2,
  ArrowUpRight,
  Eye,
} from "lucide-react";

const OUTFIT_CATEGORIES = [
  { id: "All", label: "All Looks" },
  { id: "Favorites", label: "Favorites" },
  { id: "Formal", label: "Formal" },
  { id: "Work", label: "Work" },
  { id: "Casual", label: "Casual" },
  { id: "Date", label: "Date" },
  { id: "Party", label: "Party" },
  { id: "Travel", label: "Travel" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 22,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

export function OutfitsPage() {
  const {
    outfits,
    toggleOutfitFavorite,
    deleteOutfit,
    setIsCreateLookModalOpen,
    navigateTo,
    showToast,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState("All");

  const filteredOutfits = outfits.filter((outfit) => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Favorites") return outfit.isFavorite;
    return outfit.occasion === activeCategory;
  });

  return (
    <div className="space-y-8">
      {/* 1. Atelier Lookbook Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Editorial Lookbook
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-300 font-mono">
                {outfits.length} Compositions
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-editorial">
              Curated Outfits
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
              Browse styled compositions, save signature looks, and prepare full outfits with harmonized wardrobe pieces.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl px-4 py-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
              onClick={() => navigateTo("/stylist")}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
            >
              Ask Stylist
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="rounded-xl px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-transform"
              onClick={() => setIsCreateLookModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              New Look
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 2. Category Tabs with animated active pill indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
      >
        {OUTFIT_CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat.id;
          const count =
            cat.id === "All"
              ? outfits.length
              : cat.id === "Favorites"
                ? outfits.filter((o) => o.isFavorite).length
                : outfits.filter((o) => o.occasion === cat.id).length;

          return (
            <motion.button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`relative px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                isSelected
                  ? "text-white shadow-md"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 shadow-2xs"
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeCategoryPill"
                  className="absolute inset-0 bg-slate-900 rounded-full z-0"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{cat.label}</span>
              <span
                className={`relative z-10 text-[10px] px-1.5 py-0.2 rounded-full font-mono transition-colors ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* 3. Outfits Grid & Empty States */}
      {filteredOutfits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-sm"
        >
          <EmptyState
            icon={<Layers className="w-6 h-6 text-slate-600" />}
            title="No outfits found in this category"
            description="Build a look by hand, or ask your AI stylist to compose an occasion-tailored look."
            primaryAction={{
              label: "Ask Your Stylist",
              onClick: () => navigateTo("/stylist"),
              icon: <Sparkles className="w-4 h-4" />,
            }}
            secondaryAction={{
              label: "Compose New Look",
              onClick: () => setIsCreateLookModalOpen(true),
            }}
          />
        </motion.div>
      ) : (
        <motion.div
          layout
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredOutfits.map((outfit) => (
              <motion.div
                key={outfit.id}
                layout
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover={{
                  y: -6,
                  transition: { duration: 0.25, ease: "easeOut" },
                }}
                className="group relative flex flex-col justify-between rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500/80 p-6 shadow-xs hover:shadow-2xl hover:shadow-emerald-950/10 transition-shadow duration-300 overflow-hidden"
              >
                {/* Subtle gradient hover wash */}
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="relative z-10">
                  {/* Outfit Cover Image */}
                  {outfit.imageUrl && (
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4 bg-slate-100 border border-slate-200/90 shadow-2xs">
                      <motion.img
                        src={outfit.imageUrl}
                        alt={outfit.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        whileHover={{ scale: 1.06 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                      {/* Favorite Button */}
                      <motion.button
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOutfitFavorite(outfit.id);
                        }}
                        className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-colors shadow-xs ${
                          outfit.isFavorite
                            ? "bg-rose-500 text-white shadow-md ring-2 ring-rose-300/50"
                            : "bg-white/85 text-slate-700 hover:bg-white hover:text-rose-500"
                        }`}
                        aria-label="Toggle favorite"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition-transform ${outfit.isFavorite ? "fill-current scale-110" : ""}`}
                        />
                      </motion.button>

                      {/* Badges on Cover */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 z-10">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/95 text-slate-900 backdrop-blur-sm shadow-xs border border-white/40">
                          {outfit.occasion}
                        </span>
                        {outfit.styleVibe && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-950/80 text-white backdrop-blur-sm border border-white/10">
                            {outfit.styleVibe}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Outfit Title */}
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors font-editorial tracking-tight flex items-center justify-between">
                    <span>{outfit.name}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all text-emerald-600 duration-200" />
                  </h3>

                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                    {outfit.description}
                  </p>

                  {/* Included Pieces Thumbnails */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        Ensemble Pieces ({outfit.items.length})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {outfit.itemDetails && outfit.itemDetails.length > 0 ? (
                        outfit.itemDetails.map((item, idx) => (
                          <motion.div
                            key={item.id || idx}
                            whileHover={{ scale: 1.15, y: -2 }}
                            transition={{ type: "spring", stiffness: 350, damping: 18 }}
                            title={`${item.name} (${item.category})`}
                            className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-slate-200/90 bg-slate-50 shadow-2xs relative group/piece cursor-pointer"
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/piece:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="w-3 h-3 text-white" />
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">
                          {outfit.items.length} wardrobe pieces linked
                        </span>
                      )}
                    </div>
                  </div>

                  {outfit.stylingNotes && (
                    <p className="text-[11px] text-slate-600 mt-3 italic bg-slate-50 p-2.5 rounded-2xl border border-slate-100 line-clamp-2">
                      &ldquo;{outfit.stylingNotes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="relative z-10 pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-transform active:scale-95"
                    onClick={() => deleteOutfit(outfit.id)}
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Remove
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    onClick={() => {
                      showToast({
                        title: "Look Bookmarked",
                        description: `"${outfit.name}" copied to styling clipboard.`,
                        type: "info",
                      });
                    }}
                    leftIcon={<Share2 className="w-3.5 h-3.5" />}
                  >
                    Share
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
