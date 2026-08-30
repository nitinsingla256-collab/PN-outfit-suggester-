/** * @license * SPDX-License-Identifier: Apache-2.0 */ import React, {
  useState,
} from "react";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";
import {
  OccasionType,
  StyleVibe,
  AIStylistRequest,
  AIStylistResponse,
  GeneratedLookOption,
  WardrobeItem,
  OutfitPiece,
} from "../types";
import { aiStylistService } from "../services/aiStylistService";
import { weatherService } from "../services/weatherService";
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  CloudSun,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Shirt,
  Send,
  User,
  Plus,
  Heart,
  Check,
  Zap,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Compass,
  Bookmark,
  Trash2,
  Palette,
  Layers,
  Thermometer,
  Eye,
  Info,
} from "lucide-react";
const QUICK_PROMPTS = [
  "What should I wear for dinner tonight?",
  "Give me a smart casual outfit for 18°C clear weather.",
  "Need a tailored presentation look for work.",
  "Style a modern evening look around my wardrobe.",
  "Weekend brunch with friends in the city.",
  "Comfortable travel look with luxury proportions.",
];
const OCCASIONS = [
  "Dinner",
  "Date",
  "Work",
  "Casual",
  "Party",
  "Wedding",
  "Formal",
  "Travel",
  "Brunch",
  "Athletic",
];
const DRESS_CODES = [
  "Smart Casual",
  "Casual Luxe",
  "Business Casual",
  "Business Formal",
  "Cocktail Attire",
  "Black Tie",
  "Elevated Minimalist",
];
const STYLES: StyleVibe[] = [
  "Smart Casual",
  "Casual",
  "Minimal",
  "Classic",
  "Old money",
  "Streetwear",
  "Edgy",
  "Romantic",
];
export function StylistPage() {
  const {
    wardrobe,
    outfits,
    addOutfit,
    deleteOutfit,
    toggleOutfitFavorite,
    recordWearOutfit,
    showToast,
    setIsAddClothingModalOpen,
    setSelectedWardrobeItemForDetail,
    user,
  } = useApp();
  const [activeTab, setActiveTab] = useState<
    "studio" | "saved_looks" | "concierge"
  >("studio"); /* Generation Input Parameters */
  const [naturalQuery, setNaturalQuery] = useState("");
  const [occasion, setOccasion] = useState<string>("Dinner");
  const [dressCode, setDressCode] = useState("Smart Casual");
  const [location, setLocation] = useState("City Central");
  const [weatherDescription, setWeatherDescription] = useState("18°C, Clear");
  const [temperatureCelsius, setTemperatureCelsius] = useState<number>(18);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [lastWeatherUpdate, setLastWeatherUpdate] = useState("");
  const [time, setTime] = useState("7:00 PM");
  const [date, setDate] = useState("Today");
  const [stylePreference, setStylePreference] =
    useState<StyleVibe>("Smart Casual");
  const [colorPreference, setColorPreference] = useState("");
  const [mustIncludeItemIds, setMustIncludeItemIds] = useState<string[]>([]);
  const [excludeItemIds, setExcludeItemIds] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [showAdvancedInputs, setShowAdvancedInputs] =
    useState(false); /* Result & Active Look Option */
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] =
    useState<AIStylistResponse | null>(null);
  const [selectedLookIndex, setSelectedLookIndex] = useState<number>(0);
  const [savedLookIds, setSavedLookIds] = useState<Record<string, string>>({});
  const [wornLookIds, setWornLookIds] = useState<Record<string, boolean>>(
    {},
  ); /* Concierge Chat State */
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "assistant"; content: string; time: string }[]
  >([
    {
      role: "assistant",
      content:
        wardrobe.length === 0
          ? `Welcome to PAURVI Atelier, ${user.name}. Your digital wardrobe currently has 0 items. You can upload photos of your garments or ask me for advice on color coordination and capsule building.`
          : `Hello ${user.name}. I am your PAURVI AI Stylist. I have access to your ${wardrobe.length} catalogued pieces and can compose safe, modern, or statement ensembles for any occasion.`,
      time: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const toggleMustInclude = (itemId: string) => {
    if (mustIncludeItemIds.includes(itemId)) {
      setMustIncludeItemIds(mustIncludeItemIds.filter((id) => id !== itemId));
    } else {
      setMustIncludeItemIds([...mustIncludeItemIds, itemId]);
      setExcludeItemIds(excludeItemIds.filter((id) => id !== itemId));
    }
  };
  const toggleExclude = (itemId: string) => {
    if (excludeItemIds.includes(itemId)) {
      setExcludeItemIds(excludeItemIds.filter((id) => id !== itemId));
    } else {
      setExcludeItemIds([...excludeItemIds, itemId]);
      setMustIncludeItemIds(mustIncludeItemIds.filter((id) => id !== itemId));
    }
  };
  const handleAutoWeather = async () => {
    setIsWeatherLoading(true);
    try {
      /* Automatic time of day */
      const hour = new Date().getHours();
      let timeOfDay = "Morning";
      if (hour >= 12 && hour < 17) timeOfDay = "Afternoon";
      else if (hour >= 17 && hour < 21) timeOfDay = "Evening";
      else if (hour >= 21 || hour < 5) timeOfDay = "Night";
      setTime(
        `Automatic — ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (${timeOfDay})`,
      );

      let data;
      if (!location.trim() || location === "Current Location") {
        data = await weatherService.getAutoLocationWeather(
          user.location || "Chandigarh",
        );
      } else {
        /* Use manually entered location */
        const searchLoc = location.trim() || user.location || "Chandigarh";
        data = await weatherService.geocodeAndGetWeather(searchLoc);
      }

      setWeatherDescription(data.condition);
      setTemperatureCelsius(data.temperatureCelsius);
      setLocation(data.locationName);
      setLastWeatherUpdate(new Date().toLocaleTimeString());
      setIsWeatherLoading(false);
    } catch (err) {
      console.error(err);
      setIsWeatherLoading(false);
    }
  };
  const handleGenerate = async (
    e?: React.FormEvent,
    overridePrompt?: string,
  ) => {
    if (e) e.preventDefault();
    try {
      setIsGenerating(true);
      setSelectedLookIndex(0);
      const promptToUse = overridePrompt || naturalQuery;
      const request: AIStylistRequest = {
        naturalQuery: promptToUse || undefined,
        occasion: occasion as OccasionType,
        dressCode,
        location: location || "City Venue",
        weatherDescription: `${temperatureCelsius}°C, ${weatherDescription.split(",")[1] || "Clear"}`,
        temperatureCelsius,
        time,
        date,
        stylePreference,
        colorPreference: colorPreference || undefined,
        mustIncludeItemIds,
        excludeItemIds,
        additionalNotes: additionalNotes || undefined,
        generateMultipleLooks: true,
      };
      const result = await aiStylistService.generateOutfitRecommendation(
        request,
        wardrobe,
      );
      setGenerationResult(result);
      showToast({
        title: "Outfits Synthesized",
        description: `Generated tailored looks with ${result.confidenceScore || 96}% styling score.`,
        type: "success",
      });
    } catch (err: any) {
      showToast({
        title: "Styling Error",
        description: err.message || "Unable to generate outfit looks.",
        type: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const handleQuickPromptClick = (promptText: string) => {
    setNaturalQuery(promptText);
    handleGenerate(undefined, promptText);
  }; /* Get active look (either from looks array or primary result) */
  const availableLooks: GeneratedLookOption[] =
    generationResult?.looks && generationResult.looks.length > 0
      ? generationResult.looks
      : generationResult
        ? [
            {
              id: "primary",
              lookType: "Safe & Refined",
              title: generationResult.outfitName,
              subtitle: "Classic, balanced, and timeless harmony",
              pieces: generationResult.pieces,
              whyItWorks: generationResult.whyItWorks,
              bestFor: generationResult.bestFor || {
                occasion,
                time,
                weather: `${temperatureCelsius}°C, Clear`,
              },
              styleNotes: generationResult.stylingTips || [
                "Roll sleeves slightly for a relaxed vibe.",
                "Ensure footwear complements the color tone.",
              ],
              score: generationResult.confidenceScore || 96,
              scoreBreakdown: generationResult.scoreBreakdown || {
                colorHarmony: 98,
                occasionFit: 96,
                weatherMatch: 95,
                coherence: 97,
              },
            },
          ]
        : [];
  const currentLook = availableLooks[selectedLookIndex] || availableLooks[0];
  const handleSaveLook = async (look: GeneratedLookOption) => {
    try {
      const outfitPieces = (look.pieces || [])
        .filter((p) => p.item)
        .map((p) => ({
          itemId: p.item!.id,
          slotName: (p.category === "Tops"
            ? "Top"
            : p.category === "Bottoms"
              ? "Bottom"
              : p.category === "Outerwear"
                ? "Outerwear"
                : p.category === "Footwear"
                  ? "Footwear"
                  : "Main") as any,
        }));
      const newLook = await addOutfit({
        name: look.title || `${occasion} Look`,
        description: look.whyItWorks,
        occasion: (occasion as OccasionType) || "Casual",
        styleVibe: stylePreference,
        items: outfitPieces,
        imageUrl: look.pieces.find((p) => p.item?.imageUrl)?.item?.imageUrl,
        isFavorite: true,
        stylingNotes: (look.styleNotes || []).join(" · "),
        weatherSuitability: `${temperatureCelsius}°C`,
        season: ["All-Season"],
      });
      setSavedLookIds((prev) => ({ ...prev, [look.id]: newLook.id }));
      showToast({
        title: "Look Saved",
        description: `"${look.title}" added to your Saved Outfits.`,
        type: "success",
      });
    } catch (err: any) {
      showToast({
        title: "Save Failed",
        description: err.message || "Could not save look.",
        type: "error",
      });
    }
  };
  const handleWearLookToday = async (look: GeneratedLookOption) => {
    try {
      let targetOutfitId = savedLookIds[look.id];
      if (!targetOutfitId) {
        const outfitPieces = (look.pieces || [])
          .filter((p) => p.item)
          .map((p) => ({ itemId: p.item!.id, slotName: "Main" as any }));
        const newLook = await addOutfit({
          name: look.title,
          description: look.whyItWorks,
          occasion: (occasion as OccasionType) || "Casual",
          styleVibe: stylePreference,
          items: outfitPieces,
          imageUrl: look.pieces.find((p) => p.item?.imageUrl)?.item?.imageUrl,
          isFavorite: false,
          stylingNotes: (look.styleNotes || []).join(" · "),
          weatherSuitability: `${temperatureCelsius}°C`,
          season: ["All-Season"],
        });
        targetOutfitId = newLook.id;
        setSavedLookIds((prev) => ({ ...prev, [look.id]: newLook.id }));
      }
      await recordWearOutfit(targetOutfitId);
      setWornLookIds((prev) => ({ ...prev, [look.id]: true }));
      showToast({
        title: "Wear Logged",
        description: `Logged wear for "${look.title}". Wear counts updated on included pieces!`,
        type: "success",
      });
    } catch (err: any) {
      showToast({
        title: "Wear Logging Failed",
        description: err.message,
        type: "error",
      });
    }
  };
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    const userText = chatInput.trim();
    const newMsg = {
      role: "user" as const,
      content: userText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");
    setIsChatLoading(true);
    try {
      const reply = await aiStylistService.chatConcierge({
        message: userText,
        conversationHistory: chatMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        wardrobePool: wardrobe,
      });
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Unable to connect with styling concierge. Please try again.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      {" "}
      {/* 1. Header & Navigation */}{" "}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-gray-200 ">
        {" "}
        <div>
          {" "}
          <div className="flex items-center gap-2 mb-1">
            {" "}
            <span className="text-xs uppercase font-semibold tracking-wider text-emerald-600 flex items-center gap-1.5">
              {" "}
              <Sparkles className="w-3.5 h-3.5" /> Outfit Studio{" "}
            </span>{" "}
            <span className="text-gray-400 ">·</span>{" "}
            <span className="text-xs text-gray-500 font-mono">
              {" "}
              Strict Inventory Grounding{" "}
            </span>{" "}
          </div>{" "}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 font-editorial">
            {" "}
            AI Stylist Studio{" "}
          </h1>{" "}
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {" "}
            Generate 3 distinct styled looks (Safe, Modern, Statement) scored
            and calibrated exclusively to your wardrobe.{" "}
          </p>{" "}
        </div>{" "}
        {/* AI Centerpiece */}{" "}
        <div className="flex flex-col items-center justify-center py-6">
          {" "}
          <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
            {" "}
            {/* Soft background glow */}{" "}
            <div
              className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 ${isChatLoading || isGenerating ? "bg-emerald-400/40 scale-150" : "bg-emerald-200/20 scale-100"}`}
            ></div>{" "}
            {/* Core element */}{" "}
            <div
              className={`relative w-16 h-16 rounded-full bg-white border border-gray-200 shadow-xl flex items-center justify-center z-10 transition-all duration-700 ${isChatLoading || isGenerating ? "animate-pulse scale-110 border-emerald-300" : "animate-bounce-slow"}`}
            >
              {" "}
              <Sparkles
                className={`w-6 h-6 ${isChatLoading || isGenerating ? "text-emerald-500 animate-spin-slow" : "text-gray-400"}`}
              />{" "}
            </div>{" "}
            {/* Orbiting rings when active */}{" "}
            {(isChatLoading || isGenerating) && (
              <>
                {" "}
                <div
                  className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping"
                  style={{ animationDuration: "3s" }}
                ></div>{" "}
                <div
                  className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping"
                  style={{ animationDuration: "2s", animationDelay: "0.5s" }}
                ></div>{" "}
              </>
            )}{" "}
          </div>{" "}
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-widest">
            {" "}
            {isChatLoading || isGenerating
              ? "Stylist is Thinking..."
              : "Ready to Style"}{" "}
          </p>{" "}
        </div>{" "}
        {/* Tab Switcher */}{" "}
        <div className="flex items-center bg-gray-100 border border-gray-200 rounded-2xl p-1 shrink-0">
          {" "}
          <button
            onClick={() => setActiveTab("studio")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "studio" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"}`}
          >
            {" "}
            <Compass className="w-3.5 h-3.5 text-emerald-600 " />{" "}
            <span>Studio</span>{" "}
          </button>{" "}
          <button
            onClick={() => setActiveTab("saved_looks")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "saved_looks" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"}`}
          >
            {" "}
            <Bookmark className="w-3.5 h-3.5 text-emerald-600 " />{" "}
            <span>Saved Outfits ({outfits.length})</span>{" "}
          </button>{" "}
          <button
            onClick={() => setActiveTab("concierge")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "concierge" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"}`}
          >
            {" "}
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 " />{" "}
            <span>Concierge Chat</span>{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      {/* ========================================== */}{" "}
      {/* TAB 1: OUTFIT STUDIO GENERATOR & 3 LOOKS */}{" "}
      {/* ========================================== */}{" "}
      {activeTab === "studio" && (
        <div className="space-y-6">
          {" "}
          {/* Quick Prompts Bar */}{" "}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {" "}
            <span className="text-xs font-semibold text-gray-400 shrink-0">
              {" "}
              Quick Inquiries:{" "}
            </span>{" "}
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleQuickPromptClick(prompt)}
                className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200/60 whitespace-nowrap transition-all"
              >
                {" "}
                {prompt}{" "}
              </button>
            ))}{" "}
          </div>{" "}
          {/* Main Grid: Inputs Form & Results */}{" "}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {" "}
            {/* Left Column: Generation Form (4 cols) */}{" "}
            <form
              onSubmit={handleGenerate}
              className="lg:col-span-4 bg-white rounded-3xl border border-gray-200 p-5 shadow-sm space-y-4"
            >
              {" "}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 ">
                {" "}
                <div className="flex items-center gap-2">
                  {" "}
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 ">
                    {" "}
                    <SlidersHorizontal className="w-4 h-4" />{" "}
                  </span>{" "}
                  <h3 className="text-sm font-bold text-gray-900 ">
                    {" "}
                    Styling Parameters{" "}
                  </h3>{" "}
                </div>{" "}
                <span className="text-[11px] font-mono text-gray-400 ">
                  {" "}
                  {wardrobe.length} items ready{" "}
                </span>{" "}
              </div>{" "}
              {/* Natural Query / Occasion Input */}{" "}
              <Input
                label="What are you styling for?"
                placeholder="e.g. Smart casual dinner with friends..."
                value={naturalQuery}
                onChange={(e) => setNaturalQuery(e.target.value)}
              />{" "}
              {/* Occasion & Dress Code */}{" "}
              <div className="grid grid-cols-2 gap-3">
                {" "}
                <Select
                  label="Occasion"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                >
                  {" "}
                  {OCCASIONS.map((occ) => (
                    <option key={occ} value={occ}>
                      {" "}
                      {occ}{" "}
                    </option>
                  ))}{" "}
                </Select>{" "}
                <Select
                  label="Dress Code"
                  value={dressCode}
                  onChange={(e) => setDressCode(e.target.value)}
                >
                  {" "}
                  {DRESS_CODES.map((dc) => (
                    <option key={dc} value={dc}>
                      {" "}
                      {dc}{" "}
                    </option>
                  ))}{" "}
                </Select>{" "}
              </div>{" "}
              {/* Location & Time */}{" "}
              <div className="grid grid-cols-2 gap-3">
                {" "}
                <Input
                  label="Location / Venue"
                  placeholder="e.g. Downtown Bistro"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  leftIcon={<MapPin className="w-3.5 h-3.5 text-gray-400" />}
                />{" "}
                <Input
                  label="Time"
                  placeholder="7:00 PM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  leftIcon={<Clock className="w-3.5 h-3.5 text-gray-400" />}
                />{" "}
              </div>{" "}
              {/* Weather & Temperature */}{" "}
              <div className="grid grid-cols-2 gap-3">
                {" "}
                <Input
                  label="Weather Condition"
                  placeholder="e.g. Clear, Breezy"
                  value={weatherDescription}
                  onChange={(e) => setWeatherDescription(e.target.value)}
                  leftIcon={<CloudSun className="w-3.5 h-3.5 text-gray-400" />}
                />{" "}
                <Input
                  label="Temperature (°C)"
                  type="number"
                  placeholder="18"
                  value={temperatureCelsius.toString()}
                  onChange={(e) =>
                    setTemperatureCelsius(parseInt(e.target.value) || 18)
                  }
                  leftIcon={
                    <Thermometer className="w-3.5 h-3.5 text-gray-400" />
                  }
                />{" "}
              </div>{" "}
              <div className="flex items-center justify-between mt-1 mb-4">
                {" "}
                <span className="text-[10px] text-gray-400 font-mono">
                  {" "}
                  {lastWeatherUpdate
                    ? `Last updated: ${lastWeatherUpdate}`
                    : "Using manual parameters"}{" "}
                </span>{" "}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAutoWeather}
                  disabled={isWeatherLoading}
                  className="text-xs h-7 py-0 text-emerald-600"
                >
                  {" "}
                  {isWeatherLoading ? "Fetching..." : "Fetch Live Weather"}{" "}
                </Button>{" "}
              </div>{" "}
              {/* Style Aesthetic & Color Preference */}{" "}
              <div className="grid grid-cols-2 gap-3">
                {" "}
                <Select
                  label="Style Aesthetic"
                  value={stylePreference}
                  onChange={(e) =>
                    setStylePreference(e.target.value as StyleVibe)
                  }
                >
                  {" "}
                  {STYLES.map((st) => (
                    <option key={st} value={st}>
                      {" "}
                      {st}{" "}
                    </option>
                  ))}{" "}
                </Select>{" "}
                <Input
                  label="Color Preference"
                  placeholder="e.g. Navy, Neutrals"
                  value={colorPreference}
                  onChange={(e) => setColorPreference(e.target.value)}
                  leftIcon={<Palette className="w-3.5 h-3.5 text-gray-400" />}
                />{" "}
              </div>{" "}
              {/* Advanced: Must-Include & Exclude Items */}{" "}
              <div className="pt-2">
                {" "}
                <button
                  type="button"
                  onClick={() => setShowAdvancedInputs(!showAdvancedInputs)}
                  className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  {" "}
                  <span>
                    {showAdvancedInputs ? "Hide" : "Show"} Item Inclusions &
                    Exclusions
                  </span>{" "}
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${showAdvancedInputs ? "rotate-90" : ""}`}
                  />{" "}
                </button>{" "}
                {showAdvancedInputs && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-2xl border border-gray-200/70 space-y-3">
                    {" "}
                    <div>
                      {" "}
                      <span className="text-[11px] font-semibold text-gray-700 block mb-1.5">
                        {" "}
                        Must-Include Specific Piece:{" "}
                      </span>{" "}
                      {wardrobe.length === 0 ? (
                        <p className="text-xs text-gray-400">
                          Wardrobe is empty.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                          {" "}
                          {wardrobe.map((item) => {
                            const isIncluded = mustIncludeItemIds.includes(
                              item.id,
                            );
                            return (
                              <button
                                type="button"
                                key={item.id}
                                onClick={() => toggleMustInclude(item.id)}
                                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${isIncluded ? "bg-emerald-600 text-white border-emerald-600 font-semibold" : "bg-white border-gray-200 text-gray-700 "}`}
                              >
                                {" "}
                                {item.name}{" "}
                              </button>
                            );
                          })}{" "}
                        </div>
                      )}{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <span className="text-[11px] font-semibold text-gray-700 block mb-1.5">
                        {" "}
                        Exclude Specific Piece:{" "}
                      </span>{" "}
                      {wardrobe.length === 0 ? (
                        <p className="text-xs text-gray-400">
                          Wardrobe is empty.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                          {" "}
                          {wardrobe.map((item) => {
                            const isExcluded = excludeItemIds.includes(item.id);
                            return (
                              <button
                                type="button"
                                key={item.id}
                                onClick={() => toggleExclude(item.id)}
                                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${isExcluded ? "bg-rose-600 text-gray-900 border-rose-600 font-semibold" : "bg-white border-gray-200 text-gray-700 "}`}
                              >
                                {" "}
                                {item.name}{" "}
                              </button>
                            );
                          })}{" "}
                        </div>
                      )}{" "}
                    </div>{" "}
                  </div>
                )}{" "}
              </div>{" "}
              {/* Submit Button */}{" "}
              <div className="pt-2">
                {" "}
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isGenerating}
                  className="w-full rounded-2xl py-3 justify-center shadow-sm"
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  {" "}
                  Generate 3 Styled Looks{" "}
                </Button>{" "}
              </div>{" "}
            </form>{" "}
            {/* Right Column: 3 Looks Display & Details (8 cols) */}{" "}
            <div className="lg:col-span-8 space-y-6">
              {" "}
              {isGenerating ? (
                <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm space-y-4">
                  {" "}
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-pulse">
                    {" "}
                    <Sparkles className="w-8 h-8 animate-spin" />{" "}
                  </div>{" "}
                  <h3 className="text-lg font-bold text-gray-900 ">
                    {" "}
                    Styling Your Looks...{" "}
                  </h3>{" "}
                  <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                    {" "}
                    Analyzing silhouette proportions, textile harmonies, and
                    occasion criteria across your catalogued wardrobe.{" "}
                  </p>{" "}
                </div>
              ) : !generationResult ? (
                /* Initial State */ <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center shadow-sm space-y-4">
                  {" "}
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    {" "}
                    <Compass className="w-7 h-7" />{" "}
                  </div>{" "}
                  <h3 className="text-base font-bold text-gray-900 ">
                    {" "}
                    Your Personalized Outfit Studio{" "}
                  </h3>{" "}
                  <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
                    {" "}
                    Set your occasion and weather on the left, then click{" "}
                    <strong>"Generate 3 Styled Looks"</strong>. Our AI stylist
                    will create 3 distinct looks using exclusively your
                    catalogued garments.{" "}
                  </p>{" "}
                  {wardrobe.length === 0 && (
                    <div className="pt-2">
                      {" "}
                      <Button
                        variant="secondary"
                        onClick={() => setIsAddClothingModalOpen(true)}
                        className="rounded-xl text-xs"
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                      >
                        {" "}
                        Upload Clothes to Digital Wardrobe{" "}
                      </Button>{" "}
                    </div>
                  )}{" "}
                </div>
              ) : (
                /* Output Container */ <div className="space-y-6">
                  {" "}
                  {/* Gap Analysis Disclosure (if missing a category) */}{" "}
                  {generationResult.gapAnalysis && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-emerald-700 flex items-start gap-3 text-xs text-amber-800 ">
                      {" "}
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />{" "}
                      <div>
                        {" "}
                        <span className="font-semibold">
                          Wardrobe Gap Analysis:{" "}
                        </span>{" "}
                        {generationResult.gapAnalysis}{" "}
                      </div>{" "}
                    </div>
                  )}{" "}
                  {/* 3 Looks Selector Tabs (Safe, Modern, Statement) */}{" "}
                  {availableLooks.length > 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {" "}
                      {availableLooks.map((look, idx) => {
                        const isSelected = selectedLookIndex === idx;
                        return (
                          <button
                            key={look.id || idx}
                            type="button"
                            onClick={() => setSelectedLookIndex(idx)}
                            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${isSelected ? "bg-emerald-50/70 border-emerald-500 shadow-sm ring-1 ring-emerald-500" : "bg-white border-gray-200 hover:border-emerald-200 "}`}
                          >
                            {" "}
                            <div>
                              {" "}
                              <div className="flex items-center justify-between mb-1.5">
                                {" "}
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 ">
                                  {" "}
                                  {look.lookType || `Look 0${idx + 1}`}{" "}
                                </span>{" "}
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ">
                                  {" "}
                                  {look.score || 96}%{" "}
                                </span>{" "}
                              </div>{" "}
                              <h4 className="font-bold text-sm text-gray-900 line-clamp-1">
                                {" "}
                                {look.title}{" "}
                              </h4>{" "}
                              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                {" "}
                                {look.subtitle}{" "}
                              </p>{" "}
                            </div>{" "}
                            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                              {" "}
                              <span>{look.pieces.length} Pieces</span>{" "}
                              <span className="text-emerald-600 font-medium">
                                {" "}
                                {isSelected ? "Selected" : "View Look →"}{" "}
                              </span>{" "}
                            </div>{" "}
                          </button>
                        );
                      })}{" "}
                    </div>
                  )}{" "}
                  {/* Active Look Full Detail Card */}{" "}
                  {currentLook && (
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-6">
                      {" "}
                      {/* Look Header: Title, Score & Action Buttons */}{" "}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 ">
                        {" "}
                        <div>
                          {" "}
                          <div className="flex items-center gap-2 mb-1">
                            {" "}
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 ">
                              {" "}
                              {currentLook.lookType || "Curated Ensemble"}{" "}
                            </span>{" "}
                            <span className="text-gray-400 ">·</span>{" "}
                            <span className="text-xs text-gray-500 ">
                              {" "}
                              {currentLook.subtitle}{" "}
                            </span>{" "}
                          </div>{" "}
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-editorial">
                            {" "}
                            {currentLook.title}{" "}
                          </h2>{" "}
                        </div>{" "}
                        <div className="flex items-center gap-2">
                          {" "}
                          <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => handleSaveLook(currentLook)}
                            leftIcon={
                              savedLookIds[currentLook.id] ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Save className="w-3.5 h-3.5" />
                              )
                            }
                          >
                            {" "}
                            {savedLookIds[currentLook.id]
                              ? "Saved"
                              : "Save Look"}{" "}
                          </Button>{" "}
                          <Button
                            variant="primary"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => handleWearLookToday(currentLook)}
                            leftIcon={
                              wornLookIds[currentLook.id] ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                              ) : (
                                <Shirt className="w-3.5 h-3.5" />
                              )
                            }
                          >
                            {" "}
                            {wornLookIds[currentLook.id]
                              ? "Worn Today"
                              : "Wear Today"}{" "}
                          </Button>{" "}
                        </div>{" "}
                      </div>{" "}
                      {/* Styling Score & Score Breakdown Gauges */}{" "}
                      {currentLook.scoreBreakdown && (
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/70 space-y-3">
                          {" "}
                          <div className="flex items-center justify-between">
                            {" "}
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                              {" "}
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600 " />{" "}
                              Styling Score: {currentLook.score || 96} /
                              100{" "}
                            </span>{" "}
                            <span className="text-xs font-semibold text-emerald-600 ">
                              {" "}
                              High Harmony{" "}
                            </span>{" "}
                          </div>{" "}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            {" "}
                            <div>
                              {" "}
                              <div className="flex justify-between text-[11px] text-gray-500 mb-1 font-medium">
                                {" "}
                                <span>Color Harmony</span>{" "}
                                <span className="font-semibold text-gray-800 ">
                                  {" "}
                                  {currentLook.scoreBreakdown.colorHarmony}
                                  %{" "}
                                </span>{" "}
                              </div>{" "}
                              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                {" "}
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{
                                    width: `${currentLook.scoreBreakdown.colorHarmony}%`,
                                  }}
                                />{" "}
                              </div>{" "}
                            </div>{" "}
                            <div>
                              {" "}
                              <div className="flex justify-between text-[11px] text-gray-500 mb-1 font-medium">
                                {" "}
                                <span>Occasion Fit</span>{" "}
                                <span className="font-semibold text-gray-800 ">
                                  {" "}
                                  {currentLook.scoreBreakdown.occasionFit}%{" "}
                                </span>{" "}
                              </div>{" "}
                              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                {" "}
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{
                                    width: `${currentLook.scoreBreakdown.occasionFit}%`,
                                  }}
                                />{" "}
                              </div>{" "}
                            </div>{" "}
                            <div>
                              {" "}
                              <div className="flex justify-between text-[11px] text-gray-500 mb-1 font-medium">
                                {" "}
                                <span>Weather Match</span>{" "}
                                <span className="font-semibold text-gray-800 ">
                                  {" "}
                                  {currentLook.scoreBreakdown.weatherMatch}
                                  %{" "}
                                </span>{" "}
                              </div>{" "}
                              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                {" "}
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{
                                    width: `${currentLook.scoreBreakdown.weatherMatch}%`,
                                  }}
                                />{" "}
                              </div>{" "}
                            </div>{" "}
                            <div>
                              {" "}
                              <div className="flex justify-between text-[11px] text-gray-500 mb-1 font-medium">
                                {" "}
                                <span>Coherence</span>{" "}
                                <span className="font-semibold text-gray-800 ">
                                  {" "}
                                  {currentLook.scoreBreakdown.coherence}%{" "}
                                </span>{" "}
                              </div>{" "}
                              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                {" "}
                                <div
                                  className="h-full bg-purple-500 rounded-full"
                                  style={{
                                    width: `${currentLook.scoreBreakdown.coherence}%`,
                                  }}
                                />{" "}
                              </div>{" "}
                            </div>{" "}
                          </div>{" "}
                        </div>
                      )}{" "}
                      {/* Real Wardrobe Pieces Grid */}{" "}
                      <div className="space-y-3">
                        {" "}
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 ">
                          {" "}
                          Included Wardrobe Pieces{" "}
                        </h4>{" "}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {" "}
                          {currentLook.pieces.map((piece, i) => (
                            <div
                              key={i}
                              onClick={() =>
                                piece.item &&
                                setSelectedWardrobeItemForDetail(piece.item)
                              }
                              className={`rounded-2xl border p-3 flex flex-col justify-between transition-all ${piece.item ? "bg-gray-50 border-gray-200/80 cursor-pointer hover:border-emerald-300" : "bg-gray-50/50 border-dashed border-gray-300 "}`}
                            >
                              {" "}
                              <div>
                                {" "}
                                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-200 mb-2 relative">
                                  {" "}
                                  {piece.item?.imageUrl ? (
                                    <img
                                      src={piece.item.imageUrl}
                                      alt={piece.item.name}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                                      {" "}
                                      <Shirt className="w-6 h-6 mb-1" />{" "}
                                      <span className="text-[10px]">
                                        Suggested
                                      </span>{" "}
                                    </div>
                                  )}{" "}
                                  <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/90 text-gray-800 shadow-2xs">
                                    {" "}
                                    {piece.category}{" "}
                                  </span>{" "}
                                </div>{" "}
                                <h5 className="font-bold text-xs text-gray-900 line-clamp-1">
                                  {" "}
                                  {piece.item
                                    ? piece.item.name
                                    : piece.suggestedDescription}{" "}
                                </h5>{" "}
                                <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                                  {" "}
                                  {piece.role}{" "}
                                </p>{" "}
                              </div>{" "}
                              <div className="mt-2 pt-1.5 border-t border-gray-200/60 flex items-center justify-between text-[10px]">
                                {" "}
                                <span className="text-gray-400">
                                  {" "}
                                  {piece.item
                                    ? `${piece.item.color}`
                                    : "Not in closet"}{" "}
                                </span>{" "}
                                {piece.item && (
                                  <span className="text-emerald-600 font-semibold">
                                    {" "}
                                    Owned{" "}
                                  </span>
                                )}{" "}
                              </div>{" "}
                            </div>
                          ))}{" "}
                        </div>{" "}
                      </div>{" "}
                      {/* Why it works & Best for */}{" "}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {" "}
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/70 space-y-2">
                          {" "}
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                            {" "}
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 " />{" "}
                            Why It Works{" "}
                          </h4>{" "}
                          <p className="text-xs leading-relaxed text-gray-600 ">
                            {" "}
                            {currentLook.whyItWorks}{" "}
                          </p>{" "}
                        </div>{" "}
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/70 space-y-3">
                          {" "}
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                            {" "}
                            <Compass className="w-3.5 h-3.5 text-emerald-600 " />{" "}
                            Best For{" "}
                          </h4>{" "}
                          <div className="space-y-1.5 text-xs text-gray-600 ">
                            {" "}
                            <div className="flex items-center gap-2">
                              {" "}
                              <span className="text-gray-400 font-medium w-16">
                                Occasion:
                              </span>{" "}
                              <span className="font-semibold text-gray-800 ">
                                {" "}
                                {currentLook.bestFor?.occasion || occasion}{" "}
                              </span>{" "}
                            </div>{" "}
                            <div className="flex items-center gap-2">
                              {" "}
                              <span className="text-gray-400 font-medium w-16">
                                Time:
                              </span>{" "}
                              <span className="font-semibold text-gray-800 ">
                                {" "}
                                {currentLook.bestFor?.time || time}{" "}
                              </span>{" "}
                            </div>{" "}
                            <div className="flex items-center gap-2">
                              {" "}
                              <span className="text-gray-400 font-medium w-16">
                                Weather:
                              </span>{" "}
                              <span className="font-semibold text-gray-800 ">
                                {" "}
                                {currentLook.bestFor?.weather ||
                                  `${temperatureCelsius}°C, Clear`}{" "}
                              </span>{" "}
                            </div>{" "}
                          </div>{" "}
                        </div>{" "}
                      </div>{" "}
                      {/* Style Notes / Runway Tips */}{" "}
                      {currentLook.styleNotes &&
                        currentLook.styleNotes.length > 0 && (
                          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/70 space-y-2">
                            {" "}
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 ">
                              {" "}
                              Runway & Atelier Style Notes{" "}
                            </h4>{" "}
                            <ul className="space-y-1.5 text-xs text-gray-600 ">
                              {" "}
                              {currentLook.styleNotes.map((note, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  {" "}
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />{" "}
                                  <span>{note}</span>{" "}
                                </li>
                              ))}{" "}
                            </ul>{" "}
                          </div>
                        )}{" "}
                      {/* Alternative Look Suggestion */}{" "}
                      {generationResult.alternativeLookSuggestion && (
                        <div className="p-3 bg-emerald-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-900 ">
                          {" "}
                          <span className="font-bold">
                            Alternative Styling Idea:{" "}
                          </span>{" "}
                          {generationResult.alternativeLookSuggestion}{" "}
                        </div>
                      )}{" "}
                    </div>
                  )}{" "}
                </div>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* ========================================== */}{" "}
      {/* TAB 2: SAVED OUTFITS & LOOKBOOK */}{" "}
      {/* ========================================== */}{" "}
      {activeTab === "saved_looks" && (
        <div className="space-y-6">
          {" "}
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 ">
            {" "}
            <div>
              {" "}
              <h3 className="text-lg font-bold text-gray-900 font-editorial">
                {" "}
                Saved Outfits & Lookbook{" "}
              </h3>{" "}
              <p className="text-xs text-gray-500 ">
                {" "}
                Outfits saved from AI Studio generation and curated for your
                rotation.{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          {outfits.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm space-y-4">
              {" "}
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                {" "}
                <Bookmark className="w-7 h-7" />{" "}
              </div>{" "}
              <h4 className="text-base font-bold text-gray-900 ">
                {" "}
                No Saved Outfits Yet{" "}
              </h4>{" "}
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                {" "}
                Generate looks in the Outfit Studio and click{" "}
                <strong>"Save Look"</strong> to save your favorite combinations
                here.{" "}
              </p>{" "}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab("studio")}
                className="rounded-xl"
              >
                {" "}
                Go to Outfit Studio{" "}
              </Button>{" "}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {" "}
              {outfits.map((outfit) => (
                <div
                  key={outfit.id}
                  className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  {" "}
                  <div className="space-y-3">
                    {" "}
                    <div className="flex items-center justify-between">
                      {" "}
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-indigo-700 ">
                        {" "}
                        {outfit.occasion || "Ensemble"}{" "}
                      </span>{" "}
                      <button
                        type="button"
                        onClick={() => toggleOutfitFavorite(outfit.id)}
                        className={`p-1.5 rounded-full transition-all ${outfit.isFavorite ? "text-rose-500" : "text-gray-400 hover:text-rose-500"}`}
                      >
                        {" "}
                        <Heart
                          className={`w-4 h-4 ${outfit.isFavorite ? "fill-current" : ""}`}
                        />{" "}
                      </button>{" "}
                    </div>{" "}
                    <h4 className="font-bold text-base text-gray-900 ">
                      {" "}
                      {outfit.name}{" "}
                    </h4>{" "}
                    {outfit.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {" "}
                        {outfit.description}{" "}
                      </p>
                    )}{" "}
                    {/* Pieces Mini Row */}{" "}
                    <div className="flex items-center gap-2 pt-1">
                      {" "}
                      {outfit.items.slice(0, 4).map((piece, pIdx) => {
                        const itemObj = wardrobe.find(
                          (w) => w.id === piece.itemId,
                        );
                        return (
                          <div
                            key={pIdx}
                            className="w-12 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 "
                            title={itemObj?.name || "Piece"}
                          >
                            {" "}
                            {itemObj?.imageUrl ? (
                              <img
                                src={itemObj.imageUrl}
                                alt={itemObj.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                {" "}
                                <Shirt className="w-4 h-4" />{" "}
                              </div>
                            )}{" "}
                          </div>
                        );
                      })}{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    {" "}
                    <button
                      type="button"
                      onClick={() => recordWearOutfit(outfit.id)}
                      className="font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      {" "}
                      <Shirt className="w-3.5 h-3.5" /> Wear Today (
                      {outfit.timesWorn || 0}x){" "}
                    </button>{" "}
                    <button
                      type="button"
                      onClick={() => deleteOutfit(outfit.id)}
                      className="text-gray-400 hover:text-rose-500 p-1 transition-colors"
                      title="Delete outfit"
                    >
                      {" "}
                      <Trash2 className="w-4 h-4" />{" "}
                    </button>{" "}
                  </div>{" "}
                </div>
              ))}{" "}
            </div>
          )}{" "}
        </div>
      )}{" "}
      {/* ========================================== */}{" "}
      {/* TAB 3: CONCIERGE CHAT */}{" "}
      {/* ========================================== */}{" "}
      {activeTab === "concierge" && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          {" "}
          {/* Chat Messages Log */}{" "}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {" "}
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 max-w-xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                {" "}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-gray-900 text-white " : "bg-emerald-50 text-emerald-600 "}`}
                >
                  {" "}
                  {msg.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}{" "}
                </div>{" "}
                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed ${msg.role === "user" ? "bg-emerald-600 text-gray-900" : "bg-gray-50 text-gray-800 border border-gray-200/60 "}`}
                >
                  {" "}
                  <p className="whitespace-pre-line">{msg.content}</p>{" "}
                  <span
                    className={`block text-[10px] mt-2 ${msg.role === "user" ? "text-emerald-200" : "text-gray-400 "}`}
                  >
                    {" "}
                    {msg.time}{" "}
                  </span>{" "}
                </div>{" "}
              </div>
            ))}{" "}
            {isChatLoading && (
              <div className="flex gap-3 max-w-xl">
                {" "}
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  {" "}
                  <Sparkles className="w-4 h-4 animate-spin" />{" "}
                </div>{" "}
                <div className="rounded-2xl p-4 bg-gray-50 border border-gray-200/60 text-xs text-gray-500 flex items-center gap-2">
                  {" "}
                  <span>Concierge is thinking...</span>{" "}
                </div>{" "}
              </div>
            )}{" "}
          </div>{" "}
          {/* Chat Input Bar */}{" "}
          <form
            onSubmit={handleSendChatMessage}
            className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-2"
          >
            {" "}
            <Input
              placeholder="Ask anything about styling, colors, fabric pairing, or specific pieces..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1"
            />{" "}
            <Button
              type="submit"
              variant="primary"
              disabled={!chatInput.trim() || isChatLoading}
              leftIcon={<Send className="w-4 h-4" />}
            >
              {" "}
              Send{" "}
            </Button>{" "}
          </form>{" "}
        </div>
      )}{" "}
    </div>
  );
}
