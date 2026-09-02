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

import React, { useState, useEffect, useMemo } from "react";
import { aiStylistService } from "../services/aiStylistService";
import { weatherService } from "../services/weatherService";
import { AIStylistResponse, OutfitPiece } from "../types";
import { useApp } from "../context/AppContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { WeatherWidget } from "../components/ui/WeatherWidget";
import { SeasonalTrendsSection } from "../components/home/SeasonalTrendsSection";

import {


  Sparkles,
  Plus,
  Layers,
  Calendar,
  Heart,
  Shirt,
  ArrowRight,
  TrendingUp,
  MapPin,
  UploadCloud,
  ChevronRight,
} from "lucide-react";

export function HomePage() {
  const {
    user,
    wardrobe,
    outfits,
    plans,
    navigateTo,
    setIsAddClothingModalOpen,
    setIsCreateLookModalOpen,
    setIsPlanModalOpen,
    setSelectedWardrobeItemForDetail,
  } = useApp();

  const [dailyOutfit, setDailyOutfit] = useState<AIStylistResponse | null>(() => {
    try {
      if (!user) return null;
      const cacheKey = `daily_outfit_${new Date().toISOString().split("T")[0]}_${user.id}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  });
  const [isGeneratingDaily, setIsGeneratingDaily] = useState(false);

  // Fast deterministic fallback outfit builder
  const buildInstantLook = (items: typeof wardrobe): AIStylistResponse | null => {
    if (!items || !Array.isArray(items) || items.length === 0) return null;
    const top = items.find(i => i.category === 'Tops') || items[0];
    const bottom = items.find(i => i.category === 'Bottoms' && i.id !== top.id) || items[1] || top;
    const shoes = items.find(i => i.category === 'Footwear' && i.id !== top.id && i.id !== bottom.id);
    const outer = items.find(i => i.category === 'Outerwear' && i.id !== top.id && i.id !== bottom.id);

    const selected = [top, bottom, shoes, outer].filter(Boolean);
    const pieces: OutfitPiece[] = selected.map(i => ({
      category: i!.category,
      item: i!,
      role: i!.category === 'Tops' ? 'Primary Silhouette' : i!.category === 'Bottoms' ? 'Anchor Structure' : 'Accent Element',
      suggestedDescription: i!.name,
      isOwned: true,
    }));

    return {
      id: `instant_${Date.now()}`,
      requestId: `req_instant_${Date.now()}`,
      outfitName: `Curated Everyday Minimalist`,
      summary: `A balanced ensemble matching ${top.name} with ${bottom.name} for effortless daywear versatility.`,
      pieces,
      whyItWorks: `Harmonizes complementary proportions with your core wardrobe foundations.`,
      weatherReasoning: `Adaptable layering suitable for ambient day-to-evening transitions.`,
      occasionReasoning: `Smart-casual formulation calibrated for versatile modern settings.`,
      bestFor: {
        occasion: 'Daily Wear',
        time: 'Daytime',
        weather: 'Moderate',
      },
      stylingTips: [
        `Tuck the hem slightly for cleaner waist definition.`,
        `Complement with minimalist neutral footwear and clean metallic accessories.`,
      ],
      suggestedAccessories: ['Minimalist Leather Watch', 'Silver Cuff'],
      confidenceScore: 95,
      scoreBreakdown: {
        colorHarmony: 96,
        occasionFit: 94,
        weatherMatch: 95,
        coherence: 95,
      },
      generatedAt: new Date().toISOString(),
    };
  };

  useEffect(() => {
    let mounted = true;
    async function loadDailyOutfit() {
      if (wardrobe.length === 0) return;

      if (!user) return null;
      const cacheKey = `daily_outfit_${new Date().toISOString().split("T")[0]}_${user.id}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setDailyOutfit(JSON.parse(cached));
          return;
        } catch(e) {
          localStorage.removeItem(cacheKey);
        }
      }

      // Provide instant local look so the screen is never empty or blocked
      const instantLook = buildInstantLook(wardrobe);
      if (instantLook && !dailyOutfit) {
        setDailyOutfit(instantLook);
      }

      setIsGeneratingDaily(true);
      try {
        let weatherDesc = "Clear, 20°C";
        let temp = 20;
        try {
          const weatherData = await weatherService.getAutoLocationWeather(
            user.location || "London",
          );
          weatherDesc = `${weatherData.temperatureCelsius}°C, ${weatherData.condition}`;
          temp = weatherData.temperatureCelsius;
        } catch (e) {
          console.warn("Weather notice for daily outfit:", e);
        }

        const response = await aiStylistService.generateOutfitRecommendation(
          {
            occasion: "Daily Wear",
            stylePreference: user.preferences?.styleVibes?.[0] || "Smart Casual",
            weatherDescription: weatherDesc,
            temperatureCelsius: temp,
            additionalNotes: `Create a refined daily look tailored for current weather (${weatherDesc}).`,
          },
          wardrobe,
        );
        if (mounted && response) {
          setDailyOutfit(response);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(response));
          } catch {}
        }
      } catch (err) {
        console.warn("Notice generating daily outfit:", err);
      } finally {
        if (mounted) setIsGeneratingDaily(false);
      }
    }

    loadDailyOutfit();
    return () => {
      mounted = false;
    };
  }, [wardrobe.length, user.id]);

  const favoritePieces = useMemo(() => wardrobe.filter((w) => w.isFavorite), [wardrobe]);
  const upcomingPlans = useMemo(() => {
    return plans
      .filter((p) => !p.isCompleted)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [plans]);

  const totalWears = useMemo(() => wardrobe.reduce((acc, curr) => acc + curr.timesWorn, 0), [wardrobe]);

  /* Time-based greeting */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const userDisplayName = user.name ? user.name.split(" ")[0] : "Client";

  return (
    <div className="space-y-10">
      {/* 1. Personalized Editorial Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Atelier Intelligence
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-300 font-mono">
                {wardrobe.length} Active {wardrobe.length === 1 ? 'Garment' : 'Garments'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-editorial">
              {greeting}, {userDisplayName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
              {wardrobe.length === 0
                ? "Your digital atelier is ready. Upload and catalogue your garments to unlock tailored AI outfit formulas and intelligent styling."
                : `Your wardrobe capsule has ${wardrobe.length} digitized pieces. Review today's daily recommendation, scheduled engagements, and styling metrics.`}
            </p>
          </div>

          {/* Quick Top Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl px-4 py-2"
              onClick={() => setIsAddClothingModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Piece
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="rounded-xl px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
              onClick={() => navigateTo("/stylist")}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Ask Stylist
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Today's Styling Focus & Atmospheric Weather Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Curated Daily Recommendation Card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          {wardrobe.length > 0 ? (
            <>
              {dailyOutfit ? (
                <div className="flex flex-col h-full justify-between space-y-5">
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Today&apos;s Signature Look
                        </span>
                        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" /> AI Styled
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-emerald-700 hover:text-emerald-800"
                        onClick={() => navigateTo("/stylist")}
                        rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                      >
                        Open Studio
                      </Button>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-editorial leading-tight">
                      {dailyOutfit.outfitName}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                      {dailyOutfit.summary}
                    </p>
                  </div>

                  {/* Outfit Pieces Gallery */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
                    {dailyOutfit.pieces.slice(0, 4).map((piece, idx) => (
                      <div
                        key={idx}
                        onClick={() => piece.item && setSelectedWardrobeItemForDetail(piece.item)}
                        className="group p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-emerald-400 hover:bg-white cursor-pointer transition-all flex items-center gap-2.5"
                      >
                        <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-slate-200 border border-slate-300/60">
                          {piece.item?.imageUrl ? (
                            <img
                              src={piece.item.imageUrl}
                              alt={piece.item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Shirt className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {piece.item ? piece.item.name : piece.category}
                          </p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium truncate">
                            {piece.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : isGeneratingDaily ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 py-12">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-emerald-600 animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-800 font-editorial">
                      Curating Daily Ensemble...
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Synthesizing weather conditions and aesthetic preferences
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Active Capsule
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {wardrobe.length} Pieces Catalogued
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mt-2 font-editorial">
                      Personalized Wardrobe Composition
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md">
                      Explore curated pairings and generate occasion-ready looks from your catalogued pieces.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => navigateTo("/stylist")}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Generate Outfit
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-4">
              <div className="space-y-2 text-center sm:text-left">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Atelier Initialized</span>
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-editorial">
                  Start Your Digital Wardrobe
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
                  Add coats, tops, bottoms, and accessories. PN&apos;s AI recognizes cuts, materials, and color harmonies to build tailored outfit formulas.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => setIsAddClothingModalOpen(true)}
                leftIcon={<UploadCloud className="w-4 h-4" />}
                className="shrink-0 rounded-2xl px-5"
              >
                Upload First Piece
              </Button>
            </div>
          )}
        </div>

        {/* Ambient Atmosphere Card */}
        <WeatherWidget className="h-full" />
      </div>

      {/* 3. Wardrobe Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Garments</span>
            <Shirt className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-editorial">
            {wardrobe.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Active in capsule
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Lookbook</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-editorial">
            {outfits.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Composed styles
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Favorites</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-editorial">
            {favoritePieces.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Signature pieces
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Wear Cycles</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-editorial">
            {totalWears}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Logged wears
          </p>
        </div>
      </div>

      {/* 4. Upcoming Scheduled Outfits & Quick Planner */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-editorial tracking-tight">
              Upcoming Scheduled Outfits
            </h3>
            <p className="text-xs text-slate-500">
              Wardrobe calendar reservations and destination styling.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo("/planner")}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View Calendar
          </Button>
        </div>

        {upcomingPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {upcomingPlans.map((plan) => (
              <Card
                key={plan.id}
                hoverEffect
                className="flex flex-col justify-between rounded-3xl border-slate-200/80"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{plan.date}</span>
                      {plan.time && (
                        <span className="text-slate-400 font-normal">· {plan.time}</span>
                      )}
                    </div>
                    <Badge variant="subtle" size="sm">
                      {plan.occasion}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-3 font-editorial">
                    {plan.title}
                  </h4>
                  {plan.location && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {plan.location}
                    </p>
                  )}
                  {plan.notes && (
                    <p className="text-xs text-slate-500 mt-2 italic line-clamp-2">
                      &ldquo;{plan.notes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">
                    {plan.outfit ? plan.outfit.name : "Look TBD"}
                  </span>
                  <span className="text-emerald-700 font-semibold text-[11px] uppercase tracking-wider">
                    Scheduled
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Calendar className="w-6 h-6 text-slate-600" />}
            title="No Scheduled Outfits"
            description="Organize your upcoming events, gallery dinners, or business travel in your personal style planner."
            primaryAction={{
              label: "Schedule a Look",
              onClick: () => setIsPlanModalOpen(true),
            }}
          />
        )}
      </div>

      {/* 5. Recent Outfits / Lookbook Highlights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-editorial tracking-tight">
              Lookbook Highlights
            </h3>
            <p className="text-xs text-slate-500">
              Curated compositions ready for wear.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo("/outfits")}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            All Looks
          </Button>
        </div>

        {outfits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {outfits.slice(0, 3).map((outfit) => (
              <Card
                key={outfit.id}
                hoverEffect
                className="flex flex-col justify-between rounded-3xl"
              >
                <div>
                  {outfit.imageUrl && (
                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-3.5 bg-slate-100 border border-slate-200">
                      <img
                        src={outfit.imageUrl}
                        alt={outfit.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/95 text-slate-900 backdrop-blur-md shadow-xs">
                          {outfit.occasion}
                        </span>
                      </div>
                    </div>
                  )}
                  <h4 className="text-base font-bold text-slate-900 font-editorial">
                    {outfit.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {outfit.description}
                  </p>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {outfit.items.length} pieces
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-emerald-700 font-semibold"
                    onClick={() => navigateTo("/outfits")}
                  >
                    Inspect Look
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Layers className="w-6 h-6 text-slate-600" />}
            title="No outfits composed yet"
            description="Build a look by hand, or ask your personal AI stylist to compose one from your wardrobe."
            primaryAction={{
              label: "Ask Your Stylist",
              onClick: () => navigateTo("/stylist"),
              icon: <Sparkles className="w-4 h-4" />,
            }}
            secondaryAction={{
              label: "Compose by Hand",
              onClick: () => setIsCreateLookModalOpen(true),
            }}
          />
        )}
      </div>

      {/* 6. Seasonal Trends Section (Google Search Grounded) */}
      <SeasonalTrendsSection />

      {/* 7. AI Stylist Call to Action */}
      <div className="rounded-3xl border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 text-center sm:text-left relative z-10">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs uppercase font-semibold tracking-widest text-emerald-400">
              PN Intelligent Outfit Studio
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-editorial">
            Prepare Your Next Signature Look
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Specify your destination, occasion, and dress code. The AI Stylist composes calibrated silhouettes from your own wardrobe items.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="shrink-0 rounded-2xl px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 relative z-10"
          onClick={() => navigateTo("/stylist")}
          leftIcon={<Sparkles className="w-4 h-4" />}
        >
          Consult Stylist
        </Button>
      </div>
    </div>
  );
}
