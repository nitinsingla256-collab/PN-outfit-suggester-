const fs = require('fs');

let code = fs.readFileSync('src/pages/StylistPage.tsx', 'utf8');

const sendChatReplacement = `  const handleSendChatMessage = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') {
      e.preventDefault();
    }
    const userText = typeof e === 'string' ? e : chatInput.trim();
    if (!userText || isChatLoading) return;
    const newMsg = {
      role: "user" as const,
      content: userText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");
    setIsChatLoading(true);
    try {
      const reply = await aiStylistService.chatConcierge({
        message: userText,
        conversationHistory: chatMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        wardrobePool: wardrobe,
        weather: weatherDescription,
        location: location || user.location || "Unknown",
        time: time || new Date().toLocaleTimeString(),
        date: date || new Date().toLocaleDateString(),
      });
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (error) {
      console.error(error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Your stylist is temporarily unavailable. Please try again.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };`;

code = code.replace(/  const handleSendChatMessage = async \(e: React\.FormEvent\) => \{[\s\S]*?    \} finally \{\n\s*setIsChatLoading\(false\);\n\s*\}\n\s*\};/, sendChatReplacement);

const conciergeChips = `
          {/* Suggested Chat Prompts */}
          <div className="px-6 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              {[
                "Style me for tonight",
                "What should I wear today?",
                "Make this outfit more formal",
                "What goes with navy trousers?",
                "Help me choose colours"
              ].map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendChatMessage(prompt)}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-full text-[11px] font-medium transition-colors border border-emerald-100"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
          {/* Chat Input Bar */}`;

code = code.replace(/          \{\/\* Chat Input Bar \*\/\}/, conciergeChips);

// Ensure markdown rendering inside chat bubbles if not already
if (!code.includes('import Markdown')) {
  code = code.replace(/import React, \{ useState, useEffect \} from "react";/, 'import React, { useState, useEffect } from "react";\nimport Markdown from "react-markdown";');
}

// Replace whitespace-pre-line with markdown in assistant messages
code = code.replace(/<p className="whitespace-pre-line">\{msg\.content\}<\/p>/, `{msg.role === "assistant" ? (<div className="markdown-body prose prose-sm max-w-none"><Markdown>{msg.content}</Markdown></div>) : (<p className="whitespace-pre-line">{msg.content}</p>)}`);

// Need to update the Tailwind classes for prose to work correctly, but we'll use a simplified version since we might not have @tailwindcss/typography
code = code.replace(/className={\`rounded-2xl p-4 text-xs leading-relaxed \$\{msg\.role === "user" \? "bg-emerald-600 text-gray-900" : "bg-gray-50 text-gray-800 border border-gray-200\/60 "\}\`}/, 'className={`rounded-2xl p-4 text-xs leading-relaxed ${msg.role === "user" ? "bg-emerald-600 text-white" : "bg-gray-50 text-gray-800 border border-gray-200/60 "}`}');

fs.writeFileSync('src/pages/StylistPage.tsx', code);
