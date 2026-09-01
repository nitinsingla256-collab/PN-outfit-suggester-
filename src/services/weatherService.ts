

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

export interface WeatherData {
  temperatureCelsius: number;
  feelsLikeCelsius?: number;
  condition: string;
  isRaining: boolean;
  humidity?: number;
  windSpeed?: number;
  lastUpdated: string;
  locationName: string;
}

// In-memory weather cache
const weatherMemoryCache: Record<string, { data: WeatherData; timestamp: number }> = {};
const CACHE_TTL_MS = 25 * 60 * 1000; // 25 minutes

function getCachedWeather(key: string): WeatherData | null {
  try {
    const mem = weatherMemoryCache[key];
    if (mem && Date.now() - mem.timestamp < CACHE_TTL_MS) {
      return mem.data;
    }
    const local = localStorage.getItem(`pn_weather_${key}`);
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed && Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        weatherMemoryCache[key] = parsed;
        return parsed.data;
      }
    }
  } catch {}
  return null;
}

function setCachedWeather(key: string, data: WeatherData) {
  try {
    const entry = { data, timestamp: Date.now() };
    weatherMemoryCache[key] = entry;
    localStorage.setItem(`pn_weather_${key}`, JSON.stringify(entry));
  } catch {}
}

const DEFAULT_WEATHER_FALLBACK: WeatherData = {
  temperatureCelsius: 21,
  feelsLikeCelsius: 21,
  condition: 'Clear',
  isRaining: false,
  windSpeed: 8,
  lastUpdated: new Date().toISOString(),
  locationName: 'Paris Atelier',
};

export const weatherService = {
  async getWeatherForCoords(
    lat: number,
    lon: number,
    locationName: string,
  ): Promise<WeatherData> {
    const cacheKey = `coords_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const cached = getCachedWeather(cacheKey);
    if (cached) return cached;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m&timezone=auto`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("Failed to fetch weather");

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid weather response format");
      }
      const current = data.current;

      const isRaining =
        current.precipitation > 0 || current.rain > 0 || current.showers > 0;
      let condition = "Clear";
      if (current.cloud_cover > 80) condition = "Overcast";
      else if (current.cloud_cover > 50) condition = "Cloudy";
      else if (current.cloud_cover > 20) condition = "Partly Cloudy";

      if (isRaining) condition = "Rain";
      if (current.snowfall > 0) condition = "Snow";

      const weatherResult: WeatherData = {
        temperatureCelsius: Math.round(current.temperature_2m),
        feelsLikeCelsius: Math.round(current.apparent_temperature),
        condition,
        isRaining,
        windSpeed: current.wind_speed_10m,
        lastUpdated: new Date().toISOString(),
        locationName,
      };

      setCachedWeather(cacheKey, weatherResult);
      return weatherResult;
    } catch (err) {
      console.warn("Weather API notice:", err);
      // Return sensible fallback rather than crashing or freezing
      return {
        ...DEFAULT_WEATHER_FALLBACK,
        locationName: locationName || 'Current Location',
      };
    }
  },

  async getAutoLocationWeather(fallbackLocation: string): Promise<WeatherData> {
    const normKey = (fallbackLocation || 'auto_default').toLowerCase().trim();
    const cached = getCachedWeather(normKey);
    if (cached) return cached;

    return new Promise((resolve) => {
      let resolved = false;

      const finish = (result: WeatherData) => {
        if (!resolved) {
          resolved = true;
          setCachedWeather(normKey, result);
          resolve(result);
        }
      };

      // Safety timeout: Never hold up UI for more than 1500ms
      const safetyTimer = setTimeout(() => {
        finish({
          ...DEFAULT_WEATHER_FALLBACK,
          locationName: fallbackLocation || 'London',
        });
      }, 1500);

      const runFallback = async () => {
        try {
          const data = await this.geocodeAndGetWeather(fallbackLocation || "London");
          clearTimeout(safetyTimer);
          finish(data);
        } catch {
          clearTimeout(safetyTimer);
          finish({
            ...DEFAULT_WEATHER_FALLBACK,
            locationName: fallbackLocation || 'London',
          });
        }
      };

      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { latitude, longitude } = pos.coords;
              const data = await this.getWeatherForCoords(
                latitude,
                longitude,
                "Current Location",
              );
              clearTimeout(safetyTimer);
              finish(data);
            } catch {
              runFallback();
            }
          },
          () => {
            runFallback();
          },
          { timeout: 1200, maximumAge: 600000 },
        );
      } else {
        runFallback();
      }
    });
  },

  async geocodeAndGetWeather(cityName: string): Promise<WeatherData> {
    const normName = cityName.trim().toLowerCase();
    const cached = getCachedWeather(`city_${normName}`);
    if (cached) return cached;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (!geoRes.ok) throw new Error("Geocoding failed");
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        return {
          ...DEFAULT_WEATHER_FALLBACK,
          locationName: cityName,
        };
      }

      const { latitude, longitude, name, admin1, country } = geoData.results[0];
      const fullName = admin1 ? `${name}, ${admin1}` : `${name}, ${country}`;

      const res = await this.getWeatherForCoords(latitude, longitude, fullName);
      setCachedWeather(`city_${normName}`, res);
      return res;
    } catch (err) {
      console.warn("Geocoding/Weather fallback notice:", err);
      return {
        ...DEFAULT_WEATHER_FALLBACK,
        locationName: cityName,
      };
    }
  },
};
