import fs from 'fs';

function fix(file, defaultVarName) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(`this.saveLocalItems(${defaultVarName});\n    return [];`, `this.saveLocalItems(${defaultVarName});\n    return ${defaultVarName};`);
    fs.writeFileSync(file, code);
}
fix('src/services/wardrobeService.ts', 'DEFAULT_SAMPLE_WARDROBE');
fix('src/services/outfitService.ts', 'DEFAULT_SAMPLE_OUTFITS');
fix('src/services/plannerService.ts', 'DEFAULT_SAMPLE_PLANS');
