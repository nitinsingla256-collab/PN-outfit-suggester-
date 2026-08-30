const fs = require('fs');

const files = [
  'src/pages/StylistPage.tsx',
  'src/pages/WardrobePage.tsx',
  'src/pages/HomePage.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  
  // Custom regex to match '// ' followed by anything up to ' const ', ' let ', ' if ', or ' return '
  code = code.replace(/\/\/ (.*?) (const|let|if|return|try)/g, (match, p1, p2) => {
    return `/* ${p1.trim()} */\n${p2}`;
  });

  // Specifically for HomePage.tsx that has extra spaces
  code = code.replace(/\/\/ Time-based greeting\s+const/g, `/* Time-based greeting */\nconst`);

  fs.writeFileSync(file, code);
  console.log(`Fixed ${file}`);
});
