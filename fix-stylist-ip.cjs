const fs = require('fs');
let code = fs.readFileSync('src/pages/StylistPage.tsx', 'utf8');

const replacement = `          async () => {
            /* Fallback to IP-based location if denied */
            let searchLoc = user.location || "Chandigarh";
            try {
              const ipRes = await fetch("https://ipapi.co/json/");
              if (ipRes.ok) {
                const ipData = await ipRes.json();
                if (ipData.city && ipData.country_name) {
                  searchLoc = \`\${ipData.city}, \${ipData.country_name}\`;
                }
              }
            } catch(e) {}
            const data = await weatherService.geocodeAndGetWeather(searchLoc);
            setWeatherDescription(data.condition);
            setTemperatureCelsius(data.temperatureCelsius);
            setLocation(data.locationName);
            setLastWeatherUpdate(new Date().toLocaleTimeString());
            setIsWeatherLoading(false);
          }`;

// Let's replace the whole async block that starts with /* Fallback to Chandigarh or user location if denied */
code = code.replace(/async \(\) => {\s*\/\* Fallback to Chandigarh or user location if denied \*\/[\s\S]*?setIsWeatherLoading\(false\);\s*\},/, replacement + ',');

fs.writeFileSync('src/pages/StylistPage.tsx', code);
