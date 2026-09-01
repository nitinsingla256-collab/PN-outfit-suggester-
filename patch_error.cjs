const fs = require('fs');
let code = fs.readFileSync('src/components/ui/ErrorBoundary.tsx', 'utf8');

code = code.replace(/window\.location\.reload\(\);/g, 'window.location.href = window.location.pathname + "?t=" + Date.now();');

fs.writeFileSync('src/components/ui/ErrorBoundary.tsx', code);
console.log("Patched ErrorBoundary");
