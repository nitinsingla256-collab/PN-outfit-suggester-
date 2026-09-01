import fs from 'fs';

function fixService(file) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/return JSON\.parse\(raw\);/g, `
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    `);
    fs.writeFileSync(file, code);
}
fixService('src/services/wardrobeService.ts');
fixService('src/services/outfitService.ts');
fixService('src/services/plannerService.ts');
