const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Replace old favicon link
content = content.replace(/<link rel="icon" type="image\/svg\+xml" href="[^"]*" \/>/g, '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />');
// Add manifest if missing
if (!content.includes('manifest.json')) {
  content = content.replace('</head>', '    <link rel="manifest" href="/manifest.json" />\n  </head>');
}

fs.writeFileSync('index.html', content);
