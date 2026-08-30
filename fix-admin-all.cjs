const fs = require('fs');

let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

const regex = /<Badge\n\s*variant="secondary"\n\s*size="sm"\n\s*onClick=\{[\s\S]*?\}\n\s*>/;

// The corruption looks like a large chunk of code was deleted between `<Badge` in the activity log and a Button in the user details drawer.
// I will just download the original file if possible, or I will reconstruct it.
// I'll reconstruct the end of the file.
