const fs = require('fs');

let authPage = fs.readFileSync('src/pages/AuthPage.tsx', 'utf8');

// Remove length and complexity requirements
authPage = authPage.replace(/if \(password\.length < 8\) \{[\s\S]*?setError\("Password must be at least 8 characters\."\);[\s\S]*?return;[\s\S]*?\}/, '');
authPage = authPage.replace(/const hasUpper = \/\[A-Z\]\/\.test\(password\);[\s\S]*?return;[\s\S]*?\}/, '');

fs.writeFileSync('src/pages/AuthPage.tsx', authPage);

let authService = fs.readFileSync('src/services/authService.ts', 'utf8');
authService = authService.replace(/const cleanEmail = email\.toLowerCase\(\)\.trim\(\);/, 'const cleanEmail = email.toLowerCase().trim();\n    passwordPlain = passwordPlain.trim();');

fs.writeFileSync('src/services/authService.ts', authService);

let serverDb = fs.readFileSync('server/db.ts', 'utf8');
serverDb = serverDb.replace(/const isValid = verifyPassword\(passwordPlain, user\.passwordHash, user\.salt\);/, 'const isValid = verifyPassword(passwordPlain.trim(), user.passwordHash, user.salt);');

fs.writeFileSync('server/db.ts', serverDb);
