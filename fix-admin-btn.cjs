const fs = require('fs');

let adminCode = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

// I ruined the AdminPage on the last attempt, I will just make it secondary
adminCode = adminCode.replace(/variant="danger"/g, 'variant="destructive"');
adminCode = adminCode.replace(/variant=\{[\s\S]*?selectedUserDetails\.user\.status === "Active"[\s\S]*?\? "danger"[\s\S]*?: "secondary"[\s\S]*?\}/g, 'variant={selectedUserDetails.user.status === "Active" ? "destructive" : "secondary"}');
adminCode = adminCode.replace(/variant=\{hasAccess \? "danger" : "secondary"\}/g, 'variant={hasAccess ? "destructive" : "secondary"}');

fs.writeFileSync('src/pages/AdminPage.tsx', adminCode);
