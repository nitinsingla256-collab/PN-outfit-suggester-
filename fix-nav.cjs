const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

code = code.replace(/title: 'PN'/g, "title: 'PN'");

fs.writeFileSync('src/components/layout/Navbar.tsx', code);
