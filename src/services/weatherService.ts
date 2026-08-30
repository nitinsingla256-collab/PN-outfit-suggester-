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

export const weatherService = {
  async getWeatherForCoords(
    lat: number,
    lon: number,
    locationName: string,
  ): Promise<WeatherData> {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m&timezone=auto`,
      );
      if (!res.ok) throw new Error("Failed to fetch weather");

      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        if (!res.ok) {
          throw new Error(
            "Server returned an error: " + res.status + " " + res.statusText,
          );
        }
        throw new Error(
          "Received unexpected response format from server (possibly 502/503 from the platform proxy).",
        );
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

      return {
        temperatureCelsius: Math.round(current.temperature_2m),
        feelsLikeCelsius: Math.round(current.apparent_temperature),
        condition,
        isRaining,
        windSpeed: current.wind_speed_10m,
        lastUpdated: new Date().toISOString(),
        locationName,
      };
    } catch (err) {
      console.error("Weather API error:", err);
      throw err;
    }
  },

  async getAutoLocationWeather(fallbackLocation: string): Promise<WeatherData> {
    return new Promise((resolve, reject) => {
      const getFallback = async () => {
        let loc = fallbackLocation || "New York";
        try {
          const ipRes = await fetch("https://ipapi.co/json/");
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData.city && ipData.country_name) {
              loc = `${ipData.city}, ${ipData.country_name}`;
            }
          }
        } catch (e) {}
        try {
          const data = await this.geocodeAndGetWeather(loc);
          resolve(data);
        } catch (err) {
          reject(err);
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
              resolve(data);
            } catch (err) {
              getFallback();
            }
          },
          () => {
            getFallback();
          },
          { timeout: 5000 },
        );
      } else {
        getFallback();
      }
    });
  },
  async geocodeAndGetWeather(cityName: string): Promise<WeatherData> {
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`,
      );
      if (!geoRes.ok) throw new Error("Geocoding failed");
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found");
      }

      const { latitude, longitude, name, admin1, country } = geoData.results[0];
      const fullName = admin1 ? `${name}, ${admin1}` : `${name}, ${country}`;

      return await this.getWeatherForCoords(latitude, longitude, fullName);
    } catch (err) {
      console.error("Geocoding/Weather error:", err);
      throw err;
    }
  },
};
