import fs from 'fs';

function isolateService(filePath, staticKeyName, keyStringValue, defaultVarName) {
    let code = fs.readFileSync(filePath, 'utf8');
    
    // Replace const LOCAL_XXX_KEY = 'pn_...'; with a function
    code = code.replace(`const ${staticKeyName} = '${keyStringValue}';`, `const get_${staticKeyName} = () => {
  const user = authService.getCurrentUser();
  return user ? \`${keyStringValue}_\${user.id}\` : '${keyStringValue}';
};`);

    // Replace usages
    code = code.split(staticKeyName).join(`get_${staticKeyName}()`);
    // But we need to fix the declaration we just ruined
    code = code.split(`get_get_${staticKeyName}()`).join(`get_${staticKeyName}`);

    // Stop initializing with default mock data for new users
    // Usually it looks like: localStorage.setItem(LOCAL_WARDROBE_KEY, JSON.stringify(DEFAULT_SAMPLE_WARDROBE));
    // Or: return DEFAULT_SAMPLE_WARDROBE;
    // Let's find getLocalItems
    // Change getLocalItems default behavior
    if (defaultVarName) {
        code = code.replace(`localStorage.setItem(get_${staticKeyName}(), JSON.stringify(${defaultVarName}));`, `localStorage.setItem(get_${staticKeyName}(), JSON.stringify([]));`);
        // if the return is DEFAULT_SAMPLE_WARDROBE, replace with []
        code = code.replace(`return ${defaultVarName};`, `return [];`);
        
        // Let's restore the resetToDemoItems functionality just in case
        code = code.replace(`resetToDemoItems(): Promise<any[]> {\n    this.saveLocalItems([]);\n    return [];\n  }`, `resetToDemoItems(): Promise<any[]> {\n    this.saveLocalItems(${defaultVarName});\n    return ${defaultVarName};\n  }`);
    }

    fs.writeFileSync(filePath, code);
}

isolateService('src/services/wardrobeService.ts', 'LOCAL_WARDROBE_KEY', 'pn_local_wardrobe_items_v1', 'DEFAULT_SAMPLE_WARDROBE');
isolateService('src/services/outfitService.ts', 'LOCAL_OUTFITS_KEY', 'pn_local_outfits_v1', 'DEFAULT_SAMPLE_OUTFITS');
isolateService('src/services/plannerService.ts', 'LOCAL_PLANS_KEY', 'pn_local_plans_v1', 'DEFAULT_SAMPLE_PLANS');

