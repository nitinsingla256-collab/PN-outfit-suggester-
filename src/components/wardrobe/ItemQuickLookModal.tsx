/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WardrobeItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { FALLBACK_GARMENT_IMAGE } from '../../utils/imageOptimizer';
import {
  X,
  Sparkles,
  Heart,
  Calendar,
  Layers,
  Shirt,
  Tag,
  ArrowRight,
  TrendingUp,
  Check,
  Compass,
  Palette,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface ItemQuickLookModalProps {
  item: WardrobeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenFullDetail?: (item: WardrobeItem) => void;
}

export function ItemQuickLookModal({
  item,
  isOpen,
  onClose,
  onOpenFullDetail,
}: ItemQuickLookModalProps) {
  if (!isOpen || !item) return null;

  const {
    wardrobe,
    toggleWardrobeFavorite,
    recordWearItem,
    navigateTo,
    showToast,
  } = useApp();

  // Find smart companion pieces from the user's existing wardrobe
  const suggestedPairings = useMemo(() => {
    if (!item || !wardrobe) return [];

    // Filter out the current item
    const otherItems = wardrobe.filter(w => w.id !== item.id);

    // Depending on this item's category, find complementary items
    let targetCategories: string[] = [];
    if (item.category === 'Tops') {
      targetCategories = ['Bottoms', 'Outerwear', 'Footwear'];
    } else if (item.category === 'Bottoms') {
      targetCategories = ['Tops', 'Footwear', 'Outerwear'];
    } else if (item.category === 'Outerwear') {
      targetCategories = ['Tops', 'Bottoms', 'Footwear'];
    } else if (item.category === 'Footwear') {
      targetCategories = ['Bottoms', 'Tops', 'Bags'];
    } else if (item.category === 'Dresses') {
      targetCategories = ['Outerwear', 'Footwear', 'Bags'];
    } else {
      targetCategories = ['Tops', 'Bottoms', 'Outerwear'];
    }

    const pairings: WardrobeItem[] = [];
    targetCategories.forEach(cat => {
      const match = otherItems.find(w => w.category === cat && !pairings.some(p => p.id === w.id));
      if (match) pairings.push(match);
    });

    // If less than 3, fill with any other pieces
    if (pairings.length < 3) {
      otherItems.forEach(w => {
        if (pairings.length < 3 && !pairings.some(p => p.id === w.id)) {
          pairings.push(w);
        }
      });
    }

    return pairings;
  }, [item, wardrobe]);

  // Generate dynamic styling notes and formula for this garment
  const stylingNote = useMemo(() => {
    if (!item) return null;

    const color = item.color || 'Neutral';
    const formality = item.formality || 'Smart Casual';
    const fit = item.fit || 'Regular';
    const style = item.style || 'Classic';

    let colorHarmony = 'Pairs effortlessly with monochrome neutrals (ecru, charcoal, black, and navy).';
    if (/blue|navy/i.test(color)) {
      colorHarmony = 'Harmonizes cleanly with crisp white, stone beige, caramel brown, and grey tones.';
    } else if (/black|charcoal|grey/i.test(color)) {
      colorHarmony = 'Provides a sleek anchor; pair with earthy tones or high-contrast crisp whites.';
    } else if (/beige|camel|tan|brown/i.test(color)) {
      colorHarmony = 'Warm neutral base that balances beautifully with deep navy, forest green, or chalk white.';
    } else if (/green|olive/i.test(color)) {
      colorHarmony = 'Refined earthy hue; complement with cream, dark denim, and rich espresso leather.';
    } else if (/white|cream|ecru/i.test(color)) {
      colorHarmony = 'Luminous neutral anchor that brightens tailored tailoring or dark denim.';
    }

    let silhouetteTip = `Features a ${fit.toLowerCase()} silhouette suitable for ${formality.toLowerCase()} styling formulas.`;
    if (item.category === 'Tops') {
      silhouetteTip = 'Tuck into high-waisted trousers for architectural lines, or layer beneath an unstructured blazer.';
    } else if (item.category === 'Bottoms') {
      silhouetteTip = 'Pair with fitted knitwear or a relaxed button-down to maintain clean vertical proportions.';
    } else if (item.category === 'Outerwear') {
      silhouetteTip = 'Drapes effortlessly over fine-gauge knits, adding structured elegance to relaxed foundations.';
    } else if (item.category === 'Footwear') {
      silhouetteTip = 'Grounds your silhouette; harmonize leather tones with your belt or carryall bag.';
    }

    return {
      colorHarmony,
      silhouetteTip,
      idealOccasion: item.occasion && item.occasion.length > 0 ? item.occasion.join(', ') : formality,
    };
  }, [item]);

  if (!isOpen || !item) return null;

  const handleWearToday = async () => {
    await recordWearItem(item.id);
    showToast({
      title: 'Wear Logged',
      description: `Recorded wear for "${item.name}". Total wears: ${(item.timesWorn || 0) + 1}.`,
      type: 'success',
    });
  };

  const handleOpenInStylist = () => {
    onClose();
    navigateTo('/stylist');
  };

  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70"
        />

        {/* Modal Window */}
        <div
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 my-auto"
        >
          {/* Header Action Bar */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            {/* Favorite toggle */}
            <button
              onClick={() => toggleWardrobeFavorite(item.id)}
              className={`p-2.5 rounded-full transition-colors shadow-sm ${
                item.isFavorite
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/95 text-slate-700 hover:text-rose-500 hover:bg-white border border-slate-200/60'
              }`}
              title={item.isFavorite ? 'Favorited' : 'Add to Favorites'}
            >
              <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/95 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors border border-slate-200/60 shadow-sm"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
            {/* Left Column: Image & Quick Stats */}
            <div className="md:col-span-5 bg-slate-950 p-6 flex flex-col justify-between text-white relative overflow-hidden">
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-lg border border-slate-800 bg-slate-900 mb-4">
                <img
                  src={item.imageUrl || FALLBACK_GARMENT_IMAGE}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_GARMENT_IMAGE;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/95 text-slate-900 font-mono shadow-xs">
                    {item.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-900/80 text-emerald-300 font-mono border border-emerald-500/30">
                    {item.color}
                  </span>
                </div>
              </div>

              {/* Wear Metric Card */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    Utilization
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {item.timesWorn || 0} {item.timesWorn === 1 ? 'wear' : 'wears'}
                  </span>
                </div>
                
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(((item.timesWorn || 0) / 15) * 100, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 font-mono">
                  <span>{item.formality || 'Smart Casual'}</span>
                  <span>{item.season && item.season.length > 0 ? item.season.join(', ') : 'All-Season'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Garment Details & Styling Pairings */}
            <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                {/* Title & Brand */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {item.brand ? (
                      <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-700 font-mono">
                        {item.brand}
                      </span>
                    ) : (
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 font-mono">
                        Wardrobe Core
                      </span>
                    )}
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">{item.type || item.subcategory || item.category}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-editorial leading-tight">
                    {item.name}
                  </h2>
                </div>

                {/* Attribute Pills Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                      Material
                    </span>
                    <span className="font-semibold text-slate-800 truncate block mt-0.5">
                      {item.material || 'Premium Fabric'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                      Fit Profile
                    </span>
                    <span className="font-semibold text-slate-800 truncate block mt-0.5">
                      {item.fit || 'Regular'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                      Pattern
                    </span>
                    <span className="font-semibold text-slate-800 truncate block mt-0.5">
                      {item.pattern || 'Solid'}
                    </span>
                  </div>
                </div>

                {/* Styling Suggestions Box */}
                {stylingNote && (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2.5">
                    <div className="flex items-center gap-2 text-emerald-900">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                        Atelier Styling Blueprint
                      </h4>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {stylingNote.silhouetteTip}
                    </p>

                    <div className="pt-2 border-t border-emerald-200/60 flex items-start gap-2 text-[11px] text-emerald-950">
                      <Palette className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{stylingNote.colorHarmony}</span>
                    </div>
                  </div>
                )}

                {/* Companion Capsule Pairings from User's Wardrobe */}
                {suggestedPairings.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 font-editorial">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        Pairs With Your Wardrobe
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {suggestedPairings.length} matching pieces
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                      {suggestedPairings.map(pair => (
                        <div
                          key={pair.id}
                          className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition-colors shrink-0 max-w-[170px]"
                        >
                          <img
                            src={pair.imageUrl}
                            alt={pair.name}
                            className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-900 truncate">
                              {pair.name}
                            </p>
                            <p className="text-[9px] text-slate-500 font-mono truncate">
                              {pair.category} • {pair.color}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleWearToday}
                    className="rounded-xl text-xs"
                    leftIcon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
                  >
                    +1 Wear
                  </Button>

                  {onOpenFullDetail && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onOpenFullDetail(item);
                      }}
                      className="rounded-xl text-xs text-slate-600 hover:text-slate-900"
                      leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
                    >
                      Edit Details
                    </Button>
                  )}
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenInStylist}
                  className="rounded-xl text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md ml-auto"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Style in Studio
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
