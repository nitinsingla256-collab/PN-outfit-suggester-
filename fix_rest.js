import fs from 'fs';
let ws = fs.readFileSync('src/services/wardrobeService.ts', 'utf8');
ws = ws.replace(/i\.seasons\.includes\(options\.season as any\)/g, 'i.seasons.includes(options.season as string)');
ws = ws.replace(/i\.occasions\?\.includes\(options\.occasion as any\)/g, 'i.occasions?.includes(options.occasion as string)');
fs.writeFileSync('src/services/wardrobeService.ts', ws);

let os = fs.readFileSync('src/services/outfitService.ts', 'utf8');
os = os.replace(/o\.seasons\.includes\(options\.season as any\)/g, 'o.seasons.includes(options.season as string)');
os = os.replace(/o\.occasions\?\.includes\(options\.occasion as any\)/g, 'o.occasions?.includes(options.occasion as string)');
fs.writeFileSync('src/services/outfitService.ts', os);

// Fix isAuthenticated
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
code = code.replace(/const session = \{ user: authService\.getCurrentUser\(\), token: authService\.getToken\(\) \};/g, `const session = { user: authService.getCurrentUser(), token: authService.getToken(), isAuthenticated: authService.isAuthenticated() };`);
fs.writeFileSync('src/context/AppContext.tsx', code);
