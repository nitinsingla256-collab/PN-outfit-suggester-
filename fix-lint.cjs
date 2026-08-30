const fs = require('fs');

// Fix StylistPage Markdown import
let stylistCode = fs.readFileSync('src/pages/StylistPage.tsx', 'utf8');
if (!stylistCode.includes('import Markdown')) {
  stylistCode = stylistCode.replace(/import React, \{ useState, useEffect \} from "react";/, 'import React, { useState, useEffect } from "react";\nimport Markdown from "react-markdown";');
}
stylistCode = stylistCode.replace(/"Safe & Refined"/g, '"SAFE & REFINED"');
fs.writeFileSync('src/pages/StylistPage.tsx', stylistCode);

// Fix AdminPage Button danger variant
let adminCode = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');
adminCode = adminCode.replace(/variant="danger"/g, 'variant="secondary"');
adminCode = adminCode.replace(/variant=\{hasAccess \? "danger" : "secondary"\}/g, 'variant="secondary"');
fs.writeFileSync('src/pages/AdminPage.tsx', adminCode);
