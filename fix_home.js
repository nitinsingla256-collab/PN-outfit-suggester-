import fs from 'fs';
let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

// Safe checking for items
code = code.replace(/if \(items\.length === 0\) return null;/g, `if (!items || !Array.isArray(items) || items.length === 0) return null;`);

// Safe user check in useState
code = code.replace(/const cacheKey = \`daily_outfit_\$\{new Date\(\)\.toISOString\(\)\.split\("T"\)\[0\]\}_\$\{user\.id\}\`;/g, 
`if (!user) return null;
      const cacheKey = \`daily_outfit_\${new Date().toISOString().split("T")[0]}_\${user.id}\`;`);

fs.writeFileSync('src/pages/HomePage.tsx', code);
