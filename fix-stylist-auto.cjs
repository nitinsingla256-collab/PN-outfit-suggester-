const fs = require('fs');

let code = fs.readFileSync('src/pages/StylistPage.tsx', 'utf8');

code = code.replace(/if \(navigator\.geolocation && !location\.trim\(\)\) {[\s\S]*?setIsWeatherLoading\(false\);\n\s*}/, `if (!location.trim()) {
        const data = await weatherService.getAutoLocationWeather(user.location || "Chandigarh");
        setWeatherDescription(data.condition);
        setTemperatureCelsius(data.temperatureCelsius);
        setLocation(data.locationName);
        setLastWeatherUpdate(new Date().toLocaleTimeString());
        setIsWeatherLoading(false);
      } else {
        /* Use manually entered location */
        const searchLoc = location.trim() || user.location || "Chandigarh";
        const data = await weatherService.geocodeAndGetWeather(searchLoc);
        setWeatherDescription(data.condition);
        setTemperatureCelsius(data.temperatureCelsius);
        setLocation(data.locationName);
        setLastWeatherUpdate(new Date().toLocaleTimeString());
        setIsWeatherLoading(false);
      }`);

fs.writeFileSync('src/pages/StylistPage.tsx', code);
