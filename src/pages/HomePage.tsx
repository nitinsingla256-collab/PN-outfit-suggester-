/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { aiStylistService } from "../services/aiStylistService";
import { weatherService } from "../services/weatherService";
import { AIStylistResponse } from "../types";
import { useApp } from "../context/AppContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { WeatherWidget } from "../components/ui/WeatherWidget";
import { motion } from "motion/react";
import {
  Sparkles,
  Plus,
  Layers,
  Calendar,
  Heart,
  Shirt,
  ArrowRight,
  TrendingUp,
  CloudSun,
  MapPin,
  UploadCloud,
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

  const [dailyOutfit, setDailyOutfit] = useState<AIStylistResponse | null>(
    null,
  );
  const [isGeneratingDaily, setIsGeneratingDaily] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadDailyOutfit() {
      if (wardrobe.length === 0) return;

      const cacheKey = `daily_outfit_${new Date().toISOString().split("T")[0]}_${user.id}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setDailyOutfit(JSON.parse(cached));
        return;
      }

      setIsGeneratingDaily(true);
      try {
        let weatherDesc = "Unknown Weather";
        let temp = 20;
        try {
          const weatherData = await weatherService.getAutoLocationWeather(
            user.location || "New York",
          );
          weatherDesc = `${weatherData.temperatureCelsius}°C, ${weatherData.condition}`;
          temp = weatherData.temperatureCelsius;
        } catch (e) {
          console.error("Failed to fetch weather for daily outfit", e);
        }

        const response = await aiStylistService.generateOutfitRecommendation(
          {
            occasion: "Daily Wear",
            stylePreference:
              user.preferences?.styleVibes?.[0] || "Smart Casual",
            weatherDescription: weatherDesc,
            temperatureCelsius: temp,
            additionalNotes: `Create a versatile daily look from the wardrobe appropriate for the current weather (${weatherDesc}).`,
          },
          wardrobe,
        );
        if (mounted) {
          setDailyOutfit(response);
          localStorage.setItem(cacheKey, JSON.stringify(response));
        }
      } catch (err) {
        console.error("Failed to generate daily outfit", err);
      } finally {
        if (mounted) setIsGeneratingDaily(false);
      }
    }

    loadDailyOutfit();
    return () => {
      mounted = false;
    };
  }, [wardrobe.length, user.id]);

  const favoritePieces = wardrobe.filter((w) => w.isFavorite);
  const upcomingPlans = plans
    .filter((p) => !p.isCompleted)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const totalWears = wardrobe.reduce((acc, curr) => acc + curr.timesWorn, 0);

  /* Time-based greeting */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const userDisplayName = user.name ? user.name.split(" ")[0] : "Client";

  return (
    <div className="space-y-8">
      {/* 1. Personalized Greeting & Hero Headline */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium uppercase tracking-widest text-emerald-500">
              PN Outfit Suggester Intelligence
            </span>
            <span className="text-gray-400">·</span>
            <span className="text-xs text-gray-600 font-mono">
              Personal Wardrobe
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 font-editorial">
            {greeting}, {userDisplayName}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl leading-relaxed">
            {wardrobe.length === 0
              ? "Your PN digital wardrobe is ready. Upload and catalogue your first clothing pieces to unlock AI styling recommendations."
              : `Your digital wardrobe has ${wardrobe.length} active pieces. Review today's styling recommendations, planned engagements, and wardrobe statistics.`}
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAddClothingModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Piece
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigateTo("/stylist")}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Ask Stylist
          </Button>
        </div>
      </div>

      {/* 2. Today's Styling Focus & Atmosphere Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative">
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-10 -left-10 w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px] pointer-events-none"
        />
        {/* Curated Styling / Getting Started Card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#141720] via-[#111318] to-[#0D0E12] border border-emerald-500/30 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.5)] group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"></div>
          {wardrobe.length > 0 ? (
            <>
              {dailyOutfit ? (
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="gold" size="sm">
                        Daily Suggestion
                      </Badge>
                      <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" />{" "}
                        Powered by Gemini
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mt-1 font-editorial leading-tight">
                      {dailyOutfit.outfitName}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2 line-clamp-2">
                      {dailyOutfit.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-emerald-500/20">
                    {dailyOutfit.pieces.slice(0, 4).map((piece, idx) => (
                      <div
                        key={idx}
                        onClick={() =>
                          piece.item &&
                          setSelectedWardrobeItemForDetail(piece.item)
                        }
                        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 cursor-pointer transition-colors flex items-center gap-2.5"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-900 border border-gray-800">
                          {piece.item?.imageUrl ? (
                            <img
                              src={piece.item.imageUrl}
                              alt={piece.item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-700">
                              <Shirt className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-medium text-gray-300 truncate">
                            {piece.item ? piece.item.name : piece.category}
                          </p>
                          <p className="text-[9px] text-gray-500 truncate">
                            {piece.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : isGeneratingDaily ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 py-8 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-6 h-6 text-emerald-400 animate-spin-slow" />
                  </div>
                  <p className="text-sm font-medium text-emerald-400">
                    Curating your daily look...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 relative z-10">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="gold" size="sm">
                        Active Capsule
                      </Badge>
                      <span className="text-xs text-gray-400 font-mono">
                        {wardrobe.length} Pieces Catalogued
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mt-2 font-editorial">
                      Personalized Wardrobe Composition
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-md">
                      Explore curated pairings and generate occasion-ready looks
                      from your catalogued pieces.
                    </p>
                  </div>
                  <Button
                    variant="gold-outline"
                    size="sm"
                    onClick={() => navigateTo("/stylist")}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Generate Outfit
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-500 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Atelier Initialized</span>
                </div>
                <h3 className="text-xl font-semibold text-white font-editorial relative z-10">
                  Start Your Digital Wardrobe
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 max-w-md leading-relaxed relative z-10">
                  Add coats, tops, bottoms, and accessories. PN&apos;s
                  Gemini AI will automatically recognize fabric textures, cuts,
                  and colorways to build tailored outfit formulas.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => setIsAddClothingModalOpen(true)}
                leftIcon={<UploadCloud className="w-4 h-4" />}
                className="shrink-0 shadow-[0_0_20px_rgba(226,199,153,0.2)]"
              >
                Upload First Piece
              </Button>
            </div>
          )}
        </div>

        {/* Ambient Atmosphere Card */}
        <WeatherWidget className="h-full" />
      </div>

      {/* 3. Wardrobe Overview Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-gray-600 text-xs">
            <span>Total Pieces</span>
            <Shirt className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-2 font-mono">
            {wardrobe.length}
          </div>
          <p className="text-[10px] sm:text-[11px] text-gray-500 mt-1">
            Active in capsule
          </p>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-gray-600 text-xs">
            <span>Lookbook Outfits</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-2 font-mono">
            {outfits.length}
          </div>
          <p className="text-[10px] sm:text-[11px] text-gray-500 mt-1">
            Composed styles
          </p>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-gray-600 text-xs">
            <span>Favorites</span>
            <Heart className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-2 font-mono">
            {favoritePieces.length}
          </div>
          <p className="text-[10px] sm:text-[11px] text-gray-500 mt-1">
            Signature garments
          </p>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-gray-600 text-xs">
            <span>Wear Cycles</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-2 font-mono">
            {totalWears}
          </div>
          <p className="text-[10px] sm:text-[11px] text-gray-500 mt-1">
            Logged wears
          </p>
        </Card>
      </div>

      {/* 4. Upcoming Planned Outfits & Quick Planner */}
      <div className="space-y-4 relative">
        <div className="absolute top-10 right-0 w-80 h-80 bg-rose-200/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
              Upcoming Scheduled Outfits
            </h3>
            <p className="text-xs text-gray-600">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingPlans.map((plan) => (
              <Card
                key={plan.id}
                hoverEffect
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{plan.date}</span>
                      {plan.time && (
                        <span className="text-gray-500">· {plan.time}</span>
                      )}
                    </div>
                    <Badge variant="subtle" size="sm">
                      {plan.occasion}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-800 mt-3">
                    {plan.title}
                  </h4>
                  {plan.location && (
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      {plan.location}
                    </p>
                  )}
                  {plan.notes && (
                    <p className="text-xs text-gray-500 mt-2 italic line-clamp-2">
                      &ldquo;{plan.notes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-4 border-t border-gray-200 flex items-center justify-between text-xs">
                  <span className="text-gray-600">
                    {plan.outfit ? plan.outfit.name : "Look TBD"}
                  </span>
                  <span className="text-emerald-500 font-medium text-[11px]">
                    Scheduled
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Calendar className="w-6 h-6 text-gray-600" />}
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
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
              Lookbook Highlights
            </h3>
            <p className="text-xs text-gray-600">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {outfits.slice(0, 3).map((outfit) => (
              <Card
                key={outfit.id}
                hoverEffect
                className="flex flex-col justify-between"
              >
                <div>
                  {outfit.imageUrl && (
                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-white border border-gray-200">
                      <img
                        src={outfit.imageUrl}
                        alt={outfit.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="gold" size="sm">
                          {outfit.occasion}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <h4 className="text-sm font-semibold text-gray-900">
                    {outfit.name}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                    {outfit.description}
                  </p>
                </div>

                <div className="pt-3 mt-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 font-mono">
                    {outfit.items.length} pieces
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-emerald-500"
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
            icon={<Layers className="w-6 h-6 text-gray-600" />}
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

      {/* 6. AI Stylist Call to Action */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-[#12141A] to-[#181B22] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-xs uppercase font-semibold tracking-wider text-emerald-500">
              PN Intelligent Outfit Generator
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 font-editorial">
            Prepare Your Next Signature Look
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl leading-relaxed">
            Specify your destination, occasion, and dress code. The AI Stylist
            composes calibrated silhouettes from your own wardrobe items.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="shrink-0"
          onClick={() => navigateTo("/stylist")}
          leftIcon={<Sparkles className="w-4 h-4" />}
        >
          Consult Stylist
        </Button>
      </div>
    </div>
  );
}
