const fs = require('fs');

let code = fs.readFileSync('src/data/seedData.ts', 'utf8');

code = code.replace(/usr_paurvi_client/g, 'usr_pn_client');

fs.writeFileSync('src/data/seedData.ts', code);
