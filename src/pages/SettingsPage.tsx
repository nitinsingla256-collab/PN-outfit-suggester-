/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";
import { ThemeMode } from "../types";
import {
  Sparkles,
  Database,
  Download,
  Trash2,
  Globe,
  Ruler,
  ArrowRight,
  Palette,
  Sun,
  Moon,
  CheckCircle2,
  Check,
} from "lucide-react";

export function SettingsPage() {
  const {
    wardrobe,
    outfits,
    plans,
    user,
    theme,
    setTheme,
    clearAllData,
    showToast,
    openMeasurementsModal,
    navigateTo,
    updateUser,
  } = useApp();

  const [currency, setCurrency] = useState(user?.preferences?.currency || "EUR");
  const [units, setUnits] = useState(user?.preferences?.measurementSystem || "Metric (°C, cm)");
  const [stylingRisk, setStylingRisk] = useState(user?.preferences?.stylingRisk || "Curated Classic");

  const handlePreferenceChange = async (key: string, value: string) => {
    if (key === 'currency') setCurrency(value);
    if (key === 'units') setUnits(value);
    if (key === 'stylingRisk') setStylingRisk(value);

    try {
      await updateUser({
        preferences: {
          ...(user?.preferences || {} as any),
          [key === 'units' ? 'measurementSystem' : key]: value,
        },
      });
      showToast({
        title: "Preference Updated",
        description: "Your settings have been saved successfully.",
        type: "success",
      });
    } catch (err) {
      showToast({
        title: "Error",
        description: "Failed to save preference.",
        type: "error",
      });
    }
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    if (newTheme === theme) return;
    setTheme(newTheme);
    showToast({
      title: "Ambiance Updated",
      description: `Switched aesthetic theme to ${newTheme}.`,
      type: "success",
    });
  };

  const handleExportData = () => {
    const payload = {
      brand: "PN",
      user,
      wardrobe,
      outfits,
      plans,
      exportedAt: new Date().toISOString(),
      version: "2.0.0",
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pn-wardrobe-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast({
      title: "Archive Exported",
      description: "Your complete PN wardrobe manifest was downloaded.",
      type: "success",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header */}
      <div className="pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase font-semibold tracking-wider text-emerald-500">
            PN Outfit Suggester
          </span>
          <span className="text-gray-400">·</span>
          <span className="text-xs text-gray-600 font-mono">Preferences</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 font-editorial">
          Settings & Data Management
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Configure regional conventions, Gemini AI stylist sensitivity, and
          digital capsule persistence.
        </p>
      </div>

      <div className="space-y-6">
        {/* Visual Theme & Ambiance Selector */}
        <Card className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-200 gap-2">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-gray-900">
                Visual Theme & Atelier Ambiance
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-gray-500">Active Mode:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono border flex items-center gap-1.5 ${
                theme === 'Midnight Luxury'
                  ? 'bg-slate-900 text-emerald-400 border-emerald-500/40 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {theme === 'Midnight Luxury' ? (
                  <Moon className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Sun className="w-3 h-3 text-amber-500" />
                )}
                {theme}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Select your preferred visual atmosphere. Choose between the default daylight <strong>Light Atelier</strong> and the deep obsidian <strong>Midnight Luxury</strong> dark mode.
          </p>

          {/* Theme Interactive Option Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Light Atelier Option */}
            <div
              onClick={() => handleThemeChange('Light Atelier')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleThemeChange('Light Atelier');
                }
              }}
              className={`relative rounded-2xl p-4.5 border-2 transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                theme === 'Light Atelier'
                  ? 'border-emerald-500 bg-emerald-50/20 shadow-md shadow-emerald-500/5'
                  : 'border-gray-200/80 bg-white hover:border-gray-300 hover:shadow-xs'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      Light Atelier
                    </h4>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                      Default Studio Theme
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  {theme === 'Light Atelier' ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold font-mono text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-gray-500 hover:text-gray-900">
                      Select
                    </span>
                  )}
                </div>
              </div>

              {/* Theme Mockup Visual Preview */}
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-[#F8FAFC] p-3 mb-3 space-y-2 shadow-inner">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-emerald-600 flex items-center justify-center text-[7px] font-serif text-white font-bold">
                      PN
                    </div>
                    <div className="h-2 w-12 bg-slate-300 rounded"></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <div className="rounded-lg bg-white border border-slate-200 p-2 space-y-1 shadow-2xs">
                    <div className="h-2 w-10 bg-emerald-600/70 rounded"></div>
                    <div className="h-1.5 w-14 bg-slate-200 rounded"></div>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200 p-2 space-y-1 shadow-2xs">
                    <div className="h-2 w-8 bg-slate-400 rounded"></div>
                    <div className="h-1.5 w-12 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-gray-600 leading-relaxed">
                Crisp daylight couture ambiance with warm alabaster backgrounds, pristine card surfaces, and high-contrast editorial typography.
              </p>
            </div>

            {/* Midnight Luxury Option */}
            <div
              onClick={() => handleThemeChange('Midnight Luxury')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleThemeChange('Midnight Luxury');
                }
              }}
              className={`relative rounded-2xl p-4.5 border-2 transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                theme === 'Midnight Luxury'
                  ? 'border-emerald-500 bg-slate-900/10 shadow-md shadow-emerald-500/5'
                  : 'border-gray-200/80 bg-white hover:border-gray-300 hover:shadow-xs'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      Midnight Luxury
                    </h4>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                      Dark Mode Theme
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  {theme === 'Midnight Luxury' ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold font-mono text-emerald-400 bg-slate-900 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-gray-500 hover:text-gray-900">
                      Select
                    </span>
                  )}
                </div>
              </div>

              {/* Theme Mockup Visual Preview */}
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#090D16] p-3 mb-3 space-y-2 shadow-inner">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-emerald-500 flex items-center justify-center text-[7px] font-serif text-slate-950 font-bold">
                      PN
                    </div>
                    <div className="h-2 w-12 bg-slate-700 rounded"></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <div className="rounded-lg bg-[#0F172A] border border-slate-800 p-2 space-y-1 shadow-2xs">
                    <div className="h-2 w-10 bg-emerald-400/80 rounded"></div>
                    <div className="h-1.5 w-14 bg-slate-700 rounded"></div>
                  </div>
                  <div className="rounded-lg bg-[#0F172A] border border-slate-800 p-2 space-y-1 shadow-2xs">
                    <div className="h-2 w-8 bg-slate-600 rounded"></div>
                    <div className="h-1.5 w-12 bg-slate-700 rounded"></div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-gray-600 leading-relaxed">
                Nocturnal atelier experience with deep obsidian slate backdrops, velvet dark card surfaces, and luminous emerald luxury accents.
              </p>
            </div>
          </div>

          {/* Fast Toggle Switch Bar */}
          <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-800">Quick Switcher</span>
              <span className="text-[11px] text-gray-500">Toggle active mode instantly</span>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-gray-200">
              <button
                type="button"
                onClick={() => handleThemeChange('Light Atelier')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  theme === 'Light Atelier'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange('Midnight Luxury')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  theme === 'Midnight Luxury'
                    ? 'bg-slate-900 text-emerald-400 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Midnight</span>
              </button>
            </div>
          </div>
        </Card>

        {/* Localization & Display */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Globe className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-semibold text-gray-900">
              Localization & Display
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Valuation Currency"
              value={currency}
              onChange={(e) => handlePreferenceChange('currency', e.target.value)}
            >
              <option value="EUR" className="bg-white">
                EUR (€) - Euro
              </option>
              <option value="USD" className="bg-white">
                USD ($) - US Dollar
              </option>
              <option value="GBP" className="bg-white">
                GBP (£) - British Pound
              </option>
              <option value="JPY" className="bg-white">
                JPY (¥) - Japanese Yen
              </option>
              <option value="CHF" className="bg-white">
                CHF (Fr) - Swiss Franc
              </option>
            </Select>

            <Select
              label="Measurement System"
              value={units}
              onChange={(e) => handlePreferenceChange('units', e.target.value)}
            >
              <option value="Metric (°C, cm)" className="bg-white">
                Metric (°C, cm)
              </option>
              <option value="Imperial (°F, in)" className="bg-white">
                Imperial (°F, in)
              </option>
            </Select>
          </div>
        </Card>

        {/* Body Measurements & Fit Calibration */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-gray-900">
                Body Measurements & Sizing Proportions
              </h3>
            </div>
            {user.measurements?.heightCm && (
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Calibrated
              </span>
            )}
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Configure your height (in feet/inches, centimeters, meters, or inches) and weight (kg or lbs). These measurements enable the AI Stylist to generate proportion-balanced looks tailored to your physical silhouette.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={openMeasurementsModal}
              leftIcon={<Ruler className="w-3.5 h-3.5 text-emerald-600" />}
            >
              Open Measurement Calibration Tool
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo('/profile')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="text-xs text-gray-600 hover:text-gray-900"
            >
              Edit in Full Profile
            </Button>
          </div>
        </Card>

        {/* AI Stylist Engine Settings */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-semibold text-gray-900">
              Gemini AI Stylist Parameters
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Styling Risk & Experimentation"
              value={stylingRisk}
              onChange={(e) => handlePreferenceChange('stylingRisk', e.target.value)}
            >
              <option value="Safe & Minimal" className="bg-white">
                Strictly Minimal & Safe
              </option>
              <option value="Curated Classic" className="bg-white">
                Curated Classic (Recommended)
              </option>
              <option value="Bold Editorial" className="bg-white">
                Bold Editorial / Runway
              </option>
              <option value="Avant-Garde" className="bg-white">
                Experimental Avant-Garde
              </option>
            </Select>

            <div className="flex flex-col justify-between p-3 rounded-xl bg-white border border-gray-200">
              <span className="text-xs font-medium text-gray-800">
                Weather-Adaptive Layering
              </span>
              <span className="text-[11px] text-gray-500">
                Automatically adjust layering recommendations based on forecast
                temperature and precipitation.
              </span>
              <Badge variant="gold" size="sm" className="w-fit mt-1">
                Active
              </Badge>
            </div>
          </div>
        </Card>

        {/* Data Persistence & Reset Controls */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Database className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-semibold text-gray-900">
              Data Management & Persistence
            </h3>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            All pieces, lookbooks, and scheduled outfits are scoped directly to
            your personal user atelier. You can export a portable JSON backup or
            clear your stored inventory.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportData}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export PN Backup (JSON)
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={clearAllData}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Empty All Data
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
