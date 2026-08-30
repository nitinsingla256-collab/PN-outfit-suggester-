const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace PAURVI specific instances
  content = content.replace(/PAURVI — AI Wardrobe & Stylist/g, 'PN Outfit Suggester');
  content = content.replace(/PAURVI ATELIER/g, 'PN OUTFIT SUGGESTER');
  content = content.replace(/PAURVI Atelier/g, 'PN Outfit Suggester');
  content = content.replace(/PAURVI Intelligent Outfit Generator/g, 'PN Intelligent Outfit Generator');
  content = content.replace(/PAURVI Intelligent Stylist Core/g, 'PN Intelligent Stylist Core');
  content = content.replace(/PAURVI AI Stylist/g, 'PN AI Stylist');
  content = content.replace(/PAURVI/g, 'PN');
  content = content.replace(/paurvi_auth_token_v3/g, 'pn_auth_token_v1');
  content = content.replace(/paurvi-wardrobe-backup/g, 'pn-wardrobe-backup');
  content = content.replace(/client@paurvi\.atelier/g, 'client@pn.outfit');

  if (original !== content) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

const dirsToScan = ['src', 'src/components', 'src/components/layout', 'src/components/ui', 'src/context', 'src/data', 'src/pages', 'src/services'];

dirsToScan.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
      replaceInFile(fullPath);
    }
  });
});

replaceInFile('index.html');
replaceInFile('metadata.json');
