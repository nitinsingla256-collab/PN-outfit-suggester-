import fs from 'fs';
let code = fs.readFileSync('src/pages/WardrobePage.tsx', 'utf8');

code = code.replace(/const baseItems = activeClusterFilter\n\s*\? wardrobe\.filter\(w => activeClusterFilter\.itemIds\.includes\(w\.id\)\)\n\s*: wardrobe;/g, 
`const safeWardrobe = Array.isArray(wardrobe) ? wardrobe : [];
    const baseItems = activeClusterFilter
      ? safeWardrobe.filter(w => activeClusterFilter.itemIds.includes(w.id))
      : safeWardrobe;`);

// replace any other raw 'wardrobe' usages inside useMemo that depend on array methods
code = code.replace(/wardrobeService\.filter\(baseItems,/g, `wardrobeService.filter(baseItems || [],`);

fs.writeFileSync('src/pages/WardrobePage.tsx', code);
