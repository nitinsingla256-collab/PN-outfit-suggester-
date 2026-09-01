import fs from 'fs';

function restoreLocalStorage(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/safeLocalStorage\.getItem/g, 'localStorage.getItem');
  code = code.replace(/safeLocalStorage\.setItem/g, 'localStorage.setItem');
  code = code.replace(/safeLocalStorage\.removeItem/g, 'localStorage.removeItem');
  fs.writeFileSync(file, code);
}

['src/pages/HomePage.tsx', 'src/pages/AdminPage.tsx', 'src/components/ui/WeatherWidget.tsx', 'src/components/home/SeasonalTrendsSection.tsx', 'src/context/AppContext.tsx', 'src/services/aiStylistService.ts', 'src/services/outfitService.ts', 'src/services/plannerService.ts', 'src/services/wardrobeService.ts', 'src/services/weatherService.ts'].forEach(restoreLocalStorage);
