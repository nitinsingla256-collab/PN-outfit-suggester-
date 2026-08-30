const fs = require('fs');
let code = fs.readFileSync('src/pages/StylistPage.tsx', 'utf8');

if (!code.includes('import Markdown')) {
  code = code.replace(/import React, \{\n\s*useState,\n\} from "react";/, 'import React, { useState, useEffect } from "react";\nimport Markdown from "react-markdown";');
}

fs.writeFileSync('src/pages/StylistPage.tsx', code);
