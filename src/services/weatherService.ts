/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes

function getCachedWeather(key: string): WeatherData | null {
  try {
    const mem = weatherMemoryCache[key];
    if (mem && mem.data && typeof mem.timestamp === 'number' && Date.now() - mem.timestamp < CACHE_TTL_MS) {
      return mem.data;
    }
    const local = localStorage.getItem(`pn_weather_${key}`);
    if (local) {
      const parsed = JSON.parse(local);
      if (
        parsed &&
        parsed.data &&
        typeof parsed.data === 'object' &&
        typeof parsed.timestamp === 'number' &&
        Date.now() - parsed.timestamp < CACHE_TTL_MS
      ) {
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

export const weatherService = {
  /**
   * Fetch weather forecast for exact coordinates
   */
  async getWeatherForCoords(
    lat: number,
    lon: number,
    locationName: string
  ): Promise<WeatherData> {
    const cacheKey = `coords_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const cached = getCachedWeather(cacheKey);
    if (cached) return cached;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m&timezone=auto`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error('Weather service unavailable');

      const data = await res.json();
      const current = data?.current;
      if (!current || typeof current.temperature_2m !== 'number') {
        throw new Error('Incomplete weather telemetry');
      }

      const isRaining =
        (current.precipitation || 0) > 0 || (current.rain || 0) > 0 || (current.showers || 0) > 0;
      let condition = 'Clear';
      if ((current.cloud_cover || 0) > 80) condition = 'Overcast';
      else if ((current.cloud_cover || 0) > 50) condition = 'Cloudy';
      else if ((current.cloud_cover || 0) > 20) condition = 'Partly Cloudy';

      if (isRaining) condition = 'Rain';
      if ((current.snowfall || 0) > 0) condition = 'Snow';

      const weatherResult: WeatherData = {
        temperatureCelsius: Math.round(current.temperature_2m),
        feelsLikeCelsius: Math.round(current.apparent_temperature ?? current.temperature_2m),
        condition,
        isRaining,
        windSpeed: current.wind_speed_10m || 0,
        lastUpdated: new Date().toISOString(),
        locationName: locationName || 'Current Location',
      };

      setCachedWeather(cacheKey, weatherResult);
      return weatherResult;
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  },

  /**
   * Reverse-geocode coordinates to get human city name
   */
  async reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      if (res.ok) {
        const data = await res.json();
        const city = data.city || data.locality || data.principalSubdivision;
        const country = data.countryName;
        if (city && country) return `${city}, ${country}`;
        if (city) return city;
      }
    } catch {}
    return 'Current Location';
  },

  /**
   * Get device location via browser Geolocation API
   */
  async getDeviceLocationAndWeather(): Promise<WeatherData> {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return reject(new Error('Geolocation is not supported by your browser'));
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const locationName = await this.reverseGeocode(latitude, longitude);
            const weather = await this.getWeatherForCoords(latitude, longitude, locationName);
            resolve(weather);
          } catch (err) {
            reject(err);
          }
        },
        (error) => {
          let message = 'Location permission unavailable';
          if (error.code === error.PERMISSION_DENIED) {
            message = 'Location permission denied';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'Location information unavailable';
          } else if (error.code === error.TIMEOUT) {
            message = 'Location request timed out';
          }
          reject(new Error(message));
        },
        { timeout: 8000, maximumAge: 300000, enableHighAccuracy: false }
      );
    });
  },

  /**
   * Geocode a user-provided city name and fetch its live weather
   */
  async geocodeAndGetWeather(cityName: string): Promise<WeatherData> {
    const cleanName = cityName.trim();
    if (!cleanName) {
      throw new Error('Please provide a city name');
    }

    const normKey = cleanName.toLowerCase();
    const cached = getCachedWeather(`city_${normKey}`);
    if (cached) return cached;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanName)}&count=1&language=en&format=json`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (!geoRes.ok) throw new Error('Geocoding service unavailable');
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(`Could not find location "${cleanName}". Please check the spelling.`);
      }

      const { latitude, longitude, name, admin1, country } = geoData.results[0];
      const fullName = admin1 ? `${name}, ${admin1}` : country ? `${name}, ${country}` : name;

      const weather = await this.getWeatherForCoords(latitude, longitude, fullName);
      setCachedWeather(`city_${normKey}`, weather);
      return weather;
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  },

  /**
   * Automatically resolve location & weather:
   * 1. If explicit location string provided, geocode that city
   * 2. Try browser geolocation
   * 3. Fallback to IP-based approximate location
   * 4. Safe fallback to default coordinates
   */
  async getAutoLocationWeather(preferredLocation?: string): Promise<WeatherData> {
    if (preferredLocation && preferredLocation.trim() && preferredLocation !== 'Current Location' && preferredLocation !== 'Location not set' && preferredLocation !== 'City Central') {
      try {
        return await this.geocodeAndGetWeather(preferredLocation.trim());
      } catch (e) {
        console.warn('Geocoding preferred location failed, attempting device location:', e);
      }
    }

    try {
      return await this.getDeviceLocationAndWeather();
    } catch (e) {
      console.warn('Device geolocation unavailable, attempting IP location:', e);
    }

    // Try IP-based location lookup
    try {
      const ipRes = await fetch('https://ipapi.co/json/');
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData.latitude && ipData.longitude) {
          const locName = ipData.city ? `${ipData.city}, ${ipData.country_name || ''}` : 'Local Region';
          return await this.getWeatherForCoords(ipData.latitude, ipData.longitude, locName);
        }
      }
    } catch (e) {
      console.warn('IP geolocation unavailable:', e);
    }

    // Default neutral fallback (Mild temperate climate)
    return {
      temperatureCelsius: 20,
      feelsLikeCelsius: 20,
      condition: 'Clear',
      isRaining: false,
      windSpeed: 8,
      lastUpdated: new Date().toISOString(),
      locationName: preferredLocation || 'Local Region',
    };
  },
};
