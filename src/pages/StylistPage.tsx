/** * @license * SPDX-License-Identifier: Apache-2.0 */ import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
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

const STYLING_STAGES = [
  { label: "Scanning digital wardrobe inventory...", subtext: "Filtering available garments and checking exclusions" },
  { label: "Matching silhouette & color harmonies...", subtext: "Evaluating color theory, textures, and tone pairings" },
  { label: "Calibrating weather & dress code nuances...", subtext: "Balancing thermal comfort, layering, and formality" },
  { label: "Finalizing bespoke curated ensemble...", subtext: "Composing tailored styling tips and accessories" },
];

function StylistPageContent() {
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
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [generatingStage, setGeneratingStage] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [lastUsedPrompt, setLastUsedPrompt] = useState<string | undefined>(undefined);
  const [generationResult, setGenerationResult] =
    useState<AIStylistResponse | null>(null);
  const [selectedLookIndex, setSelectedLookIndex] = useState<number>(0);
  const [savedLookIds, setSavedLookIds] = useState<Record<string, string>>({});
  const [wornLookIds, setWornLookIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isGenerating && !isGeneratingMore) {
      setGeneratingStage(0);
      return;
    }
    const timer = setInterval(() => {
      setGeneratingStage((prev) => (prev < 3 ? prev + 1 : prev));
    }, 700);
    return () => clearInterval(timer);
  }, [isGenerating, isGeneratingMore]);

  /* Concierge Chat State - messages array tracking conversation history */
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string; time: string; isError?: boolean; retryPrompt?: string }[]
  >(() => {
    return [
      {
        role: "assistant",
        content:
          wardrobe.length === 0
            ? `Welcome to PN Outfit Suggester, ${user.name}. Your digital wardrobe currently has 0 items. You can upload photos of your garments or ask me for advice on color coordination, capsule building, or general styling.`
            : `Hello ${user.name}. I am your PN AI Stylist. I have access to your ${wardrobe.length} catalogued pieces and environmental conditions. You can ask for personalized outfit recommendations (which I will format with exact pieces) or general styling advice, and we can interactively refine looks together.`,
        time: "Just now",
      },
    ];
  });
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const handleResetChat = () => {
    setChatError(null);
    setMessages([
      {
        role: "assistant",
        content: `Conversation reset. How can I assist with your styling or wardrobe today, ${user.name}?`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };
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
    generateMore = false,
  ) => {
    if (e) e.preventDefault();
    const promptToUse = overridePrompt !== undefined ? overridePrompt : naturalQuery;
    setLastUsedPrompt(promptToUse);
    setGenerationError(null);
    if (generateMore) {
      setIsGeneratingMore(true);
    } else {
      setIsGenerating(true);
    }
    setSelectedLookIndex(0);
    try {
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
        generateMultipleLooks: generateMore,
        userProfile: user.profile,
      };
      const result = await aiStylistService.generateOutfitRecommendation(
        request,
        wardrobe,
      );
      setGenerationResult(result);
      setGenerationError(null);
      showToast({
        title: generateMore ? "3 Distinct Looks Synthesized" : "Curated Look Synthesized",
        description: `Generated tailored ensemble with ${result.confidenceScore || 96}% styling score.`,
        type: "success",
      });
    } catch (err: any) {
      console.error("AI Stylist generation failed:", err);
      const errorMsg = err.message || "Stylist temporarily unavailable. Please verify your connection or try again.";
      setGenerationError(errorMsg);
      showToast({
        title: "Stylist temporarily unavailable",
        description: "Encountered a temporary issue connecting to the styling engine. Click retry to attempt again.",
        type: "error",
      });
    } finally {
      setIsGenerating(false);
      setIsGeneratingMore(false);
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
              lookType: "SAFE & REFINED",
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
  const handleSendChatMessage = async (e: React.FormEvent | string) => {
    if (typeof e !== "string") {
      e.preventDefault();
    }
    const userText = typeof e === "string" ? e : chatInput.trim();
    if (!userText || isChatLoading) return;
    setChatError(null);
    const newMsg = {
      role: "user" as const,
      content: userText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setChatInput("");
    setIsChatLoading(true);
    try {
      const reply = await aiStylistService.chatConcierge({
        message: userText,
        conversationHistory: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        wardrobePool: wardrobe,
        weather: weatherDescription,
        location: location || user.location || "Unknown",
        time: time || new Date().toLocaleTimeString(),
        date: date || new Date().toLocaleDateString(),
      });
      setChatError(null);
      setMessages((prev) => [
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
    } catch (error: any) {
      console.error(error);
      const errMsg = error.message || "Stylist temporarily unavailable";
      setChatError(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Stylist temporarily unavailable. We encountered a connection issue with the AI stylist engine. Please try again.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isError: true,
          retryPrompt: userText,
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
            {/* Soft background glow - GPU safe */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-700 ${isChatLoading || isGenerating || isGeneratingMore ? "bg-emerald-100 scale-125" : "bg-emerald-50 scale-100"}`}
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
              {/* Profile Calibration Status Indicator */}
              {user.profile?.isCompleted && (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-950 leading-tight">
                    <span className="font-semibold block">Personalized Palette & Proportions</span>
                    <span className="text-emerald-700 text-[11px]">
                      {user.profile.visualAnalysis?.skinTone ? `${user.profile.visualAnalysis.skinTone} undertone` : 'Custom palette'} · {user.profile.visualAnalysis?.faceShape ? `${user.profile.visualAnalysis.faceShape} face` : 'Tailored collars'} · {user.profile.preferredFit} fit
                    </span>
                  </div>
                </div>
              )}
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
              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isGenerating}
                  className="w-full rounded-2xl py-3 justify-center shadow-sm"
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Generate Curated Look
                </Button>
              </div>
            </form>
            {/* Right Column: 3 Looks Display & Details (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {isGenerating ? (
                <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 text-center shadow-sm space-y-6">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900 font-editorial">
                      {STYLING_STAGES[generatingStage]?.label || "Styling Your Look..."}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                      {STYLING_STAGES[generatingStage]?.subtext || "Calibrating silhouette drape, textile harmonies, and occasion criteria."}
                    </p>
                  </div>
                  {/* Staged Progress Indicator */}
                  <div className="max-w-xs mx-auto space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                      <span>Step {generatingStage + 1} of 4</span>
                      <span>{Math.round(((generatingStage + 1) / 4) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${((generatingStage + 1) / 4) * 100}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {STYLING_STAGES.map((s, idx) => (
                        <div
                          key={s.label}
                          className={`h-1 rounded-full transition-all ${
                            idx <= generatingStage ? "bg-emerald-600" : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : generationError ? (
                /* User-Friendly Error State */
                <div className="bg-white rounded-3xl border border-rose-100 p-10 sm:p-12 text-center shadow-sm space-y-5 bg-gradient-to-b from-white to-rose-50/20">
                  <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 font-editorial">
                      Stylist temporarily unavailable
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                      {generationError || "We were unable to connect to the AI styling engine to generate your outfits. Your digital wardrobe is safe."}
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <Button
                      variant="primary"
                      onClick={() => handleGenerate(undefined, lastUsedPrompt)}
                      className="rounded-2xl px-6"
                      leftIcon={<RotateCcw className="w-4 h-4" />}
                    >
                      Retry Styling
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setGenerationError(null)}
                      className="rounded-2xl px-5 text-xs text-gray-600"
                    >
                      Dismiss
                    </Button>
                  </div>
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
                    <strong>"Generate Curated Look"</strong>. Our AI stylist
                    will create tailored looks using exclusively your
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
                  {/* Option to Generate 3 Looks when only 1 is loaded */}
                  {availableLooks.length <= 1 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 font-editorial">
                          Primary Curated Look Ready
                        </h4>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Want more variety? Generate 3 distinct styling options (Safe & Refined, Modern, and Statement).
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        isLoading={isGeneratingMore}
                        onClick={() => handleGenerate(undefined, undefined, true)}
                        leftIcon={<Layers className="w-3.5 h-3.5" />}
                        className="shrink-0 bg-white hover:bg-emerald-50 border-emerald-300 text-emerald-800"
                      >
                        Explore 3 Styled Looks
                      </Button>
                    </div>
                  )}
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
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent && !parent.querySelector('.fallback-icon')) {
                                          const fallback = document.createElement('div');
                                          fallback.className = 'w-full h-full flex flex-col items-center justify-center text-gray-400 p-2 text-center fallback-icon';
                                          fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-1"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg><span class="text-[10px]">Suggested</span>';
                                          parent.appendChild(fallback);
                                        }
                                      }}
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
                      {(outfit.items || []).slice(0, 4).map((piece, pIdx) => {
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
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent && !parent.querySelector('.fallback-icon')) {
                                    const fallback = document.createElement('div');
                                    fallback.className = 'w-full h-full flex items-center justify-center text-gray-400 fallback-icon';
                                    fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>';
                                    parent.appendChild(fallback);
                                  }
                                }}
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
      {/* ========================================== */}
      {/* TAB 3: CONCIERGE CHAT */}
      {/* ========================================== */}
      {activeTab === "concierge" && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
          {/* Concierge Chat Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-semibold text-xs tracking-wider">
                PN
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900 font-editorial">
                    PN AI Stylist Concierge
                  </h3>
                  <Badge variant="gold" size="sm">
                    Interactive Buffer
                  </Badge>
                </div>
                <p className="text-[11px] text-gray-500">
                  Dual-Mode: General Styling + Wardrobe-Specific Recommendations
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetChat}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              title="Reset conversation buffer"
            >
              Reset Chat
            </Button>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 max-w-2xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-gray-900 text-white " : "bg-emerald-50 text-emerald-600 font-semibold text-xs "}`}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    "PN"
                  )}
                </div>
                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white"
                      : msg.isError
                        ? "bg-rose-50/80 text-rose-900 border border-rose-200"
                        : "bg-gray-50 text-gray-800 border border-gray-200/60 "
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="space-y-2">
                      <div className="markdown-body prose prose-sm max-w-none">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                      {msg.isError && msg.retryPrompt && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleSendChatMessage(msg.retryPrompt!)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-[11px] font-medium transition shadow-sm"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Retry Request</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="whitespace-pre-line">{msg.content}</p>
                  )}
                  <span
                    className={`block text-[10px] mt-2 ${
                      msg.role === "user"
                        ? "text-emerald-200"
                        : msg.isError
                          ? "text-rose-400"
                          : "text-gray-400 "
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex gap-3 max-w-xl">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="rounded-2xl p-4 bg-gray-50 border border-gray-200/60 text-xs text-gray-500 flex items-center gap-2">
                  <span>Concierge is crafting structured recommendation...</span>
                </div>
              </div>
            )}
          </div>
          {/* Suggested Chat Prompts & Follow-Up Refinements */}
          <div className="px-6 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              {(messages.length > 2
                ? [
                    "Make this outfit more formal",
                    "Make it more casual",
                    "Swap the footwear",
                    "Add an outerwear layer",
                    "Give me an alternative look",
                    "What accessories would elevate this?",
                  ]
                : [
                    "Style me for tonight",
                    "What should I wear today?",
                    "Make this outfit more formal",
                    "What goes with navy trousers?",
                    "Help me choose colours",
                  ]
              ).map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendChatMessage(prompt)}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-full text-[11px] font-medium transition-colors border border-emerald-100"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendChatMessage}
            className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-2"
          >
            <Input
              placeholder="Ask anything about styling, colors, fabric pairing, or specific pieces..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!chatInput.trim() || isChatLoading}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Send
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

export function StylistPage() {
  return (
    <ErrorBoundary
      fallbackTitle="Stylist temporarily unavailable"
      fallbackMessage="We encountered an unexpected issue while loading the AI Stylist workspace. Your wardrobe catalog and saved outfits remain safe. Please click retry to reload."
    >
      <StylistPageContent />
    </ErrorBoundary>
  );
}

