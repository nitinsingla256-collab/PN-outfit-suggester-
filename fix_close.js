import fs from 'fs';

let toastCode = fs.readFileSync('src/components/ui/Toast.tsx', 'utf8');
toastCode = toastCode.replace(/<\/button>\n\s*<\/div>\n\s*<\/div>\n\s*\);\n\}/, '</button>\n      </div>\n    </motion.div>\n  );\n}');
fs.writeFileSync('src/components/ui/Toast.tsx', toastCode);

let outfitCode = fs.readFileSync('src/pages/OutfitsPage.tsx', 'utf8');
outfitCode = outfitCode.replace(/<\/Button>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\}\)\}/g, '</Button>\n                  </div>\n                </div>\n              </motion.div>\n            ))}');
outfitCode = outfitCode.replace(/<\/div>\n\s*\{outfits\.length === 0 && \(/, '</motion.div>\n          {outfits.length === 0 && (');
fs.writeFileSync('src/pages/OutfitsPage.tsx', outfitCode);
