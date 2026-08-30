const fs = require('fs');

let code = fs.readFileSync('src/services/weatherService.ts', 'utf8');

const newFunc = `
  async getAutoLocationWeather(fallbackLocation: string): Promise<WeatherData> {
    return new Promise((resolve, reject) => {
      const getFallback = async () => {
        let loc = fallbackLocation || 'New York';
        try {
          const ipRes = await fetch('https://ipapi.co/json/');
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData.city && ipData.country_name) {
              loc = \`\${ipData.city}, \${ipData.country_name}\`;
            }
          }
        } catch(e) {}
        try {
          const data = await this.geocodeAndGetWeather(loc);
          resolve(data);
        } catch (err) {
          reject(err);
        }
      };

      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { latitude, longitude } = pos.coords;
              const data = await this.getWeatherForCoords(latitude, longitude, 'Current Location');
              resolve(data);
            } catch (err) {
              getFallback();
            }
          },
          () => {
            getFallback();
          },
          { timeout: 5000 }
        );
      } else {
        getFallback();
      }
    });
  },
`;

code = code.replace(/async geocodeAndGetWeather/, newFunc + '  async geocodeAndGetWeather');
fs.writeFileSync('src/services/weatherService.ts', code);
