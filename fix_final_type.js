import fs from 'fs';
let ws = fs.readFileSync('src/services/wardrobeService.ts', 'utf8');
ws = ws.replace(/i\.season === \(options\.season\)/g, 'i.season.includes(options.season as string)');
ws = ws.replace(/i\.occasion === \(options\.occasion\)/g, 'i.occasion?.includes(options.occasion as string)');
fs.writeFileSync('src/services/wardrobeService.ts', ws);

let os = fs.readFileSync('src/services/outfitService.ts', 'utf8');
os = os.replace(/o\.season === \(options\.season\)/g, 'o.season?.includes(options.season as string)');
os = os.replace(/o\.occasion === \(options\.occasion\)/g, 'o.occasion?.includes(options.occasion as string)');
fs.writeFileSync('src/services/outfitService.ts', os);
