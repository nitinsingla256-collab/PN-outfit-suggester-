import fs from 'fs';

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  if (code.includes('const safeLocalStorage = {')) {
     code = code.replace(/const safeLocalStorage = \{[\s\S]*?removeItem\(key: string\): void \{\n    try \{ safeLocalStorage.removeItem\(key\); \} catch \(e\) \{\}\n  \}\n\};\n/m, '');
     // remove the broken 'import {' prefix if we appended inside it
     code = code.replace(/import\s*\{\s*$/, '');
  }
  
  // Re-inject safely at the top
  const helper = `
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
`;
  code = code.replace('/**\n * @license\n * SPDX-License-Identifier: Apache-2.0\n */\n', '/**\n * @license\n * SPDX-License-Identifier: Apache-2.0\n */\n' + helper);
  
  // Actually wait, my patch script replaced `localStorage.getItem` with `safeLocalStorage.getItem`
  // But wait! Look at the output of head:
  // try { return safeLocalStorage.getItem(key); } catch (e) { return null; }
  // It replaced the `localStorage` inside the helper itself!!!
  code = code.replace(/return safeLocalStorage\.getItem/g, 'return localStorage.getItem');
  code = code.replace(/try \{ safeLocalStorage\.setItem/g, 'try { localStorage.setItem');
  code = code.replace(/try \{ safeLocalStorage\.removeItem/g, 'try { localStorage.removeItem');
  
  fs.writeFileSync(file, code);
}

['src/pages/HomePage.tsx', 'src/pages/AdminPage.tsx', 'src/components/ui/WeatherWidget.tsx', 'src/components/home/SeasonalTrendsSection.tsx', 'src/context/AppContext.tsx', 'src/services/aiStylistService.ts', 'src/services/outfitService.ts', 'src/services/plannerService.ts', 'src/services/wardrobeService.ts', 'src/services/weatherService.ts'].forEach(fixFile);
