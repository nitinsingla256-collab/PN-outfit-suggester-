import fs from 'fs';

let toastCode = fs.readFileSync('src/components/ui/Toast.tsx', 'utf8');
toastCode = toastCode.replace(/<div\s+exit=\{\{/g, '<motion.div exit={{');
toastCode = toastCode.replace(/<\/button>\n\s*<\/div>\n\s*<\/div>/g, '</button>\n      </motion.div>\n    </div>'); // Wait, let's just close the right tag.
fs.writeFileSync('src/components/ui/Toast.tsx', toastCode);

let outfitCode = fs.readFileSync('src/pages/OutfitsPage.tsx', 'utf8');
outfitCode = outfitCode.replace(/<div layoutId="active-tab"/g, '<motion.div layoutId="active-tab"');
// replace closing div for active tab:
outfitCode = outfitCode.replace(/layoutId="active-tab"[\s\S]*?\/>\n\s*\)}/m, (match) => {
   return match; // active tab is self-closing!
});

outfitCode = outfitCode.replace(/<div\s+layout\s+variants=\{containerVariants\}/g, '<motion.div layout variants={containerVariants}');
outfitCode = outfitCode.replace(/<div\s+key=\{outfit\.id\}\s+layout\s+variants=\{cardVariants\}/g, '<motion.div key={outfit.id} layout variants={cardVariants}');

outfitCode = outfitCode.replace(/import \{ motion, AnimatePresence \} from "motion\/react";/g, 'import { motion, AnimatePresence, Variants } from "motion/react";');

fs.writeFileSync('src/pages/OutfitsPage.tsx', outfitCode);
