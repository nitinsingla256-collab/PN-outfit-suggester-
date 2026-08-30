const fs = require('fs');

const dir = 'src/pages/';
const files = fs.readdirSync(dir).map(f => dir + f).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  
  // Custom regex to match '// ' followed by anything up to ' const ', ' let ', ' if ', ' return ', ' function '
  code = code.replace(/\/\/ (.*?) (const|let|if|return|try|function|for|0 = Sun)/g, (match, p1, p2) => {
    return `/* ${p1.trim()} */\n${p2}`;
  });

  fs.writeFileSync(file, code);
  console.log(`Fixed ${file}`);
});
