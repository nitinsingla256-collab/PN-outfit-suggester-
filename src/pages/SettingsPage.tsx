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
import { Sparkles, Database, Download, Trash2, Globe } from "lucide-react";

export function SettingsPage() {
  const { wardrobe, outfits, plans, user, clearAllData, showToast } = useApp();

  const [currency, setCurrency] = useState("EUR");
  const [units, setUnits] = useState("Metric (°C, cm)");
  const [stylingRisk, setStylingRisk] = useState("Curated Classic");

  const handleExportData = () => {
    const payload = {
      brand: "PAURVI",
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
    a.download = `paurvi-wardrobe-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast({
      title: "Archive Exported",
      description: "Your complete PAURVI wardrobe manifest was downloaded.",
      type: "success",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header */}
      <div className="pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase font-semibold tracking-wider text-emerald-500">
            PAURVI Atelier
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
              onChange={(e) => setCurrency(e.target.value)}
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
              onChange={(e) => setUnits(e.target.value)}
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
              onChange={(e) => setStylingRisk(e.target.value)}
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
              Export PAURVI Backup (JSON)
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={clearAllData}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Clear Wardrobe State
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
