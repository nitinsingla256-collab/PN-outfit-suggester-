/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/EmptyState';
import { Outfit, OccasionType } from '../types';
import {
  Layers,
  Plus,
  Sparkles,
  Heart,
  Calendar,
  Share2,
  Trash2,
  Tag,
  ArrowRight,
} from 'lucide-react';

const OUTFIT_CATEGORIES = [
  { id: 'All', label: 'All Looks' },
  { id: 'Favorites', label: 'Favorites' },
  { id: 'Formal', label: 'Formal' },
  { id: 'Work', label: 'Work' },
  { id: 'Casual', label: 'Casual' },
  { id: 'Date', label: 'Date' },
  { id: 'Party', label: 'Party' },
  { id: 'Travel', label: 'Travel' },
];

export function OutfitsPage() {
  const {
    outfits,
    wardrobe,
    toggleOutfitFavorite,
    deleteOutfit,
    setIsCreateLookModalOpen,
    navigateTo,
    showToast,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedOutfitForDetail, setSelectedOutfitForDetail] = useState<Outfit | null>(null);

  const filteredOutfits = outfits.filter(outfit => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Favorites') return outfit.isFavorite;
    return outfit.occasion === activeCategory;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-semibold tracking-wider text-emerald-500">
              Lookbook & Ensembles
            </span>
            <span className="text-gray-400">·</span>
            <span className="text-xs text-gray-600 font-mono">{outfits.length} Compositions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 font-editorial">
            Curated Lookbook
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Browse styled compositions, save favorites, and prepare outfits for scheduled events.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="gold-outline"
            size="sm"
            onClick={() => navigateTo('/stylist')}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-emerald-500" />}
          >
            Ask Stylist
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateLookModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Look
          </Button>
        </div>
      </div>

      {/* 2. Category Tabs */}
      <Tabs
        tabs={OUTFIT_CATEGORIES.map(cat => ({
          ...cat,
          count:
            cat.id === 'All'
              ? outfits.length
              : cat.id === 'Favorites'
              ? outfits.filter(o => o.isFavorite).length
              : outfits.filter(o => o.occasion === cat.id).length,
        }))}
        activeTab={activeCategory}
        onChange={setActiveCategory}
      />

      {/* 3. Outfits Grid & Empty States */}
      {filteredOutfits.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-6 h-6 text-gray-600" />}
          title="No outfits yet"
          description="Build a look by hand, or ask your stylist to compose one for you."
          primaryAction={{
            label: 'Ask Your Stylist',
            onClick: () => navigateTo('/stylist'),
            icon: <Sparkles className="w-4 h-4" />,
          }}
          secondaryAction={{
            label: 'Compose New Look',
            onClick: () => setIsCreateLookModalOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOutfits.map(outfit => (
            <Card
              key={outfit.id}
              className="p-5 flex flex-col justify-between group"
              hoverEffect
            >
              <div>
                {/* Outfit Cover Image */}
                {outfit.imageUrl && (
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-white border border-gray-200">
                    <img
                      src={outfit.imageUrl}
                      alt={outfit.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => toggleOutfitFavorite(outfit.id)}
                      className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all ${
                        outfit.isFavorite
                          ? 'bg-emerald-500 text-gray-50'
                          : 'bg-gray-100 text-gray-700 hover:text-gray-900'
                      }`}
                      aria-label="Toggle favorite"
                    >
                      <Heart className={`w-3.5 h-3.5 ${outfit.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                      <Badge variant="gold" size="sm">
                        {outfit.occasion}
                      </Badge>
                      <Badge variant="subtle" size="sm">
                        {outfit.styleVibe}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Outfit Meta */}
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-emerald-500 transition-colors">
                  {outfit.name}
                </h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed line-clamp-2">
                  {outfit.description}
                </p>

                {/* Included Pieces Thumbnails */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block mb-2">
                    Ensemble Components ({outfit.items.length})
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {outfit.itemDetails && outfit.itemDetails.length > 0 ? (
                      outfit.itemDetails.map(item => (
                        <div
                          key={item.id}
                          title={`${item.name} (${item.category})`}
                          className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-gray-200 bg-white"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))
                    ) : (
                      <span className="text-[11px] text-gray-500 font-mono">
                        {outfit.items.length} wardrobe pieces linked
                      </span>
                    )}
                  </div>
                </div>

                {outfit.stylingNotes && (
                  <p className="text-[11px] text-gray-600 mt-2 italic bg-white/60 p-2 rounded-lg border border-gray-200">
                    &ldquo;{outfit.stylingNotes}&rdquo;
                  </p>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-4 border-t border-gray-200 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-rose-400 hover:text-rose-300"
                  onClick={() => deleteOutfit(outfit.id)}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Remove
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    showToast({
                      title: 'Look Bookmarked',
                      description: 'Outfit copied to styling buffer.',
                      type: 'info',
                    });
                  }}
                  leftIcon={<Share2 className="w-3.5 h-3.5" />}
                >
                  Share
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
