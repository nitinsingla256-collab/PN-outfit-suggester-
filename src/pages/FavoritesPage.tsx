/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { Tabs } from "../components/ui/Tabs";
import { Heart, Shirt, Layers, Sparkles, Plus } from "lucide-react";

export function FavoritesPage() {
  const {
    wardrobe,
    outfits,
    toggleWardrobeFavorite,
    toggleOutfitFavorite,
    setSelectedWardrobeItemForDetail,
    setIsAddClothingModalOpen,
    navigateTo,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"pieces" | "outfits">("pieces");

  const favoritePieces = wardrobe.filter((item) => item.isFavorite);
  const favoriteOutfits = outfits.filter((outfit) => outfit.isFavorite);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-semibold tracking-wider text-emerald-500">
              Signature Collection
            </span>
            <span className="text-gray-400">·</span>
            <span className="text-xs text-gray-600 font-mono">
              {favoritePieces.length} Pieces · {favoriteOutfits.length} Looks
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 font-editorial">
            Saved Favorites
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Access your most beloved garments and signature outfit compositions
            in one refined view.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="gold-outline"
            size="sm"
            onClick={() => navigateTo("/stylist")}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-emerald-500" />}
          >
            Style Favorites
          </Button>
        </div>
      </div>

      {/* 2. Segmented Tabs */}
      <Tabs
        tabs={[
          {
            id: "pieces",
            label: "Favorite Clothing",
            count: favoritePieces.length,
            icon: <Shirt className="w-3.5 h-3.5" />,
          },
          {
            id: "outfits",
            label: "Favorite Outfits",
            count: favoriteOutfits.length,
            icon: <Layers className="w-3.5 h-3.5" />,
          },
        ]}
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as any)}
      />

      {/* 3. Tab Content */}
      {activeTab === "pieces" ? (
        favoritePieces.length === 0 ? (
          <EmptyState
            icon={<Heart className="w-6 h-6 text-gray-600" />}
            title="No favorite garments saved"
            description="Tap the heart icon on any piece in your digital wardrobe to collect signature investment pieces here."
            primaryAction={{
              label: "Browse Wardrobe",
              onClick: () => navigateTo("/wardrobe"),
              icon: <Shirt className="w-4 h-4" />,
            }}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {favoritePieces.map((item) => (
              <Card
                key={item.id}
                className="p-3 sm:p-4 group cursor-pointer flex flex-col justify-between"
                hoverEffect
                onClick={() => setSelectedWardrobeItemForDetail(item)}
              >
                <div>
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white border border-gray-200 mb-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWardrobeFavorite(item.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md bg-emerald-500 text-gray-50 shadow-md"
                      aria-label="Remove from favorites"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-gray-800 font-medium">
                        {item.color}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-500 transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-gray-600 mt-1">
                    <span>{item.category}</span>
                    <span className="font-mono text-gray-500">
                      {item.brand || item.fit}
                    </span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-200 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500 font-mono">
                    Worn {item.timesWorn}x
                  </span>
                  <span className="text-xs font-semibold text-gray-700">
                    {item.cost ? `€${item.cost}` : "—"}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : favoriteOutfits.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-6 h-6 text-gray-600" />}
          title="No favorite looks saved"
          description="Star your favorite lookbook ensembles or AI-generated recommendations to build your personal style hall of fame."
          primaryAction={{
            label: "Explore Lookbook",
            onClick: () => navigateTo("/outfits"),
            icon: <Layers className="w-4 h-4" />,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteOutfits.map((outfit) => (
            <Card
              key={outfit.id}
              className="p-5 flex flex-col justify-between group"
              hoverEffect
            >
              <div>
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
                      className="absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md bg-emerald-500 text-gray-50 shadow-md"
                      aria-label="Remove from favorites"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
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

                <h3 className="text-base font-semibold text-gray-900 group-hover:text-emerald-500 transition-colors">
                  {outfit.name}
                </h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed line-clamp-2">
                  {outfit.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-200 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-mono">
                  {outfit.items.length} pieces attached
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-emerald-500"
                  onClick={() => navigateTo("/outfits")}
                >
                  Inspect in Lookbook
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
