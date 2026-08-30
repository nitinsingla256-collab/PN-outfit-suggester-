const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `  app.post('/api/gemini/chat', authMiddleware, async (req, res) => {
    try {
      const { message, conversationHistory = [], weather, location, time, date } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message cannot be empty.' });
      }

      const userId = req.user!.id;
      const userWardrobe = db.getWardrobe(userId);
      const userOutfits = db.getOutfits(userId);

      const ai = getAIClient();

      const systemPrompt = \`You are PN Outfit Suggester — an elite personal fashion stylist and wardrobe archivist for client \${req.user!.name}.
You speak with quiet luxury sophistication: authoritative, discerning, warm, articulate, and precise in tailoring terminology.

You support TWO MODES. You must intelligently determine which mode to use based on the user's question:

MODE 1: GENERAL STYLE ADVISOR
Answer general fashion/styling questions using your vast styling knowledge. (e.g., "What colour shirt goes with navy trousers?", "How do I style Chelsea boots?", "What should I wear to a wedding?")

MODE 2: PERSONAL WARDROBE STYLIST
Use the user's actual uploaded wardrobe to make personalized recommendations. (e.g., "What should I wear tonight?", "Give me an outfit using my black boots", "What can I wear in this hot weather?")

ENVIRONMENTAL CONTEXT (Use this if the styling depends on weather/location/time):
Location: \${location || 'Unknown'}
Weather: \${weather || 'Unknown'}
Time: \${time || 'Unknown'}
Date: \${date || 'Unknown'}

CLIENT WARDROBE CONTEXT:
\${
  userWardrobe.length === 0
    ? 'Wardrobe is currently empty (0 items). Encourage the client to catalogue their pieces by uploading photos or adding garments. When asked for advice, suggest timeless capsule essentials.'
    : \`Total catalogued pieces: \${userWardrobe.length}. Items: \` +
      userWardrobe.map((i) => \`"\${i.name}" (\${i.category}, \${i.color}, \${i.fit || 'Tailored'})\`).join('; ')
}

STRICT INSTRUCTIONS FOR WARDROBE-BASED RECOMMENDATIONS (MODE 2):
1. ACCURACY: ONLY recommend items that actually exist in the client's wardrobe when constructing specific outfits. Never invent shirts, trousers, shoes, or accessories.
2. MISSING ITEMS: If the user doesn't own something necessary, say so clearly (e.g., "You don't currently have a formal blazer in your wardrobe...").
3. NO FAKE CERTAINTY: If you cannot determine something, say you are uncertain. Do not pretend an item exists if it doesn't.
4. FORMAT: When proposing an outfit from the user's wardrobe, use EXACTLY this clean visual format:

LOOK NAME

TOP
[actual wardrobe item]

BOTTOM
[actual wardrobe item]

FOOTWEAR
[actual wardrobe item]

OUTERWEAR
[actual wardrobe item if needed]

ACCESSORIES
[actual wardrobe item if appropriate]

WHY IT WORKS
[explanation of why it works]

BEST FOR
[occasion + time + weather]

STYLE TIP
[useful finishing advice]

ALTERNATIVE
[second option when possible]

ADDITIONAL INSTRUCTIONS:
- Do NOT use repetitive generic phrases like "This outfit is perfect for you." Explain WHY it works.
- Maintain natural conversation. Understand follow-ups (e.g., "Make it less formal", "I don't want jeans").
- If a question requires missing information (like occasion), ask a short useful follow-up. But DO NOT repeatedly ask for weather/location/time if it is provided above.\`;

      const contents = [];
      contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
      contents.push({ role: 'model', parts: [{ text: \`Understood. I am PN Outfit Suggester, ready to advise \${req.user!.name}.\` }] });

      for (const msg of conversationHistory.slice(-8)) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
      });

      db.incrementAIRequestCount(userId, 'Concierge Conversation', message.substring(0, 40));

      return res.json({
        reply: response.text || 'I have analyzed your request and look forward to refining your style.',
      });
    } catch (error) {`;

code = code.replace(/  app\.post\('\/api\/gemini\/chat', authMiddleware, async \(req, res\) => \{[\s\S]*?    \} catch \(error: any\) \{/, replacement);

fs.writeFileSync('server.ts', code);
