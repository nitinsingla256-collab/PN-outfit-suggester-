const fs = require('fs');

let code = fs.readFileSync('src/pages/StylistPage.tsx', 'utf8');

if (!code.includes('import Markdown from "react-markdown"')) {
  code = code.replace(/import React, \{ useState, useEffect \} from "react";/, 'import React, { useState, useEffect } from "react";\nimport Markdown from "react-markdown";');
}

fs.writeFileSync('src/pages/StylistPage.tsx', code);
