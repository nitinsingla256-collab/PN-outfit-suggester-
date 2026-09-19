/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { aiStylistService } from '../../services/aiStylistService';
import { weatherService } from '../../services/weatherService';
import {
  Sparkles,
  Send,
  RotateCcw,
  X,
  Minimize2,
  Maximize2,
  Bot,
  User as UserIcon,
  Shirt,
  Zap,
  Check,
  Copy,
  AlertCircle,
  Compass,
  SlidersHorizontal,
  ChevronDown,
  Image as ImageIcon,
  Camera,
} from 'lucide-react';

export type ChatRole = 'stylist' | 'capsule' | 'streetwear' | 'fast_advisor' | 'critic';
export type GeminiModelChoice = 'gemini-3.8-flash' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  modelUsed?: string;
  roleUsed?: string;
  isError?: boolean;
  image?: string;
  mimeType?: string;
  imageName?: string;
}

const ROLES: Array<{
  id: ChatRole;
  name: string;
  tagline: string;
  icon: string;
  description: string;
  starterPrompts: string[];
}> = [
  {
    id: 'stylist',
    name: 'Elite Stylist',
    tagline: 'Quiet Luxury & Proportions',
    icon: '🌟',
    description: 'High-end styling, tailored silhouette balance, tonal palettes, and bespoke outfit formulas.',
    starterPrompts: [
      'What should I wear to an art gallery opening tonight?',
      'How do I balance proportions with wide-leg trousers?',
      'Suggest an elevated smart-casual outfit from my wardrobe.',
      'Which shoe colors pair best with charcoal and navy?',
    ],
  },
  {
    id: 'capsule',
    name: 'Capsule Architect',
    tagline: 'Minimalist & Versatile',
    icon: '🧳',
    description: '10x10 capsules, travel packing efficiency, and maximizing outfit permutations with fewer pieces.',
    starterPrompts: [
      'Build a 10-piece travel capsule for 5 days in Milan.',
      'Which 3 versatile layers should I add to my wardrobe?',
      'How can I remix a single white shirt across 4 occasions?',
      'Audit my wardrobe versatility and identify core missing staples.',
    ],
  },
  {
    id: 'streetwear',
    name: 'Streetwear Curator',
    tagline: 'Modern & Contemporary',
    icon: '👟',
    description: 'Contemporary silhouettes, sneaker pairings, relaxed tailoring, and urban layering aesthetics.',
    starterPrompts: [
      'How can I style retro sneakers with tailored trousers?',
      'Give me an effortless oversized streetwear silhouette.',
      'Recommend layering formulas for transitional autumn weather.',
      'How to elevate a basic hoodie for evening streetwear?',
    ],
  },
  {
    id: 'fast_advisor',
    name: 'Rapid Concierge',
    tagline: 'Instant Bullet Decisions',
    icon: '⚡',
    description: 'Ultra-fast, punchy, concise answers in 2-3 crisp bullet points. Zero fluff for on-the-go styling.',
    starterPrompts: [
      'Navy trousers + black shoes: yes or no?',
      'Quick color match for an olive bomber jacket.',
      'Tie or open collar for tonight’s business dinner?',
      'Quick rule for belt and shoe leather matching.',
    ],
  },
  {
    id: 'critic',
    name: 'Sartorial Critic',
    tagline: 'Textile & Craft Archivist',
    icon: '📜',
    description: 'Deep analytical critique of garment construction, stitch finishing, textile care, and fashion heritage.',
    starterPrompts: [
      'Critique the drape and breathability of linen vs tropical wool.',
      'What makes a high-grade Goodyear welted dress shoe?',
      'How to evaluate seam construction and fabric quality before buying?',
      'Explain the sartorial history of the double-breasted jacket.',
    ],
  },
];

const MODELS: Array<{
  id: GeminiModelChoice;
  label: string;
  badge: string;
  speed: string;
}> = [
  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash', badge: 'Primary', speed: 'High Precision' },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', badge: 'General', speed: 'Balanced' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite', badge: 'Fast', speed: 'Ultra Fast' },
  { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro', badge: 'Complex', speed: 'Deep Reasoning' },
];

export function GeminiChatbot() {
  const { user, wardrobe } = useApp();
  const [currentWeather, setCurrentWeather] = useState<{ condition: string; temperature?: number } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      try {
        const target = user?.location || 'Paris';
        const w = await weatherService.geocodeAndGetWeather(target);
        if (isMounted && w) {
          setCurrentWeather({ condition: w.condition, temperature: w.temperatureCelsius });
        }
      } catch {
        if (isMounted) {
          setCurrentWeather({ condition: 'Clear', temperature: 20 });
        }
      }
    };
    fetchWeather();
    return () => {
      isMounted = false;
    };
  }, [user?.location]);

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ChatRole>('stylist');
  const [selectedModel, setSelectedModel] = useState<GeminiModelChoice>('gemini-3.8-flash');
  const [showSettings, setShowSettings] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<{ base64: string; mimeType: string; name: string } | null>(null);

  const activeRoleConfig = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Greetings ${user?.name || 'Client'}. I am your PN Gemini Fashion Concierge, powered by Google's multi-turn neural styling engine.

I have direct access to your ${wardrobe.length} catalogued wardrobe items and environmental conditions.

You can upload clothing or outfit photos (tap the camera/photo button below) to get instant visual styling analysis, pairings, and proportion feedback! How may I assist your style today?`,
      time: 'Just now',
      modelUsed: 'gemini-3.8-flash',
      roleUsed: 'stylist',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('Image exceeds 15MB size limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage({
        base64: reader.result as string,
        mimeType: file.type || 'image/jpeg',
        name: file.name,
      });
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to load image.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    const currentImg = attachedImage;
    if ((!query && !currentImg) || isLoading) return;

    setError(null);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const effectiveText = query || (currentImg ? 'Please analyze this garment or outfit photo and provide your bespoke styling critique, suggested pairings, and fit advice.' : '');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: effectiveText,
      time: now,
      image: currentImg?.base64,
      mimeType: currentImg?.mimeType,
      imageName: currentImg?.name,
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInput('');
    setAttachedImage(null);
    setIsLoading(true);

    try {
      // Build conversation history array for backend
      const conversationHistory = updatedHistory.map((m) => ({
        role: m.role,
        content: m.content,
        image: m.image,
        mimeType: m.mimeType,
      }));

      const weatherString = currentWeather
        ? `${currentWeather.condition}, ${currentWeather.temperature}°C`
        : 'Clear, 20°C';

      const response = await aiStylistService.chatConciergeDetailed({
        message: effectiveText,
        image: currentImg?.base64,
        mimeType: currentImg?.mimeType,
        conversationHistory,
        wardrobePool: wardrobe,
        weather: weatherString,
        location: user?.location || 'Atelier',
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        role: selectedRole,
        model: selectedModel,
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: response.modelUsed || selectedModel,
        roleUsed: response.roleUsed || selectedRole,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Gemini chatbot error:', err);
      const errMsg = err?.message || 'The Gemini styling engine was unable to respond. Please try again.';
      setError(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `I encountered an unexpected interruption: ${errMsg}. You can click "Retry" below to re-submit.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setError(null);
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'assistant',
        content: `Conversation refreshed with ${activeRoleConfig.name} persona (${selectedModel}). What styling challenge would you like to explore?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
        roleUsed: selectedRole,
      },
    ]);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-20 lg:bottom-6 right-6 z-50 animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 dark:bg-emerald-600 text-white shadow-2xl hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all border border-slate-700/50 dark:border-emerald-500/30 cursor-pointer"
            title="Open Gemini AI Stylist Chatbot"
          >
            <div className="relative flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400 dark:text-white group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold tracking-wide">Gemini Stylist</span>
              <span className="text-[10px] text-slate-300 dark:text-emerald-100 font-medium leading-none">
                {activeRoleConfig.name}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Expandable Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden ${
            isExpanded
              ? 'inset-4 sm:inset-10'
              : 'bottom-4 sm:bottom-6 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[460px] h-[620px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white truncate">
                    PN Gemini Concierge
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {activeRoleConfig.icon} {activeRoleConfig.name} • {selectedModel.replace('gemini-', '')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800 ${
                  showSettings ? 'bg-slate-800 text-emerald-400' : ''
                }`}
                title="Stylist Persona & Model Settings"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800"
                title="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800 hidden sm:block"
                title={isExpanded ? 'Restore window size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Persona & Model Settings Panel */}
          {showSettings && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs space-y-3 shrink-0 animate-in slide-in-from-top-2 duration-200">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    Stylist Persona & System Role
                  </span>
                  <span className="text-[10px] text-slate-500">{activeRoleConfig.tagline}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setSelectedRole(r.id);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-left transition border ${
                        selectedRole === r.id
                          ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span>{r.icon}</span>
                        <span className="truncate text-[11px]">{r.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {activeRoleConfig.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Gemini AI Model Engine
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedModel(m.id)}
                      className={`px-2 py-1.5 rounded-lg text-left transition border ${
                        selectedModel === m.id
                          ? 'bg-slate-900 dark:bg-emerald-700 text-white border-slate-900 dark:border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[11px] truncate">{m.label}</span>
                        <span className="text-[9px] px-1 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                          {m.badge}
                        </span>
                      </div>
                      <span className="text-[10px] opacity-75 block">{m.speed}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Wardrobe & Environmental Context Pill */}
          <div className="px-3.5 py-2 bg-emerald-50/60 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300 shrink-0">
            <div className="flex items-center gap-1.5 truncate">
              <Shirt className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {wardrobe.length} Pieces Catalogued • {currentWeather?.condition || 'Clear Weather'} ({currentWeather?.temperature || 20}°C)
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 shrink-0 ml-2">
              Grounding: Active
            </span>
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative group max-w-[85%] rounded-2xl p-3.5 shadow-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : msg.isError
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/70 dark:border-slate-700/60'
                  }`}
                >
                  {msg.image && (
                    <div className="mb-2.5 overflow-hidden rounded-xl border border-white/20 dark:border-slate-700/60 bg-black/20">
                      <img
                        src={msg.image}
                        alt="Uploaded garment or style piece"
                        className="w-full max-h-56 object-contain rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <div className="whitespace-pre-line font-sans break-words">
                    {msg.content}
                  </div>

                  {/* Metadata bar */}
                  <div className="mt-2 pt-1 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] opacity-70">
                    <div className="flex items-center gap-1.5">
                      <span>{msg.time}</span>
                      {msg.modelUsed && (
                        <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-black/10 dark:bg-white/10">
                          {msg.modelUsed.replace('gemini-', '')}
                        </span>
                      )}
                    </div>
                    {msg.role === 'assistant' && !msg.isError && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.id, msg.content)}
                        className="hover:opacity-100 transition-opacity p-0.5"
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-xs p-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[11px]">
                    {activeRoleConfig.name} is formulating response...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Contextual Starter Prompts */}
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200/70 dark:border-slate-800/80 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {activeRoleConfig.starterPrompts.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition shadow-2xs"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-800 text-[11px] text-rose-700 dark:text-rose-300 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 truncate">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{error}</span>
              </div>
              <button
                type="button"
                onClick={() => handleSendMessage(messages[messages.length - 2]?.content || 'Hello')}
                className="font-semibold underline ml-2 shrink-0 hover:text-rose-900"
              >
                Retry
              </button>
            </div>
          )}

          {/* Attached Image Preview */}
          {attachedImage && (
            <div className="px-3.5 py-2 bg-emerald-50/80 dark:bg-emerald-950/40 border-t border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={attachedImage.base64}
                  alt="Attachment preview"
                  className="w-10 h-10 rounded-lg object-cover border border-emerald-300 dark:border-emerald-700 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-200 truncate">
                    {attachedImage.name}
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400">
                    Ready for Gemini Visual Analysis
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="p-1 text-emerald-700 dark:text-emerald-300 hover:text-rose-600 dark:hover:text-rose-400 transition"
                title="Remove attached image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleImageFileSelect}
          />

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-[#0D1322] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className={`p-2.5 rounded-xl border transition shrink-0 cursor-pointer flex items-center justify-center ${
                attachedImage
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Upload clothing or outfit photo for AI styling"
            >
              <Camera className="w-4 h-4" />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                attachedImage
                  ? 'Ask about this image (or press Send for full analysis)...'
                  : `Ask ${activeRoleConfig.name} or upload photo...`
              }
              disabled={isLoading}
              className="flex-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            <button
              type="submit"
              disabled={(!input.trim() && !attachedImage) || isLoading}
              className="p-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-700 text-white disabled:opacity-40 disabled:pointer-events-none transition shrink-0 cursor-pointer"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
