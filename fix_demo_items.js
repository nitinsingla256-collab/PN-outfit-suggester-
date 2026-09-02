import fs from 'fs';
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(/const demoItems = await wardrobeService\.resetToDemoItems\(\);/g, 'const demoItems: any[] = [];');

fs.writeFileSync('src/context/AppContext.tsx', code);
