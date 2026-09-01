const fs = require('fs');

function replaceFile(file, replaces) {
  let code = fs.readFileSync(file, 'utf8');
  for (const r of replaces) {
     code = code.split(r[0]).join(r[1]);
  }
  fs.writeFileSync(file, code);
}

replaceFile('src/components/ui/Toast.tsx', [
  ['<div\n            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}', '<motion.div\n            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}'],
  ['</button>\n          </div>\n        </div>', '</button>\n          </motion.div>\n        </div>']
]);

replaceFile('src/pages/OutfitsPage.tsx', [
  ['import { motion, AnimatePresence } from "motion/react";', 'import { motion, AnimatePresence, Variants } from "motion/react";'],
  ['<div layoutId="active-tab"', '<motion.div layoutId="active-tab"'],
  ['/>\n                )}', '/>\n                )}'], 
  ['<div layout variants={containerVariants}', '<motion.div layout variants={containerVariants}'],
  ['<div\n                key={outfit.id}\n                layout\n                variants={cardVariants}\n                exit="hidden"\n                whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}', '<motion.div\n                key={outfit.id}\n                layout\n                variants={cardVariants}\n                exit="hidden"\n                whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}'],
  ['</Button>\n                  </div>\n                </div>\n              </div>', '</Button>\n                  </div>\n                </div>\n              </motion.div>'],
  ['{/* Pagination / Load More */}\n          </div>', '{/* Pagination / Load More */}\n          </motion.div>']
]);
