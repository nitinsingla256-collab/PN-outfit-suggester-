import fs from 'fs';

function fix(file, arrayVar) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(`const filteredOutfits = useMemo(() => {`, `const filteredOutfits = useMemo(() => {\n    const safeItems = Array.isArray(${arrayVar}) ? ${arrayVar} : [];`);
    code = code.replace(`return outfitService.filter(${arrayVar}`, `return outfitService.filter(safeItems`);
    
    // For planner
    code = code.replace(`const filteredPlans = useMemo(() => {`, `const filteredPlans = useMemo(() => {\n    const safePlans = Array.isArray(plans) ? plans : [];`);
    // ...
    fs.writeFileSync(file, code);
}
// Not bothering with full regex, just simple replacement.
