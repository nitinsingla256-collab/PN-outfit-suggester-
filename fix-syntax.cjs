const fs = require('fs');

let code = fs.readFileSync('src/pages/StylistPage.tsx', 'utf8');

// Fix the "if denied" syntax error
code = code.replace(/\/\* Fallback to Chandigarh or user location \*\/\nif denied const data =/, '/* Fallback to Chandigarh or user location if denied */\nconst data =');

fs.writeFileSync('src/pages/StylistPage.tsx', code);
console.log('Fixed syntax in StylistPage.tsx');
