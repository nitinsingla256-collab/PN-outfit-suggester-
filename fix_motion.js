import fs from 'fs';

function replaceDivWithMotionDiv(file, lineNumber) {
   let lines = fs.readFileSync(file, 'utf8').split('\n');
   
   // It's a bit hard to parse HTML with regex accurately line by line, 
   // but we can just do a naive replacement of `<div \n key={...} \n layout`
   let code = fs.readFileSync(file, 'utf8');
   code = code.replace(/<div(\s+key=\{[^\}]+\})?\s+layout/g, '<motion.div$1 layout');
   // this requires us to close the motion div manually which is tricky.
}
