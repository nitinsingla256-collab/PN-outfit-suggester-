import fs from 'fs';
import path from 'path';

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

function patchFile(filepath) {
  let code = fs.readFileSync(filepath, 'utf8');
  if (code.includes('safeLocalStorage')) return; // already patched
  if (!code.includes('localStorage.')) return;
  
  // Find a good place to inject helper, after imports
  const lines = code.split('\n');
  let lastImport = -1;
  for(let i=0; i<lines.length; i++) {
     if(lines[i].startsWith('import ')) lastImport = i;
  }
  
  lines.splice(lastImport + 1, 0, helper);
  code = lines.join('\n');
  
  code = code.replace(/localStorage\.getItem/g, 'safeLocalStorage.getItem');
  code = code.replace(/localStorage\.setItem/g, 'safeLocalStorage.setItem');
  code = code.replace(/localStorage\.removeItem/g, 'safeLocalStorage.removeItem');
  
  fs.writeFileSync(filepath, code);
  console.log("Patched", filepath);
}

const dir = 'src/services';
fs.readdirSync(dir).forEach(file => {
  if(file.endsWith('.ts')) {
     patchFile(path.join(dir, file));
  }
});
patchFile('src/context/AppContext.tsx');
patchFile('src/pages/HomePage.tsx');
patchFile('src/pages/AdminPage.tsx');
patchFile('src/components/ui/WeatherWidget.tsx');
patchFile('src/components/home/SeasonalTrendsSection.tsx');
