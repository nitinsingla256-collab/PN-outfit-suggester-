const fs = require('fs');

let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

const replacement = `      setIsGeneratingDaily(true);
      try {
        let weatherDesc = "Unknown Weather";
        let temp = 20;
        try {
          const weatherData = await weatherService.getAutoLocationWeather(user.location || "New York");
          weatherDesc = \`\${weatherData.temperatureCelsius}°C, \${weatherData.condition}\`;
          temp = weatherData.temperatureCelsius;
        } catch (e) {
          console.error("Failed to fetch weather for daily outfit", e);
        }

        const response = await aiStylistService.generateOutfitRecommendation(
          {
            occasion: "Daily Wear",
            stylePreference: user.preferences?.styleVibes?.[0] || "Smart Casual",
            weatherDescription: weatherDesc,
            temperatureCelsius: temp,
            additionalNotes: \`Create a versatile daily look from the wardrobe appropriate for the current weather (\${weatherDesc}).\`,
          },
          wardrobe,
        );`;

code = code.replace(/setIsGeneratingDaily\(true\);\n\s*try \{\n\s*const response = await aiStylistService\.generateOutfitRecommendation\([\s\S]*?wardrobe,\n\s*\);/, replacement);

if (!code.includes('import { weatherService }')) {
  code = code.replace(/import \{ aiStylistService \} from "\.\.\/services\/aiStylistService";/, 'import { aiStylistService } from "../services/aiStylistService";\nimport { weatherService } from "../services/weatherService";');
}

fs.writeFileSync('src/pages/HomePage.tsx', code);
