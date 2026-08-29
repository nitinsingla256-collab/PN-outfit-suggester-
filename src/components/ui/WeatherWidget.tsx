import React, { useEffect, useState } from 'react';
import { weatherService, WeatherData } from '../../services/weatherService';
import { CloudSun, CloudRain, Snowflake, Wind, MapPin, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';

export function WeatherWidget({ className = '' }: { className?: string }) {
  const { user } = useApp();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function fetchWeather() {
      setLoading(true);
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const { latitude, longitude } = pos.coords;
              const data = await weatherService.getWeatherForCoords(latitude, longitude, 'Current Location');
              if (mounted) setWeather(data);
            },
            async () => {
              // fallback
              const loc = user?.location || 'New York';
              const data = await weatherService.geocodeAndGetWeather(loc);
              if (mounted) setWeather(data);
            }
          );
        } else {
          const loc = user?.location || 'New York';
          const data = await weatherService.geocodeAndGetWeather(loc);
          if (mounted) setWeather(data);
        }
      } catch (err) {
        console.error('Weather error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchWeather();
    return () => { mounted = false; };
  }, [user?.location]);

  if (loading) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 shadow-xl ${className}`}>
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200/20"></div>
          <div className="space-y-2">
            <div className="h-6 w-16 bg-gray-200/20 rounded"></div>
            <div className="h-4 w-24 bg-gray-200/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl bg-white/40 backdrop-blur-2xl border border-white/40 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ${className}`}
    >
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-300/30 blur-3xl rounded-full pointer-events-none"></div>
      
      <div className="flex items-center justify-between pb-2 border-b border-white/20 mb-3">
        <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800/70 flex items-center gap-1.5">
          <MapPin className="w-3 h-3" />
          {weather.locationName || 'Live Location'}
        </span>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-3 h-3 text-emerald-500/50" />
        </motion.div>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="p-3 rounded-2xl bg-gradient-to-br from-white/60 to-white/20 shadow-inner border border-white/50 text-emerald-600 backdrop-blur-md"
        >
          {weather.isRaining ? <CloudRain className="w-7 h-7" /> : weather.condition === 'Snow' ? <Snowflake className="w-7 h-7" /> : <CloudSun className="w-7 h-7" />}
        </motion.div>
        <div>
          <div className="text-3xl font-black text-gray-900 tracking-tighter drop-shadow-sm">
            {weather.temperatureCelsius}°
          </div>
          <div className="text-xs font-semibold text-gray-700/80 capitalize">
            {weather.condition} {weather.feelsLikeCelsius ? `· Feels like ${weather.feelsLikeCelsius}°` : ''}
          </div>
        </div>
      </div>
      
      <div className="pt-3 border-t border-white/20 mt-3 flex items-center justify-between text-[11px] font-medium text-gray-600/80">
        <span className="flex items-center gap-1"><Wind className="w-3 h-3"/> {weather.windSpeed || 0} km/h</span>
        <span className="text-emerald-700/80 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Active Weather</span>
      </div>
    </motion.div>
  );
}
