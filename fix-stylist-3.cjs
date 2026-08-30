const fs = require('fs');
let code = fs.readFileSync('src/pages/StylistPage.tsx', 'utf8');

const regex = /const handleAutoWeather = async \(\) => \{[\s\S]*?setIsWeatherLoading\(false\);\n\s*\}\n  \};\n/m;

const replacement = `const handleAutoWeather = async () => {
    setIsWeatherLoading(true);
    try {
      /* Automatic time of day */
      const hour = new Date().getHours();
      let timeOfDay = "Morning";
      if (hour >= 12 && hour < 17) timeOfDay = "Afternoon";
      else if (hour >= 17 && hour < 21) timeOfDay = "Evening";
      else if (hour >= 21 || hour < 5) timeOfDay = "Night";
      setTime(
        \`Automatic — \${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (\${timeOfDay})\`
      );

      let data;
      if (!location.trim() || location === 'Current Location') {
        data = await weatherService.getAutoLocationWeather(user.location || "Chandigarh");
      } else {
        /* Use manually entered location */
        const searchLoc = location.trim() || user.location || "Chandigarh";
        data = await weatherService.geocodeAndGetWeather(searchLoc);
      }
      
      setWeatherDescription(data.condition);
      setTemperatureCelsius(data.temperatureCelsius);
      setLocation(data.locationName);
      setLastWeatherUpdate(new Date().toLocaleTimeString());
      setIsWeatherLoading(false);
    } catch (err) {
      console.error(err);
      setIsWeatherLoading(false);
    }
  };
`;

code = code.replace(/const handleAutoWeather = async \(\) => \{[\s\S]*?setIsWeatherLoading\(false\);\n\s*\}\n\s*\};\n/m, replacement);
fs.writeFileSync('src/pages/StylistPage.tsx', code);
