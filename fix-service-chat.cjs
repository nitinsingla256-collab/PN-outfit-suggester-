const fs = require('fs');

let code = fs.readFileSync('src/services/aiStylistService.ts', 'utf8');

code = code.replace(/async chatConcierge\(params: \{[\s\S]*?  \}\): Promise<string> \{/, `async chatConcierge(params: {
    message: string;
    conversationHistory: { role: 'user' | 'assistant'; content: string }[];
    wardrobePool: WardrobeItem[];
    weather?: string;
    location?: string;
    time?: string;
    date?: string;
  }): Promise<string> {`);

fs.writeFileSync('src/services/aiStylistService.ts', code);
