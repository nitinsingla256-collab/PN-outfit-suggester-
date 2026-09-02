import fs from 'fs';
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// AppContext: resetToDemoItems
code = code.replace(/const samples = await wardrobeService\.resetToDemoItems\(\);/g, 'const samples = [] as any[];');

fs.writeFileSync('src/context/AppContext.tsx', code);

let ws = fs.readFileSync('src/services/wardrobeService.ts', 'utf8');
ws = ws.replace(/i\.seasons\.includes\(options\.season as any\)/g, 'i.seasons.includes(options.season as any)');
ws = ws.replace(/i\.occasions\?\.includes\(options\.occasion as any\)/g, 'i.occasions?.includes(options.occasion as any)');
ws = ws.replace(/i\.seasons\.includes\(options\.season\)/g, 'i.seasons.includes(options.season as any)');
ws = ws.replace(/i\.occasions\?\.includes\(options\.occasion\)/g, 'i.occasions?.includes(options.occasion as any)');
fs.writeFileSync('src/services/wardrobeService.ts', ws);

let os = fs.readFileSync('src/services/outfitService.ts', 'utf8');
os = os.replace(/o\.seasons\.includes\(options\.season as any\)/g, 'o.seasons.includes(options.season as any)');
os = os.replace(/o\.occasions\?\.includes\(options\.occasion as any\)/g, 'o.occasions?.includes(options.occasion as any)');
os = os.replace(/o\.seasons\.includes\(options\.season\)/g, 'o.seasons.includes(options.season as any)');
os = os.replace(/o\.occasions\?\.includes\(options\.occasion\)/g, 'o.occasions?.includes(options.occasion as any)');
fs.writeFileSync('src/services/outfitService.ts', os);
