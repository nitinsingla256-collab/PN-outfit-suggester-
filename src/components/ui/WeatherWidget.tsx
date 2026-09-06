import React, { useEffect, useState } from "react";
import { weatherService, WeatherData } from "../../services/weatherService";
import {
  CloudSun,
  CloudRain,
  Snowflake,
  Wind,
  MapPin,
  Sparkles,
} from "lucide-react";

import { useApp } from "../../context/AppContext";



export function WeatherWidget({ className = "" }: { className?: string }) {
  const { user } = useApp();
  const [weather, setWeather] = useState<WeatherData | null>(() => {
    try {
      const locKey = (user?.location || 'auto_default').toLowerCase().trim();
      const local = localStorage.getItem(`pn_weather_${locKey}`);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed?.data && typeof parsed.data === 'object' && typeof parsed.data.temperatureCelsius === 'number') {
          return parsed.data;
        }
      }
    } catch {}
    return {
      temperatureCelsius: 0,
      feelsLikeCelsius: 0,
      condition: "Loading...",
      isRaining: false,
      windSpeed: 0,
      lastUpdated: new Date().toISOString(),
      locationName: user?.location || "Location not set",
    };
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchWeather() {
      try {
        const data = await weatherService.getAutoLocationWeather(
          user?.location || undefined,
        );
        if (mounted) setWeather(data);
      } catch (err) {
        console.warn("Weather notice:", err);
      }
    }

    fetchWeather();
    return () => {
      mounted = false;
    };
  }, [user?.location]);

  if (!weather) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white/90 border border-slate-200/80 p-5 shadow-sm ${className}`}
    >
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-gradient-to-bl from-emerald-200/40 to-transparent rounded-full pointer-events-none"></div>

      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
        <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800/80 flex items-center gap-1.5">
          <MapPin className="w-3 h-3" />
          {weather.locationName || "Location not set"}
        </span>
        <div>
          <Sparkles className="w-3 h-3 text-emerald-500/50" />
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <div
          className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100/80 text-emerald-600 shadow-xs"
        >
          {weather.isRaining ? (
            <CloudRain className="w-7 h-7" />
          ) : weather.condition === "Snow" ? (
            <Snowflake className="w-7 h-7" />
          ) : (
            <CloudSun className="w-7 h-7" />
          )}
        </div>
        <div>
          <div className="text-3xl font-black text-gray-900 tracking-tighter drop-shadow-sm">
            {weather.temperatureCelsius}°
          </div>
          <div className="text-xs font-semibold text-gray-700/80 capitalize">
            {weather.condition}{" "}
            {weather.feelsLikeCelsius
              ? `· Feels like ${weather.feelsLikeCelsius}°`
              : ""}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-white/20 mt-3 flex items-center justify-between text-[11px] font-medium text-gray-600/80">
        <span className="flex items-center gap-1">
          <Wind className="w-3 h-3" /> {weather.windSpeed || 0} km/h
        </span>
        <span className="text-emerald-700/80 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
          Active Weather
        </span>
      </div>
    </div>
  );
}
