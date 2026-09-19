var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// cloud-functions/api/[[default]].ts
var default_exports = {};
__export(default_exports, {
  default: () => default_default
});
module.exports = __toCommonJS(default_exports);

// server/wardrobeTaxonomy.ts
var WARDROBE_TAXONOMY = {
  "Tops": ["Shirt", "T-shirt", "Polo", "Blouse", "Sweater", "Cardigan", "Hoodie", "Tank Top", "Turtleneck", "Button-Down Shirt", "Overshirt"],
  "Bottoms": ["Trousers", "Chinos", "Jeans", "Shorts", "Skirt", "Dress Pants", "Linen Trousers"],
  "Dresses": ["Dress", "Midi Dress", "Maxi Dress", "Shirt Dress", "Slip Dress"],
  "Outerwear": ["Blazer", "Suit Jacket", "Jacket", "Coat", "Trench Coat", "Overcoat", "Puffer", "Bomber", "Leather Jacket", "Cardigan Coat"],
  "Footwear": ["Sneakers", "Loafers", "Derby Shoes", "Oxford Shoes", "Boots", "Chelsea Boots", "Sandals", "Slides", "Formal Shoes", "Monkstrap"],
  "Bags": ["Backpack", "Tote", "Briefcase", "Crossbody", "Shoulder Bag", "Clutch", "Duffle"],
  "Accessories": ["Sunglasses", "Belt", "Watch", "Scarf", "Hat", "Cap", "Tie", "Pocket Square", "Gloves", "Other Accessory"],
  "Jewelry": ["Ring", "Bracelet", "Necklace", "Earrings", "Cufflinks"],
  "Activewear": ["Sports Top", "Sports Bottom", "Track Pants", "Training Shorts", "Sports Shoes"],
  "Formalwear": ["Suit", "Tuxedo", "Formal Shirt", "Waistcoat", "Formal Trousers"]
};
function validateAndFixCategory(type, category) {
  if (!type && !category) return "Tops";
  const t = (type || "").toLowerCase();
  const c = (category || "").toLowerCase();
  if (t.includes("sunglass") || t.includes("glasses") || t.includes("watch") || t.includes("belt") || t.includes("scarf") || t.includes("tie") || t.includes("cap") || t.includes("hat") || t.includes("glove")) {
    return "Accessories";
  }
  if (t.includes("shoe") || t.includes("boot") || t.includes("sneaker") || t.includes("loafer") || t.includes("derby") || t.includes("oxford") || t.includes("sandal") || t.includes("slide") || t.includes("heel") || t.includes("flat")) {
    return "Footwear";
  }
  if (t.includes("bag") || t.includes("backpack") || t.includes("tote") || t.includes("briefcase") || t.includes("clutch") || t.includes("duffle")) {
    return "Bags";
  }
  if (t.includes("coat") || t.includes("jacket") || t.includes("blazer") || t.includes("parka") || t.includes("trench") || t.includes("puffer") || t.includes("bomber") || t.includes("cardigan coat")) {
    return "Outerwear";
  }
  if (t.includes("dress") || t.includes("gown")) {
    return "Dresses";
  }
  if (t.includes("tuxedo") || t.includes("suit") && !t.includes("swim")) {
    return "Formalwear";
  }
  if (t.includes("pant") || t.includes("jean") || t.includes("trouser") || t.includes("chino") || t.includes("short") || t.includes("skirt") || t.includes("legging")) {
    return "Bottoms";
  }
  if (t.includes("shirt") || t.includes("tee") || t.includes("polo") || t.includes("sweater") || t.includes("hoodie") || t.includes("top") || t.includes("blouse") || t.includes("turtleneck") || t.includes("knit")) {
    return "Tops";
  }
  for (const [cat, types] of Object.entries(WARDROBE_TAXONOMY)) {
    if (types.some((typeName) => typeName.toLowerCase() === t)) {
      return cat;
    }
  }
  const validCategory = Object.keys(WARDROBE_TAXONOMY).find((cat) => cat.toLowerCase() === c);
  if (validCategory) return validCategory;
  return "Tops";
}
function normalizeColor(rawColor) {
  const c = (rawColor || "").toLowerCase().trim();
  if (!c || c === "unknown" || c === "none") {
    return {
      originalColor: rawColor || "Unknown",
      family: "UNKNOWN",
      isNeutral: true,
      isDark: false,
      isLight: false,
      temperature: "NEUTRAL",
      displayName: "Neutral"
    };
  }
  if (c.includes("navy") || c.includes("midnight") || c.includes("dark blue")) {
    return { originalColor: rawColor, family: "BLUE", isNeutral: true, isDark: true, isLight: false, temperature: "COOL", displayName: "Navy" };
  }
  if (c.includes("cobalt") || c.includes("royal blue") || c.includes("denim") || c.includes("indigo") || c.includes("blue") || c.includes("sky blue") || c.includes("teal") || c.includes("cyan")) {
    return { originalColor: rawColor, family: "BLUE", isNeutral: false, isDark: c.includes("indigo") || c.includes("denim"), isLight: c.includes("sky"), temperature: "COOL", displayName: "Blue" };
  }
  if (c.includes("burgundy") || c.includes("wine") || c.includes("maroon") || c.includes("oxblood")) {
    return { originalColor: rawColor, family: "RED", isNeutral: false, isDark: true, isLight: false, temperature: "WARM", displayName: "Burgundy" };
  }
  if (c.includes("red") || c.includes("crimson") || c.includes("scarlet") || c.includes("cherry")) {
    return { originalColor: rawColor, family: "RED", isNeutral: false, isDark: false, isLight: false, temperature: "WARM", displayName: "Red" };
  }
  if (c.includes("charcoal") || c.includes("dark grey") || c.includes("dark gray") || c.includes("anthracite") || c.includes("gunmetal")) {
    return { originalColor: rawColor, family: "GREY", isNeutral: true, isDark: true, isLight: false, temperature: "NEUTRAL", displayName: "Charcoal" };
  }
  if (c.includes("grey") || c.includes("gray") || c.includes("slate") || c.includes("silver") || c.includes("ash") || c.includes("heather")) {
    return { originalColor: rawColor, family: "GREY", isNeutral: true, isDark: false, isLight: c.includes("light") || c.includes("silver"), temperature: "NEUTRAL", displayName: "Grey" };
  }
  if (c.includes("ivory") || c.includes("off-white") || c.includes("off white") || c.includes("cream") || c.includes("bone") || c.includes("alabaster") || c.includes("ecru") || c.includes("eggshell")) {
    return { originalColor: rawColor, family: "WHITE", isNeutral: true, isDark: false, isLight: true, temperature: "WARM", displayName: "Ivory / Off-White" };
  }
  if (c.includes("white") || c.includes("crisp white") || c.includes("pure white") || c.includes("snow")) {
    return { originalColor: rawColor, family: "WHITE", isNeutral: true, isDark: false, isLight: true, temperature: "NEUTRAL", displayName: "White" };
  }
  if (c.includes("camel") || c.includes("tan") || c.includes("cognac") || c.includes("caramel")) {
    return { originalColor: rawColor, family: "BROWN", isNeutral: true, isDark: false, isLight: true, temperature: "WARM", displayName: "Camel" };
  }
  if (c.includes("beige") || c.includes("sand") || c.includes("taupe") || c.includes("khaki") || c.includes("nude")) {
    return { originalColor: rawColor, family: "BROWN", isNeutral: true, isDark: false, isLight: true, temperature: "WARM", displayName: "Beige" };
  }
  if (c.includes("brown") || c.includes("chocolate") || c.includes("espresso") || c.includes("coffee") || c.includes("mocha") || c.includes("chestnut")) {
    return { originalColor: rawColor, family: "BROWN", isNeutral: true, isDark: true, isLight: false, temperature: "WARM", displayName: "Brown" };
  }
  if (c.includes("olive") || c.includes("army green") || c.includes("military green") || c.includes("khaki green")) {
    return { originalColor: rawColor, family: "GREEN", isNeutral: true, isDark: false, isLight: false, temperature: "WARM", displayName: "Olive" };
  }
  if (c.includes("sage") || c.includes("mint") || c.includes("pistachio")) {
    return { originalColor: rawColor, family: "GREEN", isNeutral: false, isDark: false, isLight: true, temperature: "COOL", displayName: "Sage / Mint" };
  }
  if (c.includes("green") || c.includes("forest") || c.includes("emerald") || c.includes("bottle green") || c.includes("pine")) {
    return { originalColor: rawColor, family: "GREEN", isNeutral: false, isDark: c.includes("forest") || c.includes("bottle"), isLight: false, temperature: "COOL", displayName: "Green" };
  }
  if (c.includes("black") || c.includes("jet") || c.includes("onyx") || c.includes("pitch")) {
    return { originalColor: rawColor, family: "BLACK", isNeutral: true, isDark: true, isLight: false, temperature: "NEUTRAL", displayName: "Black" };
  }
  if (c.includes("mustard") || c.includes("ochre") || c.includes("gold") || c.includes("yellow") || c.includes("amber")) {
    return { originalColor: rawColor, family: "YELLOW", isNeutral: false, isDark: false, isLight: !c.includes("mustard"), temperature: "WARM", displayName: "Mustard / Yellow" };
  }
  if (c.includes("terracotta") || c.includes("rust") || c.includes("burnt orange") || c.includes("copper") || c.includes("orange") || c.includes("peach") || c.includes("coral")) {
    return { originalColor: rawColor, family: "ORANGE", isNeutral: false, isDark: c.includes("terracotta") || c.includes("rust"), isLight: c.includes("peach"), temperature: "WARM", displayName: "Terracotta" };
  }
  if (c.includes("plum") || c.includes("lavender") || c.includes("violet") || c.includes("purple") || c.includes("lilac") || c.includes("mauve") || c.includes("aubergine")) {
    return { originalColor: rawColor, family: "PURPLE", isNeutral: false, isDark: c.includes("plum") || c.includes("aubergine"), isLight: c.includes("lavender"), temperature: "COOL", displayName: "Purple" };
  }
  if (c.includes("pink") || c.includes("blush") || c.includes("rose") || c.includes("salmon") || c.includes("magenta")) {
    return { originalColor: rawColor, family: "PINK", isNeutral: false, isDark: false, isLight: true, temperature: "WARM", displayName: "Pink" };
  }
  return {
    originalColor: rawColor,
    family: "UNKNOWN",
    isNeutral: true,
    isDark: false,
    isLight: false,
    temperature: "NEUTRAL",
    displayName: rawColor
  };
}
function evaluateColorCompatibility(colors) {
  const normalized = colors.map(normalizeColor).filter((c) => c.family !== "UNKNOWN");
  if (normalized.length <= 1) {
    return { score: 85, reason: "Cohesive single-color baseline", isClash: false };
  }
  const families = normalized.map((c) => c.family);
  const uniqueFamilies = Array.from(new Set(families));
  if (uniqueFamilies.length === 1) {
    const hasLight = normalized.some((c) => c.isLight);
    const hasDark = normalized.some((c) => c.isDark);
    if (hasLight && hasDark) {
      return { score: 95, reason: "Refined tonal monochrome with balanced dark/light contrast", isClash: false };
    }
    return { score: 88, reason: "Clean monochromatic alignment", isClash: false };
  }
  const neutralCount = normalized.filter((c) => c.isNeutral).length;
  const nonNeutralFamilies = uniqueFamilies.filter((f) => f !== "BLACK" && f !== "WHITE" && f !== "GREY" && f !== "BROWN");
  if (nonNeutralFamilies.length > 2) {
    return {
      score: 35,
      reason: "Too many competing non-neutral color families create visual chaos",
      isClash: true
    };
  }
  const pairStrings = /* @__PURE__ */ new Set();
  for (let i = 0; i < families.length; i++) {
    for (let j = i + 1; j < families.length; j++) {
      const p1 = families[i];
      const p2 = families[j];
      pairStrings.add([p1, p2].sort().join("+"));
    }
  }
  const HARMONIOUS_FAMILY_PAIRS = /* @__PURE__ */ new Set([
    "BLUE+WHITE",
    "BLACK+WHITE",
    "GREY+WHITE",
    "BLUE+BROWN",
    // Navy + Camel / Brown
    "BLACK+GREY",
    "BLACK+BROWN",
    // Black + Camel / Tan
    "BROWN+WHITE",
    // Camel + Ivory / White
    "BLUE+GREY",
    // Navy + Charcoal / Grey
    "GREEN+WHITE",
    // Olive + Cream / White
    "BROWN+GREEN",
    // Olive + Camel / Tan
    "BLUE+GREEN",
    // Navy + Olive / Sage
    "GREY+RED",
    // Charcoal + Burgundy
    "BLUE+RED",
    // Navy + Burgundy
    "BROWN+ORANGE",
    // Tan + Terracotta
    "BLUE+ORANGE",
    // Navy + Terracotta (complementary)
    "BLACK+RED",
    // Black + Burgundy
    "GREEN+GREY"
    // Olive + Grey
  ]);
  let harmonyBonuses = 0;
  pairStrings.forEach((pair) => {
    if (HARMONIOUS_FAMILY_PAIRS.has(pair)) {
      harmonyBonuses += 1;
    }
  });
  const hasDarkAnchor = normalized.some((c) => c.isDark);
  const hasLightPiece = normalized.some((c) => c.isLight);
  let calculatedScore = 70;
  if (neutralCount >= 1) calculatedScore += 10;
  if (neutralCount >= 2) calculatedScore += 5;
  if (hasDarkAnchor && hasLightPiece) calculatedScore += 8;
  calculatedScore += Math.min(15, harmonyBonuses * 6);
  const warmCount = normalized.filter((c) => c.temperature === "WARM" && !c.isNeutral).length;
  const coolCount = normalized.filter((c) => c.temperature === "COOL" && !c.isNeutral).length;
  if (warmCount > 0 && coolCount > 0 && neutralCount === 0) {
    calculatedScore -= 15;
  }
  const finalScore = Math.max(30, Math.min(98, calculatedScore));
  return {
    score: finalScore,
    reason: neutralCount > 0 ? "Grounded by clean neutral anchoring with compatible tonal balance" : "Harmonious palette contrast across selected pieces",
    isClash: finalScore < 50
  };
}
function normalizePattern(rawPattern) {
  const p = (rawPattern || "").toLowerCase().trim();
  if (!p || p === "solid" || p === "plain") return "Solid";
  if (p.includes("stripe")) return "Striped";
  if (p.includes("plaid") || p.includes("tartan")) return "Plaid";
  if (p.includes("check") || p.includes("gingham") || p.includes("windowpane")) return "Checked";
  if (p.includes("houndstooth")) return "Houndstooth";
  if (p.includes("floral") || p.includes("botanical")) return "Floral";
  if (p.includes("graphic") || p.includes("logo") || p.includes("print")) return "Graphic";
  if (p.includes("texture") || p.includes("waffle") || p.includes("ribbed") || p.includes("knit") || p.includes("cable") || p.includes("herringbone")) return "Textured";
  if (p.includes("dot")) return "Polka Dot";
  if (p.includes("abstract") || p.includes("camo") || p.includes("animal") || p.includes("tie-dye")) return "Loud Pattern";
  return "Solid";
}
function evaluatePatternCompatibility(patterns) {
  const normalized = patterns.map(normalizePattern);
  const nonSolid = normalized.filter((p) => p !== "Solid" && p !== "Textured");
  if (nonSolid.length === 0) {
    return { score: 95, reason: "Clean solid and textured foundation creates timeless minimalism", isClash: false };
  }
  if (nonSolid.length === 1) {
    return {
      score: 92,
      reason: `The ${nonSolid[0].toLowerCase()} piece acts as a clear focal statement balanced by solid grounding`,
      isClash: false
    };
  }
  const p1 = nonSolid[0];
  const p2 = nonSolid[1];
  if (p1 === "Plaid" && p2 === "Graphic" || p1 === "Graphic" && p2 === "Plaid") {
    return { score: 20, reason: "Plaid and loud graphic prints compete aggressively", isClash: true };
  }
  if (p1 === "Plaid" && p2 === "Floral" || p1 === "Floral" && p2 === "Plaid") {
    return { score: 20, reason: "Plaid and floral prints create severe visual discord", isClash: true };
  }
  if (p1 === "Graphic" && p2 === "Graphic") {
    return { score: 25, reason: "Multiple bold graphic prints conflict visually", isClash: true };
  }
  if (p1 === "Loud Pattern" || p2 === "Loud Pattern") {
    return { score: 25, reason: "High-contrast loud prints overwhelm the silhouette", isClash: true };
  }
  if (p1 === "Striped" && p2 === "Striped") {
    return { score: 55, reason: "Dual stripes require precise scale variance to avoid visual vibration", isClash: false };
  }
  if (p1 === "Striped" && (p2 === "Checked" || p2 === "Houndstooth") || p2 === "Striped" && (p1 === "Checked" || p1 === "Houndstooth")) {
    return { score: 65, reason: "Stripes and micro-checks can work when one pattern is micro-scale", isClash: false };
  }
  return { score: 50, reason: "Multiple distinct patterns introduce visual tension", isClash: false };
}
var FORMALITY_LEVELS = {
  "Casual": 1,
  "Smart Casual": 2,
  "Business Casual": 3,
  "Formal": 4,
  "Black Tie": 5
};
function normalizeFormality(item) {
  const text = `${item.name || ""} ${item.type || ""} ${item.subcategory || ""} ${item.formality || ""} ${item.material || ""}`.toLowerCase();
  if (text.includes("tuxedo") || text.includes("black tie") || text.includes("evening gown") || text.includes("patent leather")) {
    return 5;
  }
  if (text.includes("suit") || text.includes("dress shirt") || text.includes("oxford shoes") || text.includes("formal trousers") || text.includes("derby shoes") || text.includes("overcoat")) {
    return 4;
  }
  if (text.includes("blazer") || text.includes("sport coat") || text.includes("dress chinos") || text.includes("tailored") || text.includes("monkstrap") || text.includes("loafers") || text.includes("chelsea boot")) {
    return 3;
  }
  if (text.includes("polo") || text.includes("oxford shirt") || text.includes("button-down") || text.includes("chinos") || text.includes("dark jeans") || text.includes("clean sneakers") || text.includes("sweater") || text.includes("cardigan") || text.includes("bomber")) {
    return 2;
  }
  if (text.includes("t-shirt") || text.includes("tank top") || text.includes("hoodie") || text.includes("sweatpants") || text.includes("joggers") || text.includes("shorts") || text.includes("sandals") || text.includes("slides") || text.includes("running") || text.includes("gym")) {
    return 1;
  }
  if (item.formality && FORMALITY_LEVELS[item.formality]) {
    return FORMALITY_LEVELS[item.formality];
  }
  return 2;
}
var OCCASION_FORMALITY_REQUIREMENTS = {
  "Casual": { min: 1, max: 2, target: 1 },
  "Casual day": { min: 1, max: 2, target: 1 },
  "Casual outing": { min: 1, max: 2, target: 1 },
  "Outdoor": { min: 1, max: 2, target: 1 },
  "Travel": { min: 1, max: 2, target: 1 },
  "College": { min: 1, max: 2, target: 1 },
  "Athletic": { min: 1, max: 2, target: 1 },
  "Brunch": { min: 1, max: 3, target: 2 },
  "Weekend": { min: 1, max: 2, target: 1.5 },
  "Date": { min: 2, max: 3, target: 2 },
  "Dinner": { min: 2, max: 4, target: 2.5 },
  "Party": { min: 2, max: 4, target: 3 },
  "Work": { min: 2, max: 4, target: 3 },
  "Business Casual": { min: 2, max: 4, target: 3 },
  "Presentation": { min: 3, max: 5, target: 4 },
  "Interview": { min: 3, max: 5, target: 4 },
  "Formal": { min: 4, max: 5, target: 4 },
  "Wedding": { min: 4, max: 5, target: 4.5 },
  "Black Tie": { min: 5, max: 5, target: 5 }
};
function normalizeTemperatureCondition(tempC) {
  if (tempC === void 0 || isNaN(tempC)) return "Unavailable";
  if (tempC < 5) return "Very Cold";
  if (tempC < 14) return "Cold";
  if (tempC < 22) return "Mild";
  if (tempC < 28) return "Warm";
  return "Hot";
}
function evaluateThermalSuitability(items, tempC) {
  if (tempC === void 0) {
    return { isCompatible: true, score: 85, reason: "Adaptive all-season layering" };
  }
  const condition = normalizeTemperatureCondition(tempC);
  const text = items.map((i) => `${i.name || ""} ${i.type || ""} ${i.material || ""}`).join(" ").toLowerCase();
  const hasHeavyOuterwear = items.some((i) => i.category === "Outerwear" && /coat|parka|down|puffer|shearling|heavy wool/i.test(i.name + " " + (i.material || "")));
  const hasShortsOrSandals = /short|sandal|slide|flip flop|tank top|sleeveless/i.test(text);
  if (condition === "Hot" || condition === "Warm") {
    if (hasHeavyOuterwear) {
      return { isCompatible: false, score: 20, reason: `Heavy outerwear is uncomfortably hot for ${tempC}\xB0C weather` };
    }
    return { isCompatible: true, score: 95, reason: `Breathable silhouette suited for ${tempC}\xB0C conditions` };
  }
  if (condition === "Cold" || condition === "Very Cold") {
    if (hasShortsOrSandals) {
      return { isCompatible: false, score: 15, reason: `Shorts or open footwear are unsuitable for ${tempC}\xB0C cold weather` };
    }
    const hasOuterwear = items.some((i) => i.category === "Outerwear");
    if (!hasOuterwear && condition === "Very Cold") {
      return { isCompatible: true, score: 60, reason: `Warm outerwear recommended for ${tempC}\xB0C conditions` };
    }
    return { isCompatible: true, score: 92, reason: `Insulating layers calibrated for ${tempC}\xB0C cold conditions` };
  }
  return { isCompatible: true, score: 90, reason: `Comfortable fabric weights for mild ${tempC}\xB0C weather` };
}

// server/geminiConfig.ts
var PRIMARY_GEMINI_MODEL = "gemini-3.6-flash";
var DEPRECATED_MODEL_PATTERNS = [
  /^gemini-1\./i,
  /^gemini-2\./i,
  /^models\/gemini-1\./i,
  /^models\/gemini-2\./i,
  /gemini-pro$/i
];
function getGeminiModel() {
  const configured = process.env.GEMINI_MODEL?.trim();
  if (!configured) {
    return PRIMARY_GEMINI_MODEL;
  }
  const normalized = configured.replace(/^models\//i, "");
  const isDeprecated = DEPRECATED_MODEL_PATTERNS.some((pattern) => pattern.test(configured) || pattern.test(normalized));
  if (isDeprecated) {
    return PRIMARY_GEMINI_MODEL;
  }
  if (/^gemini-3\./i.test(normalized)) {
    return normalized;
  }
  return PRIMARY_GEMINI_MODEL;
}

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_genai2 = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);

// server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var DB_FILE = import_path.default.join(DATA_DIR, "paurvi_db.json");
function hashPassword(password, salt) {
  const generatedSalt = salt || import_crypto.default.randomBytes(16).toString("hex");
  const hash = import_crypto.default.pbkdf2Sync(password, generatedSalt, 1e4, 64, "sha512").toString("hex");
  return { hash, salt: generatedSalt };
}
function verifyPassword(password, hash, salt) {
  const calculated = import_crypto.default.pbkdf2Sync(password, salt, 1e4, 64, "sha512").toString("hex");
  return import_crypto.default.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(calculated, "hex"));
}
function generateToken() {
  return "paurvi_tok_" + import_crypto.default.randomBytes(32).toString("hex");
}
function defaultPreferences() {
  return {
    styleVibes: ["Minimal", "Classic"],
    favoriteColors: ["Black", "Ivory", "Navy", "Camel"],
    dislikedColors: [],
    preferredFits: ["Tailored", "Relaxed"],
    temperatureUnit: "Celsius",
    theme: "Dark",
    notifications: {
      dailySuggestions: true,
      plannerReminders: true,
      weatherAlerts: true,
      productUpdates: false
    },
    privacy: {
      improveRecommendations: true,
      publicProfile: false,
      shareOutfits: false
    },
    security: {
      twoFactorEnabled: false,
      activeSessionsCount: 1
    },
    stylistRules: {
      onlyUseOwnedItems: true,
      explainSuggestions: true,
      autoTagNewItems: true
    }
  };
}
var PaurviDatabase = class {
  constructor() {
    this.ensureDataDirectory();
    this.data = this.load();
    this.data.users = this.data.users || [];
    this.data.sessions = this.data.sessions || [];
    this.data.wardrobes = this.data.wardrobes || {};
    this.data.outfits = this.data.outfits || {};
    this.data.plans = this.data.plans || {};
    this.data.wearHistory = this.data.wearHistory || {};
    this.data.stylistConversations = this.data.stylistConversations || {};
    this.data.activityLogs = this.data.activityLogs || [];
    this.data.aiRequestsCount = this.data.aiRequestsCount || {};
    this.seedInitialSupervisorIfEmpty();
  }
  ensureDataDirectory() {
    if (!import_fs.default.existsSync(DATA_DIR)) {
      import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
    }
  }
  load() {
    try {
      if (import_fs.default.existsSync(DB_FILE)) {
        const raw = import_fs.default.readFileSync(DB_FILE, "utf-8");
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error("Failed to load database file, initializing fresh store:", err);
    }
    return {
      users: [],
      sessions: [],
      wardrobes: {},
      outfits: {},
      plans: {},
      wearHistory: {},
      stylistConversations: {},
      activityLogs: [],
      aiRequestsCount: {}
    };
  }
  save() {
    try {
      this.ensureDataDirectory();
      const tempFile = `${DB_FILE}.tmp`;
      import_fs.default.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), "utf-8");
      import_fs.default.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error("Failed to write database file:", err);
    }
  }
  seedInitialSupervisorIfEmpty() {
    const existingSupervisor = this.data.users.find((u) => u.id === "usr_supervisor_paurvi");
    if (existingSupervisor) {
      if (existingSupervisor.role !== "supervisor" && existingSupervisor.role !== "admin") {
        existingSupervisor.role = "supervisor";
        this.save();
      }
    } else {
      const hasAdmin = this.data.users.some((u) => u.role === "supervisor" || u.role === "admin");
      if (!hasAdmin) {
        const { hash, salt } = hashPassword((process.env.ADMIN_PASSWORD || "1211").trim());
        const supervisor = {
          id: "usr_supervisor_paurvi",
          name: "Nitin Singla (Admin)",
          email: "nitinsingla256@gmail.com",
          passwordHash: hash,
          salt,
          role: "supervisor",
          status: "Active",
          joinedDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          lastActive: (/* @__PURE__ */ new Date()).toISOString(),
          pronouns: "she/they",
          bio: "Lead Atelier Supervisor & Haute Horlogerie Archivist.",
          location: "",
          preferences: defaultPreferences()
        };
        this.data.users.push(supervisor);
        this.data.wardrobes[supervisor.id] = [];
        this.data.outfits[supervisor.id] = [];
        this.data.plans[supervisor.id] = [];
        this.data.wearHistory[supervisor.id] = [];
        this.data.stylistConversations[supervisor.id] = [];
        this.data.aiRequestsCount[supervisor.id] = 0;
        this.data.activityLogs.unshift({
          id: `log_init_${Date.now()}`,
          userId: supervisor.id,
          userName: supervisor.name,
          userEmail: supervisor.email,
          action: "System initialized and supervisor account provisioned",
          category: "SYSTEM",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        this.save();
      }
    }
    const hasMasterAdmin = this.data.users.some((u) => u.email.toLowerCase() === "nitinsingla256@gmail.com");
    if (!hasMasterAdmin) {
      const { hash, salt } = hashPassword((process.env.ADMIN_INITIAL_PASSWORD || "1211").trim());
      const masterAdmin = {
        id: "usr_master_admin_paurvi",
        name: "Master Administrator",
        email: "nitinsingla256@gmail.com",
        passwordHash: hash,
        salt,
        role: "admin",
        status: "Active",
        joinedDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        lastActive: (/* @__PURE__ */ new Date()).toISOString(),
        pronouns: "they/them",
        bio: "Master Administrator of PAURVI Atelier.",
        location: "",
        preferences: defaultPreferences()
      };
      this.data.users.push(masterAdmin);
      this.data.wardrobes[masterAdmin.id] = [];
      this.data.outfits[masterAdmin.id] = [];
      this.data.plans[masterAdmin.id] = [];
      this.data.wearHistory[masterAdmin.id] = [];
      this.data.stylistConversations[masterAdmin.id] = [];
      this.data.aiRequestsCount[masterAdmin.id] = 0;
      this.save();
    }
  }
  // --- Auth Operations ---
  createUser(name, email, passwordPlain, role = "user") {
    const cleanEmail = email.toLowerCase().trim();
    const existing = this.data.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error("An account with this email address already exists.");
    }
    const { hash, salt } = hashPassword(passwordPlain);
    const userId = `usr_${Date.now()}_${import_crypto.default.randomBytes(4).toString("hex")}`;
    const newUser = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      passwordHash: hash,
      salt,
      role,
      status: "Active",
      joinedDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      lastActive: (/* @__PURE__ */ new Date()).toISOString(),
      pronouns: "they/them",
      bio: "Member of the PAURVI Atelier private wardrobe capsule.",
      location: "",
      preferences: defaultPreferences()
    };
    this.data.users.push(newUser);
    this.data.wardrobes[userId] = [];
    this.data.outfits[userId] = [];
    this.data.plans[userId] = [];
    this.data.wearHistory[userId] = [];
    this.data.stylistConversations[userId] = [];
    this.data.aiRequestsCount[userId] = 0;
    this.logActivity(userId, newUser.name, newUser.email, "User registered new PAURVI account", "AUTH");
    this.save();
    return newUser;
  }
  authenticate(email, passwordPlain) {
    const cleanEmail = email.toLowerCase().trim();
    const user = this.data.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error("Invalid email address or password.");
    }
    if (user.status === "Suspended") {
      throw new Error("This account has been suspended. Please contact supervisor support.");
    }
    const isValid = verifyPassword(passwordPlain.trim(), user.passwordHash, user.salt);
    if (!isValid) {
      throw new Error("Invalid email address or password.");
    }
    user.lastActive = (/* @__PURE__ */ new Date()).toISOString();
    const token = generateToken();
    const session = {
      token,
      userId: user.id,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString()
    };
    this.data.sessions.push(session);
    this.logActivity(user.id, user.name, user.email, "User signed into PAURVI", "AUTH");
    this.save();
    return { user, token };
  }
  getUserByToken(token) {
    if (!token) return null;
    const session = this.data.sessions.find((s) => s.token === token);
    if (!session) return null;
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
      this.save();
      return null;
    }
    const user = this.data.users.find((u) => u.id === session.userId);
    if (!user || user.status === "Suspended") return null;
    user.lastActive = (/* @__PURE__ */ new Date()).toISOString();
    return user;
  }
  getUserById(userId) {
    if (!userId) return null;
    return this.data.users.find((u) => u.id === userId && u.status !== "Suspended") || null;
  }
  getOrCreateClientUser() {
    const existing = this.data.users.find((u) => u.id === "usr_client_paurvi" || u.role === "user");
    if (existing) return existing;
    return this.data.users[0];
  }
  invalidateSession(token) {
    const initialLen = this.data.sessions.length;
    this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
    if (this.data.sessions.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }
  requestPasswordReset(email) {
    const cleanEmail = email.toLowerCase().trim();
    const user = this.data.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error("No account found with this email address.");
    }
    const resetToken = "rst_" + import_crypto.default.randomBytes(6).toString("hex").toUpperCase();
    user.resetToken = resetToken;
    user.resetExpires = Date.now() + 60 * 60 * 1e3;
    this.logActivity(user.id, user.name, user.email, "User requested password reset code", "AUTH", { resetCode: resetToken });
    this.save();
    return { resetToken, user };
  }
  resetPassword(email, resetToken, newPasswordPlain) {
    const cleanEmail = email.toLowerCase().trim();
    const user = this.data.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error("Account not found.");
    }
    if (!user.resetToken || user.resetToken !== resetToken.trim()) {
      throw new Error("Invalid or expired password reset code.");
    }
    if (!user.resetExpires || user.resetExpires < Date.now()) {
      throw new Error("Password reset code has expired. Please request a new code.");
    }
    const { hash, salt } = hashPassword(newPasswordPlain);
    user.passwordHash = hash;
    user.salt = salt;
    user.resetToken = void 0;
    user.resetExpires = void 0;
    this.data.sessions = this.data.sessions.filter((s) => s.userId !== user.id);
    this.logActivity(user.id, user.name, user.email, "User successfully reset password", "AUTH");
    this.save();
    return true;
  }
  updateUserProfile(userId, updates) {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found.");
    if (updates.name) user.name = updates.name.trim();
    if (updates.pronouns) user.pronouns = updates.pronouns;
    if (updates.bio) user.bio = updates.bio;
    if (updates.location) user.location = updates.location;
    if (updates.avatarUrl) user.avatarUrl = updates.avatarUrl;
    if (updates.measurements) {
      user.measurements = {
        ...user.measurements,
        ...updates.measurements
      };
    }
    if (updates.preferences) {
      user.preferences = {
        ...user.preferences,
        ...updates.preferences
      };
    }
    if (updates.profile) {
      user.profile = {
        ...user.profile,
        ...updates.profile
      };
    }
    this.logActivity(user.id, user.name, user.email, "User updated style profile and preferences", "SETTINGS");
    this.save();
    return user;
  }
  // --- Wardrobe Operations ---
  getWardrobe(userId) {
    return this.data.wardrobes[userId] || [];
  }
  addWardrobeItem(userId, itemData) {
    const items = this.data.wardrobes[userId] || [];
    const newItem = {
      ...itemData,
      id: `item_${Date.now()}_${import_crypto.default.randomBytes(3).toString("hex")}`,
      timesWorn: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.wardrobes[userId] = [newItem, ...items];
    const user = this.data.users.find((u) => u.id === userId);
    this.logActivity(userId, user?.name || "User", user?.email || "", `Catalogued new piece: "${newItem.name}" (${newItem.category})`, "WARDROBE");
    this.save();
    return newItem;
  }
  updateWardrobeItem(userId, itemId, updates) {
    const items = this.data.wardrobes[userId] || [];
    const index = items.findIndex((i) => i.id === itemId);
    if (index === -1) throw new Error("Wardrobe item not found");
    const updated = {
      ...items[index],
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    items[index] = updated;
    this.data.wardrobes[userId] = items;
    this.save();
    return updated;
  }
  deleteWardrobeItem(userId, itemId) {
    const items = this.data.wardrobes[userId] || [];
    const item = items.find((i) => i.id === itemId);
    this.data.wardrobes[userId] = items.filter((i) => i.id !== itemId);
    const user = this.data.users.find((u) => u.id === userId);
    if (item) {
      this.logActivity(userId, user?.name || "User", user?.email || "", `Removed piece: "${item.name}" from wardrobe`, "WARDROBE");
    }
    this.save();
    return true;
  }
  deleteWardrobeItems(userId, itemIds) {
    if (!itemIds || itemIds.length === 0) {
      return { deletedIds: [], remainingCount: (this.data.wardrobes[userId] || []).length };
    }
    const idSet = new Set(itemIds);
    const current = this.data.wardrobes[userId] || [];
    const removed = current.filter((i) => idSet.has(i.id));
    const remaining = current.filter((i) => !idSet.has(i.id));
    this.data.wardrobes[userId] = remaining;
    const user = this.data.users.find((u) => u.id === userId);
    if (removed.length > 0) {
      this.logActivity(
        userId,
        user?.name || "User",
        user?.email || "",
        `Removed ${removed.length} pieces from wardrobe in batch`,
        "WARDROBE"
      );
    }
    this.save();
    return {
      deletedIds: removed.map((r) => r.id),
      remainingCount: remaining.length
    };
  }
  clearWardrobe(userId) {
    const count = (this.data.wardrobes[userId] || []).length;
    this.data.wardrobes[userId] = [];
    const user = this.data.users.find((u) => u.id === userId);
    this.logActivity(userId, user?.name || "User", user?.email || "", `Cleared all wardrobe items (${count} items removed)`, "WARDROBE");
    this.save();
    return true;
  }
  toggleWardrobeFavorite(userId, itemId) {
    const items = this.data.wardrobes[userId] || [];
    const index = items.findIndex((i) => i.id === itemId);
    if (index === -1) throw new Error("Item not found");
    items[index].isFavorite = !items[index].isFavorite;
    items[index].updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const user = this.data.users.find((u) => u.id === userId);
    this.logActivity(userId, user?.name || "User", user?.email || "", `${items[index].isFavorite ? "Favorited" : "Unfavorited"} piece: "${items[index].name}"`, "WARDROBE");
    this.save();
    return items[index];
  }
  recordWearItem(userId, itemId) {
    const items = this.data.wardrobes[userId] || [];
    const index = items.findIndex((i) => i.id === itemId);
    if (index === -1) throw new Error("Item not found");
    items[index].timesWorn = (items[index].timesWorn || 0) + 1;
    items[index].lastWornDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    items[index].updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const wearEvents = this.data.wearHistory[userId] || [];
    wearEvents.unshift({
      id: `wear_${Date.now()}`,
      userId,
      itemIds: [itemId],
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    this.data.wearHistory[userId] = wearEvents;
    const user = this.data.users.find((u) => u.id === userId);
    this.logActivity(userId, user?.name || "User", user?.email || "", `Logged wear for piece: "${items[index].name}" (Cycle: ${items[index].timesWorn})`, "WARDROBE");
    this.save();
    return items[index];
  }
  // --- Outfits Operations ---
  getOutfits(userId) {
    return this.data.outfits[userId] || [];
  }
  addOutfit(userId, outfitData) {
    const list = this.data.outfits[userId] || [];
    const userWardrobe = this.data.wardrobes[userId] || [];
    const validItemIds = new Set(userWardrobe.map((w) => w.id));
    let sanitizedItems = outfitData.items;
    if (Array.isArray(sanitizedItems)) {
      sanitizedItems = sanitizedItems.map((ref) => {
        if (ref.itemId && !validItemIds.has(ref.itemId)) {
          return {
            ...ref,
            itemId: null,
            notes: ref.notes ? `${ref.notes} (Suggested piece - not currently owned)` : "Suggested piece - not currently owned"
          };
        }
        return ref;
      });
    }
    const newOutfit = {
      ...outfitData,
      items: sanitizedItems || [],
      id: `outfit_${Date.now()}_${import_crypto.default.randomBytes(3).toString("hex")}`,
      timesWorn: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.outfits[userId] = [newOutfit, ...list];
    const user = this.data.users.find((u) => u.id === userId);
    this.logActivity(userId, user?.name || "User", user?.email || "", `Saved look to Lookbook: "${newOutfit.name}"`, "AI_STYLIST");
    this.save();
    return newOutfit;
  }
  updateOutfit(userId, outfitId, updates) {
    const list = this.data.outfits[userId] || [];
    const index = list.findIndex((o) => o.id === outfitId);
    if (index === -1) throw new Error("Outfit not found");
    const updated = {
      ...list[index],
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    list[index] = updated;
    this.data.outfits[userId] = list;
    this.save();
    return updated;
  }
  deleteOutfit(userId, outfitId) {
    const list = this.data.outfits[userId] || [];
    const outfit = list.find((o) => o.id === outfitId);
    this.data.outfits[userId] = list.filter((o) => o.id !== outfitId);
    const user = this.data.users.find((u) => u.id === userId);
    if (outfit) {
      this.logActivity(userId, user?.name || "User", user?.email || "", `Removed look: "${outfit.name}" from Lookbook`, "AI_STYLIST");
    }
    this.save();
    return true;
  }
  deleteOutfits(userId, outfitIds) {
    if (!outfitIds || outfitIds.length === 0) {
      return { deletedIds: [], remainingCount: (this.data.outfits[userId] || []).length };
    }
    const idSet = new Set(outfitIds);
    const current = this.data.outfits[userId] || [];
    const removed = current.filter((o) => idSet.has(o.id));
    const remaining = current.filter((o) => !idSet.has(o.id));
    this.data.outfits[userId] = remaining;
    const user = this.data.users.find((u) => u.id === userId);
    if (removed.length > 0) {
      this.logActivity(
        userId,
        user?.name || "User",
        user?.email || "",
        `Removed ${removed.length} looks from Lookbook in batch`,
        "AI_STYLIST"
      );
    }
    this.save();
    return {
      deletedIds: removed.map((r) => r.id),
      remainingCount: remaining.length
    };
  }
  clearOutfits(userId) {
    const count = (this.data.outfits[userId] || []).length;
    this.data.outfits[userId] = [];
    const user = this.data.users.find((u) => u.id === userId);
    this.logActivity(userId, user?.name || "User", user?.email || "", `Cleared all saved looks (${count} looks removed)`, "AI_STYLIST");
    this.save();
    return true;
  }
  toggleOutfitFavorite(userId, outfitId) {
    const list = this.data.outfits[userId] || [];
    const index = list.findIndex((o) => o.id === outfitId);
    if (index === -1) throw new Error("Outfit not found");
    list[index].isFavorite = !list[index].isFavorite;
    list[index].updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const user = this.data.users.find((u) => u.id === userId);
    this.logActivity(userId, user?.name || "User", user?.email || "", `${list[index].isFavorite ? "Favorited" : "Unfavorited"} look: "${list[index].name}"`, "AI_STYLIST");
    this.save();
    return list[index];
  }
  recordWearOutfit(userId, outfitId) {
    const list = this.data.outfits[userId] || [];
    const index = list.findIndex((o) => o.id === outfitId);
    if (index === -1) throw new Error("Outfit not found");
    list[index].timesWorn = (list[index].timesWorn || 0) + 1;
    list[index].updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const items = this.data.wardrobes[userId] || [];
    const itemIds = (list[index].items || []).map((ref) => ref.itemId || ref.id).filter(Boolean);
    items.forEach((item) => {
      if (itemIds.includes(item.id)) {
        item.timesWorn = (item.timesWorn || 0) + 1;
        item.lastWornDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        item.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      }
    });
    const wearEvents = this.data.wearHistory[userId] || [];
    wearEvents.unshift({
      id: `wear_${Date.now()}`,
      userId,
      outfitId,
      itemIds,
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    this.data.wearHistory[userId] = wearEvents;
    const user = this.data.users.find((u) => u.id === userId);
    this.logActivity(userId, user?.name || "User", user?.email || "", `Wore outfit today: "${list[index].name}" (${itemIds.length} pieces incremented)`, "AI_STYLIST");
    this.save();
    return list[index];
  }
  // --- Plans Operations ---
  getPlans(userId) {
    return this.data.plans[userId] || [];
  }
  addPlan(userId, planData) {
    const list = this.data.plans[userId] || [];
    const newPlan = {
      ...planData,
      id: `plan_${Date.now()}_${import_crypto.default.randomBytes(3).toString("hex")}`,
      isCompleted: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.plans[userId] = [newPlan, ...list];
    const user = this.data.users.find((u) => u.id === userId);
    this.logActivity(userId, user?.name || "User", user?.email || "", `Scheduled outfit for date: ${newPlan.date} ("${newPlan.title}")`, "PLANNER");
    this.save();
    return newPlan;
  }
  updatePlan(userId, planId, updates) {
    const list = this.data.plans[userId] || [];
    const index = list.findIndex((p) => p.id === planId);
    if (index === -1) throw new Error("Plan not found");
    const updated = {
      ...list[index],
      ...updates
    };
    list[index] = updated;
    this.data.plans[userId] = list;
    this.save();
    return updated;
  }
  deletePlan(userId, planId) {
    const list = this.data.plans[userId] || [];
    this.data.plans[userId] = list.filter((p) => p.id !== planId);
    this.save();
    return true;
  }
  // --- AI Telemetry & Logs ---
  incrementAIRequestCount(userId, actionType, summary) {
    this.data.aiRequestsCount[userId] = (this.data.aiRequestsCount[userId] || 0) + 1;
    const user = this.data.users.find((u) => u.id === userId);
    this.logActivity(userId, user?.name || "User", user?.email || "", `AI Stylist request: ${actionType} ("${summary}")`, "AI_STYLIST");
    this.save();
  }
  logActivity(userId, userName, userEmail, action, category, metadata) {
    const log = {
      id: `log_${Date.now()}_${import_crypto.default.randomBytes(3).toString("hex")}`,
      userId,
      userName,
      userEmail,
      action,
      category,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      metadata
    };
    this.data.activityLogs.unshift(log);
    if (this.data.activityLogs.length > 500) {
      this.data.activityLogs = this.data.activityLogs.slice(0, 500);
    }
  }
  // --- Admin / Supervisor Metrics & Access ---
  getAdminOverview() {
    const totalUsers = this.data.users.length;
    const activeUsers = this.data.users.filter((u) => u.status === "Active").length;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1e3;
    const newUsers = this.data.users.filter((u) => new Date(u.joinedDate).getTime() >= thirtyDaysAgo).length;
    let totalWardrobeItems = 0;
    let totalOutfits = 0;
    let totalWearCycles = 0;
    Object.values(this.data.wardrobes).forEach((items) => {
      totalWardrobeItems += items.length;
      items.forEach((item) => {
        totalWearCycles += item.timesWorn || 0;
      });
    });
    Object.values(this.data.outfits).forEach((outfits) => {
      totalOutfits += outfits.length;
    });
    let totalAiRequests = 0;
    Object.values(this.data.aiRequestsCount).forEach((count) => {
      totalAiRequests += count;
    });
    return {
      totalUsers,
      activeUsers,
      newUsers,
      totalWardrobeItems,
      totalOutfits,
      totalAiRequests,
      totalWearCycles,
      totalActivityLogs: this.data.activityLogs.length
    };
  }
  getAdminUsersList() {
    return this.data.users.map((u) => {
      const wardrobeItems = this.data.wardrobes[u.id] || [];
      const outfits = this.data.outfits[u.id] || [];
      const favoritesCount = wardrobeItems.filter((i) => i.isFavorite).length + outfits.filter((o) => o.isFavorite).length;
      let totalWears = 0;
      wardrobeItems.forEach((i) => {
        totalWears += i.timesWorn || 0;
      });
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        joinedDate: u.joinedDate,
        lastActive: u.lastActive,
        wardrobeCount: wardrobeItems.length,
        outfitsCount: outfits.length,
        favoritesCount,
        wearCyclesCount: totalWears,
        aiRequestsCount: this.data.aiRequestsCount[u.id] || 0,
        location: u.location,
        pronouns: u.pronouns,
        bio: u.bio
      };
    });
  }
  getAdminUserDetails(targetUserId) {
    const u = this.data.users.find((user) => user.id === targetUserId);
    if (!u) throw new Error("User not found");
    const wardrobeItems = this.data.wardrobes[u.id] || [];
    const outfits = this.data.outfits[u.id] || [];
    const plans = this.data.plans[u.id] || [];
    const wearHistory = this.data.wearHistory[u.id] || [];
    const userLogs = this.data.activityLogs.filter((log) => log.userId === u.id).slice(0, 20);
    const favoritesCount = wardrobeItems.filter((i) => i.isFavorite).length + outfits.filter((o) => o.isFavorite).length;
    let totalWears = 0;
    wardrobeItems.forEach((i) => {
      totalWears += i.timesWorn || 0;
    });
    return {
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        joinedDate: u.joinedDate,
        lastActive: u.lastActive,
        location: u.location,
        pronouns: u.pronouns,
        bio: u.bio,
        preferences: u.preferences
      },
      stats: {
        wardrobeCount: wardrobeItems.length,
        outfitsCount: outfits.length,
        plansCount: plans.length,
        favoritesCount,
        wearCyclesCount: totalWears,
        aiRequestsCount: this.data.aiRequestsCount[u.id] || 0
      },
      recentWardrobePieces: wardrobeItems.slice(0, 6),
      recentOutfits: outfits.slice(0, 4),
      recentActivity: userLogs
    };
  }
  updateUserStatusOrRole(adminUserId, targetUserId, updates) {
    const target = this.data.users.find((u) => u.id === targetUserId);
    if (!target) throw new Error("User not found");
    if (updates.status) target.status = updates.status;
    if (updates.role) target.role = updates.role;
    const admin = this.data.users.find((u) => u.id === adminUserId);
    this.logActivity(
      adminUserId,
      admin?.name || "Supervisor",
      admin?.email || "",
      `Supervisor modified account status/role for ${target.email}: status=${target.status}, role=${target.role}`,
      "SYSTEM"
    );
    this.save();
    return target;
  }
  getActivityLogs(limit = 100) {
    return this.data.activityLogs.slice(0, limit);
  }
  getSystemHealth() {
    let totalStorageBytes = 0;
    try {
      if (import_fs.default.existsSync(DB_FILE)) {
        const stats = import_fs.default.statSync(DB_FILE);
        totalStorageBytes = stats.size;
      }
    } catch {
    }
    return {
      status: "Operational",
      uptimeSeconds: process.uptime(),
      aiModel: "Gemini 3.6 Flash",
      databaseEngine: "PAURVI JSON Core & Scoped Partitioning",
      totalUsers: this.data.users.length,
      activeSessions: this.data.sessions.length,
      totalActivityLogs: this.data.activityLogs.length,
      databaseSizeBytes: totalStorageBytes,
      serverMemoryUsage: process.memoryUsage(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  getUserStats(userId) {
    const wardrobeItems = this.data.wardrobes[userId] || [];
    const outfits = this.data.outfits[userId] || [];
    const plans = this.data.plans[userId] || [];
    let totalWearCycles = 0;
    wardrobeItems.forEach((i) => {
      totalWearCycles += i.timesWorn || 0;
    });
    const favoritesCount = wardrobeItems.filter((i) => i.isFavorite).length + outfits.filter((o) => o.isFavorite).length;
    return {
      piecesCount: wardrobeItems.length,
      outfitsCount: outfits.length,
      plansCount: plans.length,
      favoritesCount,
      wearCyclesCount: totalWearCycles,
      aiRequestsCount: this.data.aiRequestsCount[userId] || 0
    };
  }
};
var db = new PaurviDatabase();

// server/stylistEngine.ts
var import_genai = require("@google/genai");
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new import_genai.GoogleGenAI({ apiKey });
}
function applyHardFilters(items, request, userProfile) {
  const {
    excludeItemIds = [],
    temperatureCelsius,
    weatherDescription = "",
    occasion = "Dinner",
    dressCode = "Smart Casual"
  } = request;
  const occasionLower = occasion.toLowerCase();
  const dressCodeLower = dressCode.toLowerCase();
  const isFormalEvent = ["formal", "wedding", "interview", "presentation", "black tie"].some(
    (o) => occasionLower.includes(o) || dressCodeLower.includes(o)
  );
  const isRain = /rain|shower|drizzle/i.test(weatherDescription);
  return items.filter((item) => {
    if (excludeItemIds.includes(item.id)) return false;
    if (userProfile?.dislikedColors && userProfile.dislikedColors.length > 0) {
      const itemColor = (item.color || "").toLowerCase().trim();
      const isDisliked = userProfile.dislikedColors.some(
        (dc) => dc.toLowerCase().trim() === itemColor || itemColor.includes(dc.toLowerCase().trim())
      );
      if (isDisliked) return false;
    }
    if (temperatureCelsius !== void 0) {
      const isHeavyOuterwear = item.category === "Outerwear" && /coat|parka|trench|down|puffer|heavy wool|shearling/i.test(item.name + " " + (item.material || ""));
      const isHeavySweater = item.category === "Tops" && /chunky|heavy knit|wool cable|fleece/i.test(item.name + " " + (item.material || ""));
      const isHeavyWinterMaterial = /heavy wool|boiled wool|fleece|down|shearling|thick knit/i.test((item.material || "") + " " + item.name);
      if (temperatureCelsius > 25) {
        if (isHeavyOuterwear || isHeavySweater || isHeavyWinterMaterial) return false;
      }
      if (temperatureCelsius < 13) {
        if (/short|tank top|sleeveless|swim/i.test(item.name + " " + (item.type || ""))) return false;
        if (item.category === "Footwear" && /sandal|flip flop|slide/i.test(item.name + " " + (item.type || ""))) return false;
      }
    }
    if (isFormalEvent) {
      if (/sweatpants|jogger|gym|athletic|distressed|graphic tee|tank top/i.test(item.name + " " + (item.tags || []).join(" "))) {
        return false;
      }
      if (item.category === "Footwear" && /running|sneaker|trainer|slide|sandal|flip flop/i.test(item.name + " " + (item.type || ""))) {
        return false;
      }
    }
    if (isRain && item.category === "Footwear") {
      if (/suede|canvas espadrille|mesh/i.test(item.material || "") && /sandal/i.test(item.name)) {
        return false;
      }
    }
    return true;
  });
}
function generateScoredCandidates(filteredItems, request, userProfile, wearHistory = []) {
  const tops = filteredItems.filter((i) => i.category === "Tops");
  const bottoms = filteredItems.filter((i) => i.category === "Bottoms");
  const dresses = filteredItems.filter((i) => i.category === "Dresses");
  const footwears = filteredItems.filter((i) => i.category === "Footwear");
  const outerwears = filteredItems.filter((i) => i.category === "Outerwear");
  const accessories = filteredItems.filter((i) => i.category === "Accessories");
  const {
    mustIncludeItemIds = [],
    occasion = "Dinner",
    dressCode = "Smart Casual",
    temperatureCelsius,
    stylePreference = "Smart Casual",
    colorPreference
  } = request;
  const targetOccasion = OCCASION_FORMALITY_REQUIREMENTS[occasion] || { min: 2, max: 3, target: 2 };
  const candidates = [];
  function scoreCombination(comboItems, pieces) {
    const formalities = comboItems.map((i) => normalizeFormality(i));
    const minFormality = Math.min(...formalities);
    const maxFormality = Math.max(...formalities);
    const spread = maxFormality - minFormality;
    if (spread >= 3) return null;
    const avgFormality = formalities.reduce((a, b) => a + b, 0) / formalities.length;
    if (avgFormality < targetOccasion.min - 0.7 || avgFormality > targetOccasion.max + 0.7) {
      return null;
    }
    const patterns = comboItems.map((i) => i.pattern || "Solid");
    const patternEval = evaluatePatternCompatibility(patterns);
    if (patternEval.isClash) return null;
    const colors = comboItems.map((i) => i.color || "Neutral");
    const colorEval = evaluateColorCompatibility(colors);
    if (colorEval.isClash) return null;
    const thermalEval = evaluateThermalSuitability(comboItems, temperatureCelsius);
    if (!thermalEval.isCompatible) return null;
    let colorPoints = colorEval.score / 100 * 20;
    if (userProfile?.preferredColors && userProfile.preferredColors.length > 0) {
      const matchesPref = colors.some(
        (c) => userProfile.preferredColors.some((pc) => c.toLowerCase().includes(pc.toLowerCase()))
      );
      if (matchesPref) colorPoints = Math.min(20, colorPoints + 2);
    }
    if (colorPreference && colors.some((c) => c.toLowerCase().includes(colorPreference.toLowerCase()))) {
      colorPoints = Math.min(20, colorPoints + 2);
    }
    let formalityPoints = spread <= 1 ? 15 : 10;
    const formalityDist = Math.abs(avgFormality - targetOccasion.target);
    let occasionPoints = Math.max(5, 15 - formalityDist * 5);
    let weatherPoints = thermalEval.score / 100 * 10;
    let patternPoints = patternEval.score / 100 * 10;
    let fitPoints = 7;
    if (userProfile?.preferredFit) {
      const fitMatches = comboItems.filter((i) => i.fit === userProfile.preferredFit).length;
      if (fitMatches > 0) fitPoints = 10;
    }
    let stylePoints = 6;
    const matchesStyle = comboItems.some(
      (i) => (i.style || "").toLowerCase().includes(stylePreference.toLowerCase()) || (i.occasion || []).some((o) => o.toLowerCase().includes(occasion.toLowerCase()))
    );
    if (matchesStyle) stylePoints = 10;
    let footwearPoints = 4;
    const footwearFormality = normalizeFormality(pieces.footwear);
    if (Math.abs(footwearFormality - avgFormality) <= 1) {
      footwearPoints = 5;
    }
    let noveltyPoints = 5;
    const itemIds = new Set(comboItems.map((i) => i.id));
    const heavyWearCount = comboItems.filter((i) => (i.timesWorn || 0) > 8).length;
    noveltyPoints -= heavyWearCount * 1;
    const recentlyWorn = wearHistory.slice(0, 4).some(
      (entry) => (entry.itemIds || []).some((id) => itemIds.has(id))
    );
    if (recentlyWorn) noveltyPoints -= 1.5;
    noveltyPoints = Math.max(1, noveltyPoints);
    const totalScore = Math.round(
      colorPoints + formalityPoints + occasionPoints + weatherPoints + patternPoints + fitPoints + stylePoints + footwearPoints + noveltyPoints
    );
    const breakdown = {
      colorHarmony: Math.round(colorPoints / 20 * 100),
      occasionFit: Math.round(occasionPoints / 15 * 100),
      weatherMatch: Math.round(weatherPoints / 10 * 100),
      coherence: Math.round(formalityPoints / 15 * 100)
    };
    let matchLabel = "Limited wardrobe match";
    if (!userProfile || !userProfile.isCompleted) {
      matchLabel = "Profile incomplete";
    } else if (totalScore >= 80) {
      matchLabel = "Strong match";
    } else if (totalScore >= 65) {
      matchLabel = "Good match";
    }
    let missingLayerWarning;
    if (temperatureCelsius !== void 0 && temperatureCelsius < 14 && !pieces.outerwear) {
      missingLayerWarning = `Ambient temperature is ${temperatureCelsius}\xB0C. Consider layering a tailored coat or jacket.`;
    }
    return {
      candidateId: `cand_${candidates.length + 1}`,
      pieces,
      totalScore,
      breakdown,
      matchLabel,
      missingLayerWarning
    };
  }
  const topPool = tops.slice(0, 12);
  const bottomPool = bottoms.slice(0, 10);
  const footPool = footwears.slice(0, 8);
  const outerPool = outerwears.slice(0, 6);
  const accPool = accessories.slice(0, 4);
  const needsOuterwear = temperatureCelsius !== void 0 ? temperatureCelsius < 18 : outerPool.length > 0;
  for (const top of topPool) {
    for (const bottom of bottomPool) {
      for (const footwear of footPool) {
        const baseItems = [top, bottom, footwear];
        if (mustIncludeItemIds.length > 0) {
          const comboIds = baseItems.map((i) => i.id);
          const hasAllMust = mustIncludeItemIds.every(
            (id) => comboIds.includes(id) || outerPool.some((o) => o.id === id)
          );
          if (!hasAllMust) continue;
        }
        const outerOptions = needsOuterwear && outerPool.length > 0 ? outerPool : [void 0];
        for (const outerwear of outerOptions) {
          const comboItems = outerwear ? [...baseItems, outerwear] : baseItems;
          const candidate = scoreCombination(comboItems, {
            top,
            bottom,
            footwear,
            outerwear,
            accessory: accPool[0]
          });
          if (candidate) {
            candidates.push(candidate);
          }
        }
      }
    }
  }
  if (dresses.length > 0) {
    for (const dress of dresses.slice(0, 8)) {
      for (const footwear of footPool) {
        const baseItems = [dress, footwear];
        const outerOptions = outerPool.length > 0 ? outerPool : [void 0];
        for (const outerwear of outerOptions) {
          const comboItems = outerwear ? [...baseItems, outerwear] : baseItems;
          const candidate = scoreCombination(comboItems, {
            dress,
            footwear,
            outerwear,
            accessory: accPool[0]
          });
          if (candidate) {
            candidates.push(candidate);
          }
        }
      }
    }
  }
  candidates.sort((a, b) => b.totalScore - a.totalScore);
  return candidates.slice(0, 25);
}
async function rankAndReasonWithGemini(candidates, request, userWardrobe, userProfile, userName = "Client") {
  const topCandidates = candidates.slice(0, 5);
  const primaryFallback = candidates[0];
  const availableAccessories = userWardrobe.filter((i) => i.category === "Accessories" || i.category === "Jewelry");
  const defaultDeterministicResult = {
    selectedCandidateId: primaryFallback.candidateId,
    rankedCandidateIds: topCandidates.map((c) => c.candidateId),
    outfitName: `${primaryFallback.pieces.top?.color || primaryFallback.pieces.dress?.color || "Curated"} ${request.occasion || "Dinner"} Ensemble`,
    whyThisWorks: `The ${primaryFallback.pieces.top?.name || primaryFallback.pieces.dress?.name} pairs with the ${primaryFallback.pieces.bottom?.name || "ensemble"}, grounded by ${primaryFallback.pieces.footwear.name} for balanced proportion following the 60-30-10 color rule.`,
    colorHarmonyReasoning: `Tonal balance between ${primaryFallback.pieces.top?.color || "top"} (dominant 60%) and ${primaryFallback.pieces.bottom?.color || "bottom"} (secondary 30%) with footwear accents (10%) provides visual grounding.`,
    weatherFitReasoning: request.temperatureCelsius !== void 0 ? `Calibrated for ${request.temperatureCelsius}\xB0C conditions with comfortable thermal drape.` : "Breathable fabric drape suitable for all-day comfort.",
    occasionFitReasoning: `Aligns with the formality of ${request.occasion || "Dinner"} under a ${request.dressCode || "Smart Casual"} dress code.`,
    profileMatchReasoning: userProfile?.visualAnalysis ? `Silhouette and neckline harmonize with ${userProfile.visualAnalysis.faceShape} framing and ${userProfile.visualAnalysis.skinTone} undertone.` : "Clean lines provide versatile personal framing.",
    stylingTips: [
      "Tuck or half-tuck the top cleanly to define waistline proportions.",
      "Coordinate leather and hardware finishes across your belt and footwear."
    ],
    optionalAccessoryItemIds: availableAccessories.slice(0, 2).map((a) => a.id),
    warnings: primaryFallback.missingLayerWarning ? [primaryFallback.missingLayerWarning] : [],
    gapAnalysis: primaryFallback.missingLayerWarning || (request.temperatureCelsius !== void 0 && request.temperatureCelsius < 15 ? "Consider layering a fine-knit merino sweater or structured overcoat for thermal comfort." : void 0)
  };
  const ai = getAIClient();
  if (!ai || topCandidates.length === 0) {
    return defaultDeterministicResult;
  }
  const candidatesPayload = topCandidates.map((cand) => {
    const piecesDesc = {};
    if (cand.pieces.top) piecesDesc.top = `"${cand.pieces.top.name}" (Color: ${cand.pieces.top.color}, Type: ${cand.pieces.top.type || cand.pieces.top.category}, Material: ${cand.pieces.top.material || "standard"})`;
    if (cand.pieces.dress) piecesDesc.dress = `"${cand.pieces.dress.name}" (Color: ${cand.pieces.dress.color}, Type: ${cand.pieces.dress.type || "Dress"}, Material: ${cand.pieces.dress.material || "standard"})`;
    if (cand.pieces.bottom) piecesDesc.bottom = `"${cand.pieces.bottom.name}" (Color: ${cand.pieces.bottom.color}, Type: ${cand.pieces.bottom.type || "Trousers"}, Material: ${cand.pieces.bottom.material || "standard"})`;
    if (cand.pieces.outerwear) piecesDesc.outerwear = `"${cand.pieces.outerwear.name}" (Color: ${cand.pieces.outerwear.color}, Type: ${cand.pieces.outerwear.type || "Outerwear"})`;
    piecesDesc.footwear = `"${cand.pieces.footwear.name}" (Color: ${cand.pieces.footwear.color}, Type: ${cand.pieces.footwear.type || "Footwear"})`;
    return {
      candidateId: cand.candidateId,
      calculatedScore: cand.totalScore,
      pieces: piecesDesc,
      breakdown: cand.breakdown
    };
  });
  const availableAccessoriesPayload = availableAccessories.map((a) => ({
    itemId: a.id,
    name: a.name,
    color: a.color,
    type: a.type || "Accessory"
  }));
  const prompt = `You are the Lead Stylist & Textile Analyst Engine for PN Outfit Suggester advising client ${userName}.

Core Directives:
1. Zero Hallucination: Recommend ONLY items present in the user's provided Wardrobe Inventory. NEVER invent garments or accessories.
2. Taxonomy Grounding: Parse and filter items strictly by Category, Subcategory, Formality, Pattern, Fit, Material, and Color.
3. Thermal & Weather Filtering: Exclude garments that violate current weather conditions (e.g., exclude heavy wool or heavy layering when temperatures exceed 25\xB0C/77\xB0F).

Output Rules:
Generate 3 distinct outfit options in structured JSON:
- LOOK 1 ('SAFE & REFINED'): Classic, balanced, low-risk harmony using neutral bases.
- LOOK 2 ('MODERN'): Trending silhouettes, relaxed draping, and contemporary proportion pairing.
- LOOK 3 ('STATEMENT'): High-contrast pairing with an intentional 10% color accent pop.

Styling Mechanics to Enforce:
- Color Strategy: Apply the 60-30-10 distribution rule (60% dominant base garment, 30% neutral/secondary piece, 10% accent or pop).
- Thermal Comfort: Ground evaluations in temperature (${request.temperatureCelsius !== void 0 ? `${request.temperatureCelsius}\xB0C` : "mild"}) and weather conditions (${request.weatherDescription || "fair"}).
- Rationale: Provide a concise "whyItWorks" visual balance justification detailing silhouette balance, texture contrast, and proportions.
- Gap Analysis: List 1-2 missing wardrobe pieces ("gapAnalysis") that would complete or elevate each look.

CANDIDATES TO EVALUATE:
${JSON.stringify(candidatesPayload, null, 2)}

AVAILABLE ACCESSORIES IN USER WARDROBE:
${JSON.stringify(availableAccessoriesPayload, null, 2)}

CLIENT CONTEXT & ENVIRONMENT:
- Occasion: ${request.occasion || "Dinner"}
- Dress Code: ${request.dressCode || "Smart Casual"}
- Location: ${request.location || "Venue"}
- Weather: ${request.weatherDescription || "Not specified"} (${request.temperatureCelsius !== void 0 ? `${request.temperatureCelsius}\xB0C` : "temperature not provided"})
- USER PROFILE: ${userProfile?.gender ? `Gender: ${userProfile.gender}, ` : ""}${userProfile?.visualAnalysis ? `Face Shape: ${userProfile.visualAnalysis.faceShape}, Skin Tone: ${userProfile.visualAnalysis.skinTone}, Contrast Level: ${userProfile.visualAnalysis.contrastLevel}, Preferred Fit: ${userProfile.preferredFit}` : "Not provided"}

TASK:
1. Select the winning primary recommendation by candidateId.
2. Provide precise editorial justifications for the winning look and the 3 stylistic directions.
3. Reference ACTUAL garment titles, specific colors, and materials.
4. Select optional accessory itemIds ONLY from the provided AVAILABLE ACCESSORIES list. NEVER invent items.

Return valid JSON:
{
  "selectedCandidateId": "${topCandidates[0].candidateId}",
  "rankedCandidateIds": ["${topCandidates.map((c) => c.candidateId).join('", "')}"],
  "outfitName": "Concise editorial title referencing pieces",
  "whyThisWorks": "2-3 precise sentences detailing visual balance, 60-30-10 color rule distribution, and texture contrast",
  "colorHarmonyReasoning": "Specific breakdown of how dominant (60%), secondary (30%), and accent (10%) colors interact",
  "weatherFitReasoning": "Thermal comfort assessment relative to current temperature and weather conditions",
  "occasionFitReasoning": "Why formality and silhouette suit the requested event and dress code",
  "profileMatchReasoning": "How the look complements personal undertone, contrast level, and proportions",
  "stylingTips": ["Practical styling tip 1", "Practical styling tip 2"],
  "gapAnalysis": "Identifies an essential piece or layer that would complete or elevate this look, or null if fully cohesive",
  "lookEditorial": {
    "safeAndRefined": {
      "title": "Editorial title for classic balanced look",
      "whyItWorks": "Visual balance and 60-30-10 distribution for Safe & Refined",
      "gapAnalysis": "Missing foundational or layering staple, if any"
    },
    "modern": {
      "title": "Editorial title for modern trend look",
      "whyItWorks": "Elevated proportions, texture mix, and 60-30-10 distribution for Modern",
      "gapAnalysis": "Missing contemporary accent piece, if any"
    },
    "statement": {
      "title": "Editorial title for bold statement look",
      "whyItWorks": "High fashion color contrast and 60-30-10 distribution for Statement",
      "gapAnalysis": "Missing directional accessory or piece, if any"
    }
  },
  "optionalAccessoryItemIds": ["valid_accessory_item_id_if_applicable"],
  "warnings": []
}`;
  try {
    const response = await ai.models.generateContent({
      model: getGeminiModel(),
      contents: [prompt],
      config: {
        responseMimeType: "application/json"
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    const validCandidateIds = new Set(topCandidates.map((c) => c.candidateId));
    const selectedId = validCandidateIds.has(parsed.selectedCandidateId) ? parsed.selectedCandidateId : topCandidates[0].candidateId;
    const validAccessoryIds = new Set(availableAccessories.map((a) => a.id));
    const validatedAccessories = (Array.isArray(parsed.optionalAccessoryItemIds) ? parsed.optionalAccessoryItemIds : []).filter((id) => validAccessoryIds.has(id));
    return {
      selectedCandidateId: selectedId,
      rankedCandidateIds: Array.isArray(parsed.rankedCandidateIds) ? parsed.rankedCandidateIds : topCandidates.map((c) => c.candidateId),
      outfitName: parsed.outfitName || defaultDeterministicResult.outfitName,
      whyThisWorks: parsed.whyThisWorks || defaultDeterministicResult.whyThisWorks,
      colorHarmonyReasoning: parsed.colorHarmonyReasoning || defaultDeterministicResult.colorHarmonyReasoning,
      weatherFitReasoning: parsed.weatherFitReasoning || defaultDeterministicResult.weatherFitReasoning,
      occasionFitReasoning: parsed.occasionFitReasoning || defaultDeterministicResult.occasionFitReasoning,
      profileMatchReasoning: parsed.profileMatchReasoning || defaultDeterministicResult.profileMatchReasoning,
      stylingTips: Array.isArray(parsed.stylingTips) && parsed.stylingTips.length > 0 ? parsed.stylingTips : defaultDeterministicResult.stylingTips,
      optionalAccessoryItemIds: validatedAccessories,
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      gapAnalysis: typeof parsed.gapAnalysis === "string" && parsed.gapAnalysis.trim().length > 0 ? parsed.gapAnalysis : defaultDeterministicResult.gapAnalysis,
      lookEditorial: parsed.lookEditorial && typeof parsed.lookEditorial === "object" ? parsed.lookEditorial : void 0
    };
  } catch (err) {
    console.warn("Gemini reasoning fallback to deterministic stylist logic:", err);
    return defaultDeterministicResult;
  }
}
function validateGeneratedOutfit(candidate, userWardrobe, userId, request) {
  const errors = [];
  const validUserItemsMap = new Map(userWardrobe.map((i) => [i.id, i]));
  const seenItemIds = /* @__PURE__ */ new Set();
  const verifiedPieces = [];
  const checkPiece = (item, expectedCategory, role) => {
    if (!item) return;
    if (!validUserItemsMap.has(item.id)) {
      errors.push(`Item ${item.id} does not exist in user wardrobe.`);
      return;
    }
    if (seenItemIds.has(item.id)) {
      errors.push(`Duplicate item ${item.id} found in outfit.`);
      return;
    }
    seenItemIds.add(item.id);
    const actualItem = validUserItemsMap.get(item.id);
    verifiedPieces.push({
      category: expectedCategory,
      itemId: actualItem.id,
      item: actualItem,
      role,
      suggestedDescription: actualItem.name,
      isOwned: true
    });
  };
  if (candidate.pieces.dress) {
    checkPiece(candidate.pieces.dress, "Dresses", "Single-piece foundational silhouette.");
  } else {
    checkPiece(candidate.pieces.top, "Tops", "Upper foundational piece establishing neckline and color.");
    checkPiece(candidate.pieces.bottom, "Bottoms", "Grounding bottom silhouette establishing proportion.");
  }
  if (candidate.pieces.outerwear) {
    checkPiece(candidate.pieces.outerwear, "Outerwear", "Framing architectural layer for weather and formality.");
  }
  checkPiece(candidate.pieces.footwear, "Footwear", "Grounding footwear setting the final formality tone.");
  if (candidate.pieces.accessory) {
    checkPiece(candidate.pieces.accessory, "Accessories", "Complementary accent.");
  }
  const hasFoundational = verifiedPieces.some((p) => p.category === "Tops" || p.category === "Dresses");
  const hasBottomIfTop = !verifiedPieces.some((p) => p.category === "Dresses") ? verifiedPieces.some((p) => p.category === "Bottoms") : true;
  const hasFootwear = verifiedPieces.some((p) => p.category === "Footwear");
  if (!hasFoundational) errors.push("Missing foundational top or dress.");
  if (!hasBottomIfTop) errors.push("Top present without matching bottom.");
  if (!hasFootwear) errors.push("Missing footwear.");
  return {
    isValid: errors.length === 0,
    pieces: verifiedPieces,
    errors
  };
}
async function generateStylistRecommendations(userId, request, userWardrobe, userProfile, userWearHistory = [], userName = "Client") {
  if (!userWardrobe || userWardrobe.length === 0) {
    return {
      id: `rec_${Date.now()}`,
      requestId: `req_${Math.random().toString(36).substring(2, 9)}`,
      outfitName: "Empty Wardrobe",
      summary: "Your digital wardrobe currently contains 0 catalogued pieces.",
      pieces: [],
      whyItWorks: "",
      weatherReasoning: "",
      occasionReasoning: "",
      stylingTips: ["Upload photos of tops, trousers, and footwear to unlock personalized outfit recommendations."],
      suggestedAccessories: [],
      confidenceScore: 0,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      canGenerate: false,
      missingCategories: ["Tops", "Bottoms", "Footwear"],
      advice: "Your wardrobe is currently empty. Add foundational items like tops, trousers, and footwear to start generating complete outfits."
    };
  }
  const filtered = applyHardFilters(userWardrobe, request, userProfile);
  const hasTops = filtered.some((i) => i.category === "Tops");
  const hasBottoms = filtered.some((i) => i.category === "Bottoms");
  const hasDresses = filtered.some((i) => i.category === "Dresses");
  const hasFootwear = filtered.some((i) => i.category === "Footwear");
  const missingCategories = [];
  if (!hasTops && !hasDresses) missingCategories.push("Tops or Dresses");
  if (!hasBottoms && !hasDresses) missingCategories.push("Bottoms");
  if (!hasFootwear) missingCategories.push("Footwear");
  if (missingCategories.length > 0) {
    return {
      id: `rec_${Date.now()}`,
      requestId: `req_${Math.random().toString(36).substring(2, 9)}`,
      outfitName: "Insufficient Wardrobe Pieces",
      summary: "Your wardrobe doesn't contain enough compatible pieces for this request.",
      pieces: [],
      whyItWorks: "",
      weatherReasoning: "",
      occasionReasoning: "",
      stylingTips: [`Catalogue items in missing categories: ${missingCategories.join(", ")}`],
      suggestedAccessories: [],
      confidenceScore: 0,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      canGenerate: false,
      missingCategories,
      advice: `Your wardrobe doesn't contain enough compatible pieces for this request. Add ${missingCategories.join(" and ")} to complete combinations for this occasion.`
    };
  }
  const candidates = generateScoredCandidates(filtered, request, userProfile, userWearHistory);
  if (candidates.length === 0) {
    return {
      id: `rec_${Date.now()}`,
      requestId: `req_${Math.random().toString(36).substring(2, 9)}`,
      outfitName: "No Compatible Combination",
      summary: "Your wardrobe doesn't contain enough compatible pieces matching the active filters and exclusions.",
      pieces: [],
      whyItWorks: "",
      weatherReasoning: "",
      occasionReasoning: "",
      stylingTips: ["Try loosening exclusions or adding complementary wardrobe staples."],
      suggestedAccessories: [],
      confidenceScore: 0,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      canGenerate: false,
      missingCategories: ["Compatible pieces"],
      advice: "Your wardrobe pieces couldn't be assembled into a balanced outfit with current constraints. Try adjusting filters or adding more versatile pieces."
    };
  }
  const reasoning = await rankAndReasonWithGemini(candidates, request, userWardrobe, userProfile, userName);
  const winningCandidate = candidates.find((c) => c.candidateId === reasoning.selectedCandidateId) || candidates[0];
  const validation = validateGeneratedOutfit(winningCandidate, userWardrobe, userId, request);
  const finalPieces = validation.isValid ? validation.pieces : [];
  const effectivePieces = finalPieces.length > 0 ? finalPieces : validateGeneratedOutfit(candidates[0], userWardrobe, userId, request).pieces;
  const looks = [];
  const candSafe = candidates.find((c) => c.breakdown.coherence >= 80 && c.breakdown.colorHarmony >= 75) || candidates[0];
  const candModern = candidates.find(
    (c) => c.candidateId !== candSafe.candidateId && (c.pieces.top?.fit === "Relaxed" || c.pieces.bottom?.fit === "Relaxed" || c.pieces.top?.pattern === "Textured" || Boolean(c.pieces.outerwear))
  ) || candidates.find((c) => c.candidateId !== candSafe.candidateId) || candidates[1] || candidates[0];
  const candStatement = candidates.find(
    (c) => c.candidateId !== candSafe.candidateId && c.candidateId !== candModern.candidateId && (c.pieces.top?.pattern !== "Solid" || c.pieces.outerwear?.pattern !== "Solid" || c.pieces.footwear.color !== c.pieces.bottom?.color)
  ) || candidates.find((c) => c.candidateId !== candSafe.candidateId && c.candidateId !== candModern.candidateId) || candidates[2] || candidates[0];
  const lookConfigs = [
    {
      cand: candSafe,
      type: "SAFE & REFINED",
      subtitle: "Classic, balanced, low risk",
      editorialKey: "safeAndRefined",
      defaultTitle: `${candSafe.pieces.top?.name || candSafe.pieces.dress?.name || "Classic"} & ${candSafe.pieces.bottom?.name || "Tailored Trousers"}`,
      defaultWhyItWorks: `Applies the 60-30-10 color rule with ${candSafe.pieces.bottom?.color || "neutral"} as the 60% grounding base, ${candSafe.pieces.top?.color || "tonal"} as the 30% secondary, and ${candSafe.pieces.footwear.color} (10%) as a restrained accent. Clean proportions ensure timeless balance.`
    },
    {
      cand: candModern,
      type: "MODERN",
      subtitle: "Current trends, elevated proportions",
      editorialKey: "modern",
      defaultTitle: `Contemporary ${candModern.pieces.outerwear?.name || candModern.pieces.top?.name || "Layered"} Ensemble`,
      defaultWhyItWorks: `Balances contemporary relaxed and structured silhouettes with a modern 60-30-10 palette. Textural contrast between fabrics elevates the look while maintaining thermal ease.`
    },
    {
      cand: candStatement,
      type: "STATEMENT",
      subtitle: "Bold color pop, high fashion contrast",
      editorialKey: "statement",
      defaultTitle: `Directional ${candStatement.pieces.top?.color || candStatement.pieces.footwear.color} Contrast Look`,
      defaultWhyItWorks: `Features a high-fashion focal point utilizing an intentional 10% color pop against a 60-30 neutral foundation, creating sharp visual engagement without overwhelming harmony.`
    }
  ];
  for (let i = 0; i < lookConfigs.length; i++) {
    const config = lookConfigs[i];
    const cand = config.cand;
    const candValidation = validateGeneratedOutfit(cand, userWardrobe, userId, request);
    if (!candValidation.isValid) continue;
    const editorial = reasoning.lookEditorial?.[config.editorialKey];
    const isWinner = cand.candidateId === winningCandidate.candidateId;
    looks.push({
      id: `look_${i + 1}`,
      lookType: config.type,
      title: isWinner ? reasoning.outfitName : editorial?.title || config.defaultTitle,
      subtitle: config.subtitle,
      pieces: candValidation.pieces,
      whyItWorks: isWinner ? reasoning.whyThisWorks : editorial?.whyItWorks || config.defaultWhyItWorks,
      bestFor: {
        occasion: request.occasion || "Dinner",
        time: request.time || "Evening",
        weather: request.weatherDescription || (request.temperatureCelsius !== void 0 ? `${request.temperatureCelsius}\xB0C` : "Mild")
      },
      styleNotes: isWinner ? reasoning.stylingTips : editorial?.stylingTips || [
        "Ensure clean breaks on trouser cuffs for optimal shoe framing.",
        "Maintain balanced proportions across the upper and lower torso."
      ],
      gapAnalysis: editorial?.gapAnalysis || cand.missingLayerWarning || (request.temperatureCelsius !== void 0 && request.temperatureCelsius < 15 && !cand.pieces.outerwear ? `Ambient temperature is ${request.temperatureCelsius}\xB0C. A structured wool overcoat or tailored blazer would complete this look.` : void 0),
      score: cand.totalScore,
      scoreBreakdown: cand.breakdown
    });
  }
  const validatedSuggestedAccessories = reasoning.optionalAccessoryItemIds.map((id) => userWardrobe.find((w) => w.id === id)?.name).filter((name) => Boolean(name));
  return {
    id: `rec_${Date.now()}`,
    requestId: `req_${Math.random().toString(36).substring(2, 9)}`,
    outfitName: reasoning.outfitName,
    summary: `${winningCandidate.matchLabel} (${winningCandidate.totalScore}/100) \u2014 Composed strictly from your verified wardrobe pieces.`,
    pieces: effectivePieces,
    whyItWorks: reasoning.whyThisWorks,
    weatherReasoning: reasoning.weatherFitReasoning,
    occasionReasoning: reasoning.occasionFitReasoning,
    bestFor: {
      occasion: request.occasion || "Dinner",
      time: request.time || "Evening",
      weather: request.weatherDescription || (request.temperatureCelsius !== void 0 ? `${request.temperatureCelsius}\xB0C` : "Mild")
    },
    stylingTips: reasoning.stylingTips,
    suggestedAccessories: validatedSuggestedAccessories,
    alternativeLookSuggestion: candidates.length > 1 ? `Alternative option available with ${candidates[1].pieces.top?.name || candidates[1].pieces.bottom?.name || "alternative piece"}.` : void 0,
    gapAnalysis: reasoning.gapAnalysis || winningCandidate.missingLayerWarning,
    confidenceScore: winningCandidate.totalScore,
    // Calculated deterministic score
    scoreBreakdown: winningCandidate.breakdown,
    looks,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    canGenerate: true
  };
}
async function swapOutfitPiece(userId, payload, userWardrobe, userProfile) {
  const {
    currentPieceIds = [],
    swapCategory,
    currentPieceIdToReplace,
    occasion = "Dinner",
    temperatureCelsius
  } = payload;
  const fixedItems = userWardrobe.filter(
    (i) => currentPieceIds.includes(i.id) && i.id !== currentPieceIdToReplace
  );
  const alternatives = userWardrobe.filter(
    (i) => i.category === swapCategory && i.id !== currentPieceIdToReplace
  );
  if (alternatives.length === 0) {
    return {
      success: false,
      replacements: [],
      message: `No other ${swapCategory.toLowerCase()} found in your digital wardrobe to swap with.`
    };
  }
  const scored = [];
  for (const alt of alternatives) {
    const fullLook = [...fixedItems, alt];
    const patternEval = evaluatePatternCompatibility(fullLook.map((i) => i.pattern || "Solid"));
    if (patternEval.isClash) continue;
    const colorEval = evaluateColorCompatibility(fullLook.map((i) => i.color || "Neutral"));
    if (colorEval.isClash) continue;
    const thermalEval = evaluateThermalSuitability(fullLook, temperatureCelsius);
    if (!thermalEval.isCompatible) continue;
    const formalities = fullLook.map((i) => normalizeFormality(i));
    const spread = Math.max(...formalities) - Math.min(...formalities);
    if (spread >= 3) continue;
    let score = Math.round(colorEval.score * 0.4 + thermalEval.score * 0.3 + patternEval.score * 0.3);
    if (userProfile?.preferredColors?.some((pc) => (alt.color || "").toLowerCase().includes(pc.toLowerCase()))) {
      score += 4;
    }
    if (userProfile?.dislikedColors?.some((dc) => (alt.color || "").toLowerCase().includes(dc.toLowerCase()))) {
      score -= 25;
    }
    score = Math.min(98, Math.max(35, score));
    scored.push({
      item: alt,
      score,
      reason: `The ${alt.color} ${alt.name} complements the ${fixedItems.map((f) => f.name).join(" and ")} with ${colorEval.reason.toLowerCase()}.`
    });
  }
  scored.sort((a, b) => b.score - a.score);
  return {
    success: true,
    replacements: scored.slice(0, 4)
  };
}

// server.ts
import_dotenv.default.config();
var aiClient = null;
function getAIClient2() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured");
  }
  if (!aiClient) {
    aiClient = new import_genai2.GoogleGenAI({ apiKey });
  }
  return aiClient;
}
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const user = db.getUserByToken(token);
      if (user) {
        req.user = user;
        return next();
      }
    }
  }
  return res.status(401).json({ error: "Authentication required. Please sign in." });
}
function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const user = db.getUserByToken(token);
      if (user) {
        req.user = user;
      }
    }
  }
  next();
}
function supervisorMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required." });
  }
  if (req.user.role !== "supervisor" && req.user.role !== "admin") {
    return res.status(403).json({
      error: "Access Forbidden: Administrator or Supervisor credentials required."
    });
  }
  next();
}
var app = (0, import_express.default)();
function setupApiRoutes() {
  app.use(import_express.default.json({ limit: "20mb" }));
  app.get("/api/health", (req, res) => {
    res.json({
      status: "operational",
      brand: "PAURVI",
      engine: `Gemini (${getGeminiModel()})`,
      hasApiKey: !!process.env.GEMINI_API_KEY
    });
  });
  app.post("/api/auth/signup", (req, res) => {
    try {
      const { name, email, password, confirmPassword } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Full name is required." });
      }
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "A valid email address is required." });
      }
      if (!password || password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long." });
      }
      if (confirmPassword && password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match." });
      }
      const user = db.createUser(name, email, password, "user");
      const { token } = db.authenticate(email, password);
      const { passwordHash, salt, ...safeUser } = user;
      return res.status(201).json({
        success: true,
        user: safeUser,
        token
      });
    } catch (err) {
      return res.status(400).json({ error: err.message || "Registration failed." });
    }
  });
  app.post("/api/auth/signin", (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
      }
      const { user, token } = db.authenticate(email, password);
      const { passwordHash, salt, ...safeUser } = user;
      return res.json({
        success: true,
        user: safeUser,
        token
      });
    } catch (err) {
      return res.status(401).json({ error: err.message || "Authentication failed." });
    }
  });
  app.get("/api/auth/me", authMiddleware, (req, res) => {
    const { passwordHash, salt, ...safeUser } = req.user;
    return res.json({
      success: true,
      user: safeUser
    });
  });
  app.post("/api/auth/signout", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      db.invalidateSession(token);
    }
    return res.json({ success: true, message: "Signed out safely." });
  });
  app.post("/api/auth/forgot-password", (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email address is required." });
      }
      const { resetToken } = db.requestPasswordReset(email);
      return res.json({
        success: true,
        message: "Password reset code generated and sent to your email.",
        resetCode: resetToken
        // Provided in development response for easy recovery testing
      });
    } catch (err) {
      return res.status(400).json({ error: err.message || "Password reset request failed." });
    }
  });
  app.post("/api/auth/reset-password", (req, res) => {
    try {
      const { email, resetCode, newPassword } = req.body;
      if (!email || !resetCode || !newPassword) {
        return res.status(400).json({ error: "Email, reset code, and new password are required." });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters long." });
      }
      db.resetPassword(email, resetCode, newPassword);
      return res.json({
        success: true,
        message: "Password has been successfully updated. You may now sign in."
      });
    } catch (err) {
      return res.status(400).json({ error: err.message || "Password reset failed." });
    }
  });
  app.put("/api/auth/profile", authMiddleware, (req, res) => {
    try {
      const updated = db.updateUserProfile(req.user.id, req.body);
      const { passwordHash, salt, ...safeUser } = updated;
      return res.json({ success: true, user: safeUser });
    } catch (err) {
      return res.status(400).json({ error: err.message || "Failed to update profile." });
    }
  });
  app.get("/api/auth/profile", authMiddleware, (req, res) => {
    try {
      const user = db.getUserById(req.user.id);
      if (!user) return res.status(404).json({ error: "User not found." });
      const { passwordHash, salt, ...safeUser } = user;
      return res.json({ success: true, user: safeUser });
    } catch (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  app.get("/api/user/wardrobe", authMiddleware, (req, res) => {
    const items = db.getWardrobe(req.user.id);
    return res.json({ success: true, items });
  });
  app.post("/api/user/wardrobe", authMiddleware, (req, res) => {
    try {
      const newItem = db.addWardrobeItem(req.user.id, req.body);
      return res.status(201).json({ success: true, item: newItem });
    } catch (err) {
      return res.status(400).json({ error: err.message || "Failed to add item." });
    }
  });
  app.put("/api/user/wardrobe/:id", authMiddleware, (req, res) => {
    try {
      const updated = db.updateWardrobeItem(req.user.id, req.params.id, req.body);
      return res.json({ success: true, item: updated });
    } catch (err) {
      return res.status(400).json({ error: err.message || "Failed to update item." });
    }
  });
  app.delete("/api/user/wardrobe/:id", authMiddleware, (req, res) => {
    try {
      db.deleteWardrobeItem(req.user.id, req.params.id);
      return res.json({ success: true });
    } catch (err) {
      return res.status(400).json({ error: err.message || "Failed to delete item." });
    }
  });
  app.post("/api/user/wardrobe/batch-delete", authMiddleware, (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: "ids must be an array of string item IDs." });
      }
      const result = db.deleteWardrobeItems(req.user.id, ids);
      return res.json({ success: true, ...result });
    } catch (err) {
      return res.status(400).json({ error: err.message || "Failed to delete items in batch." });
    }
  });
  app.post("/api/user/wardrobe/clear", authMiddleware, (req, res) => {
    try {
      db.clearWardrobe(req.user.id);
      return res.json({ success: true });
    } catch (err) {
      return res.status(400).json({ error: err.message || "Failed to clear wardrobe." });
    }
  });
  app.post("/api/user/wardrobe/:id/favorite", authMiddleware, (req, res) => {
    try {
      const updated = db.toggleWardrobeFavorite(req.user.id, req.params.id);
      return res.json({ success: true, item: updated });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });
  app.post("/api/user/wardrobe/:id/wear", authMiddleware, (req, res) => {
    try {
      const updated = db.recordWearItem(req.user.id, req.params.id);
      return res.json({ success: true, item: updated });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/user/outfits", authMiddleware, (req, res) => {
    const outfits = db.getOutfits(req.user.id);
    return res.json({ success: true, outfits });
  });
  app.post("/api/user/outfits", authMiddleware, (req, res) => {
    try {
      const newOutfit = db.addOutfit(req.user.id, req.body);
      return res.status(201).json({ success: true, outfit: newOutfit });
    } catch (err) {
      return res.status(400).json({ error: err.message || "Failed to save look." });
    }
  });
  app.put("/api/user/outfits/:id", authMiddleware, (req, res) => {
    try {
      const updated = db.updateOutfit(req.user.id, req.params.id, req.body);
      return res.json({ success: true, outfit: updated });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });
  app.delete("/api/user/outfits/:id", authMiddleware, (req, res) => {
    try {
      db.deleteOutfit(req.user.id, req.params.id);
      return res.json({ success: true });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });
  app.post("/api/user/outfits/batch-delete", authMiddleware, (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: "ids must be an array of string outfit IDs." });
      }
      const result = db.deleteOutfits(req.user.id, ids);
      return res.json({ success: true, ...result });
    } catch (err) {
      return res.status(400).json({ error: err.message || "Failed to delete outfits in batch." });
    }
  });
  app.post("/api/user/outfits/clear", authMiddleware, (req, res) => {
    try {
      db.clearOutfits(req.user.id);
      return res.json({ success: true });
    } catch (err) {
      return res.status(400).json({ error: err.message || "Failed to clear outfits." });
    }
  });
  app.post("/api/user/outfits/:id/favorite", authMiddleware, (req, res) => {
    try {
      const updated = db.toggleOutfitFavorite(req.user.id, req.params.id);
      return res.json({ success: true, outfit: updated });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });
  app.post("/api/user/outfits/:id/wear", authMiddleware, (req, res) => {
    try {
      const updated = db.recordWearOutfit(req.user.id, req.params.id);
      return res.json({ success: true, outfit: updated });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/user/plans", authMiddleware, (req, res) => {
    const plans = db.getPlans(req.user.id);
    return res.json({ success: true, plans });
  });
  app.post("/api/user/plans", authMiddleware, (req, res) => {
    try {
      const newPlan = db.addPlan(req.user.id, req.body);
      return res.status(201).json({ success: true, plan: newPlan });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });
  app.put("/api/user/plans/:id", authMiddleware, (req, res) => {
    try {
      const updated = db.updatePlan(req.user.id, req.params.id, req.body);
      return res.json({ success: true, plan: updated });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });
  app.delete("/api/user/plans/:id", authMiddleware, (req, res) => {
    try {
      db.deletePlan(req.user.id, req.params.id);
      return res.json({ success: true });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/user/stats", authMiddleware, (req, res) => {
    const stats = db.getUserStats(req.user.id);
    return res.json({ success: true, stats });
  });
  app.get("/api/admin/overview", authMiddleware, supervisorMiddleware, (req, res) => {
    try {
      const overview = db.getAdminOverview();
      return res.json({ success: true, overview });
    } catch (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  app.get("/api/admin/users", authMiddleware, supervisorMiddleware, (req, res) => {
    try {
      const users = db.getAdminUsersList();
      return res.json({ success: true, users });
    } catch (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  app.get("/api/admin/users/:userId", authMiddleware, supervisorMiddleware, (req, res) => {
    try {
      const details = db.getAdminUserDetails(req.params.userId);
      return res.json({ success: true, details });
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("not found")) {
        return res.status(404).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message || "Internal Server Error" });
    }
  });
  app.put("/api/admin/users/:userId/status", authMiddleware, supervisorMiddleware, (req, res) => {
    try {
      const updated = db.updateUserStatusOrRole(req.user.id, req.params.userId, req.body);
      return res.json({ success: true, user: updated });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/admin/activity", authMiddleware, supervisorMiddleware, (req, res) => {
    try {
      const logs = db.getActivityLogs(150);
      return res.json({ success: true, logs });
    } catch (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  app.get("/api/admin/system", authMiddleware, supervisorMiddleware, (req, res) => {
    try {
      const health = db.getSystemHealth();
      return res.json({ success: true, health });
    } catch (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  app.post("/api/gemini/analyze-style-photo", authMiddleware, async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg" } = req.body;
      if (!imageBase64 || typeof imageBase64 !== "string") {
        return res.status(400).json({ error: "Please provide a face or outfit photo to analyze." });
      }
      const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!allowedMimes.includes(mimeType.toLowerCase())) {
        return res.status(400).json({ error: "Supported image formats are JPEG, PNG, and WebP." });
      }
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "").trim();
      if (!cleanBase64 || cleanBase64.length < 50) {
        return res.status(400).json({ error: "Image data is invalid or corrupt." });
      }
      if (cleanBase64.length > 20 * 1024 * 1024) {
        return res.status(400).json({ error: "Image is too large. Please upload an image under 10MB." });
      }
      const ai = getAIClient2();
      const prompt = `You are an expert personal stylist and facial proportions & color harmony specialist.
Analyze this user's photo carefully to understand their natural features for personalized wardrobe styling, flattering color palettes, and collar/neckline recommendations.

CRITICAL DIRECTIVES:
- If no clear human face is detected in the photo, throw an error or respond that no face could be identified.
- NEVER judge, rate, or critique the person's beauty, weight, skin texture, or age.
- Focus purely on:
  1. Face geometry (for flattering collars/necklines): exactly one of ['Oval', 'Square', 'Round', 'Heart', 'Oblong', 'Diamond']
  2. Complexion undertone: exactly one of ['Warm', 'Cool', 'Neutral', 'Olive', 'Deep Warm', 'Fair Cool']
  3. Visual contrast level: exactly one of ['High', 'Medium', 'Low', 'Soft']
  4. Hair characteristics: 2-5 words
  5. Recommended color palettes: 4 to 6 specific garment color names that flatter their complexion
  6. Recommended necklines: 2 to 3 tailored collar/neckline cuts
  7. Analysis notes: 2-3 objective, constructive sentences on color harmony.

Extract the following JSON attributes:
- faceShape: Exactly one of ['Oval', 'Square', 'Round', 'Heart', 'Oblong', 'Diamond']
- skinTone: Exactly one of ['Warm', 'Cool', 'Neutral', 'Olive', 'Deep Warm', 'Fair Cool']
- contrastLevel: Exactly one of ['High', 'Medium', 'Low', 'Soft']
- hairCharacteristics: Brief 2-5 word descriptor
- recommendedPalettes: Array of 4 to 6 specific garment color names
- recommendedNecklines: Array of 2 to 3 tailored collars, necklines, or lapel cuts
- analysisNotes: 2-3 articulate sentences
`;
      const response = await ai.models.generateContent({
        model: getGeminiModel(),
        contents: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType
            }
          },
          prompt
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai2.Type.OBJECT,
            properties: {
              faceShape: { type: import_genai2.Type.STRING },
              skinTone: { type: import_genai2.Type.STRING },
              contrastLevel: { type: import_genai2.Type.STRING },
              hairCharacteristics: { type: import_genai2.Type.STRING },
              recommendedPalettes: {
                type: import_genai2.Type.ARRAY,
                items: { type: import_genai2.Type.STRING }
              },
              recommendedNecklines: {
                type: import_genai2.Type.ARRAY,
                items: { type: import_genai2.Type.STRING }
              },
              analysisNotes: { type: import_genai2.Type.STRING }
            },
            required: ["faceShape", "skinTone", "contrastLevel", "recommendedPalettes", "recommendedNecklines", "analysisNotes"]
          }
        }
      });
      const parsed = JSON.parse(response.text || "{}");
      if (!parsed.faceShape || !parsed.skinTone) {
        throw new Error("Could not detect facial features");
      }
      db.incrementAIRequestCount(req.user.id, "Personal Style Visual Analysis", `${parsed.faceShape} \xB7 ${parsed.skinTone}`);
      return res.json({ success: true, analysis: parsed });
    } catch (error) {
      console.warn("Style photo visual analysis notice:", error?.message || error);
      return res.status(422).json({
        success: false,
        error: "We couldn't analyze that photo. Try a clearer front-facing photo with good lighting."
      });
    }
  });
  app.post("/api/gemini/analyze-garment", optionalAuthMiddleware, async (req, res) => {
    try {
      const { imageUrl, mimeType, hint } = req.body;
      const imageBase64 = req.body.imageBase64 || req.body.image;
      if (!imageUrl && !imageBase64 && !hint) {
        return res.status(400).json({ error: "Please provide an image or garment description to analyze." });
      }
      const ai = getAIClient2();
      const prompt = `You are an expert high-fashion archivist and textile analyst. Your task is to analyze the uploaded clothing image and extract precise, structured metadata.

Constraint Rules:
1. Output MUST be valid JSON matching the schema below.
2. Be highly specific with materials (e.g., distinguish linen from cotton, heavy wool from cashmere).
3. Identify subtle undertones and secondary accent colors.

JSON Attributes to extract:
- isClothingItem: boolean (true if the image contains clothing, footwear, bags, jewelry, or accessories)
- hasMultipleItems: boolean (true if multiple distinct clothing items are visible in one frame)
- name: Concise, descriptive title (e.g., 'Charcoal Double-Breasted Wool Blazer')
- category: One of ['Tops', 'Bottoms', 'Outerwear', 'Dresses', 'Footwear', 'Accessories', 'Bags', 'Jewelry', 'Activewear', 'Formalwear']
- subcategory: Detailed subcategory descriptor (e.g., 'Chinos', 'Oxford Shirt', 'Chelsea Boots', 'Cardigan', 'Blazer')
- type: Specific clothing type matching subcategory or standard garment category
- color: Primary color, one of ['Black', 'Charcoal', 'White', 'Ivory', 'Beige', 'Camel', 'Navy', 'Blue', 'Olive', 'Burgundy', 'Chocolate', 'Brown', 'Grey', 'Silver', 'Gold', 'Emerald', 'Sage', 'Terracotta', 'Pastel Pink', 'Khaki']
- secondaryColor: Optional secondary accent color or undertone, or null
- pattern: One of ['Solid', 'Striped', 'Plaid', 'Floral', 'Houndstooth', 'Textured', 'Graphic', 'Checked']
- material: Specific fabric or material, one of ['Cotton', 'Denim', 'Linen', 'Wool', 'Silk', 'Leather', 'Cashmere', 'Knit']
- fit: Fit descriptor, one of ['Slim', 'Regular', 'Relaxed', 'Oversized', 'Tailored']
- formality: Formality tier, one of ['Casual', 'Smart Casual', 'Business Casual', 'Formal', 'Black Tie']
- style: Aesthetic style descriptor (e.g., 'Tailored Minimal', 'Smart Casual', 'Classic', 'Old Money')
- season: Array of applicable seasons from ['Spring', 'Summer', 'Autumn', 'Winter']
- occasion: Array of applicable occasions (e.g., ['Work', 'Dinner', 'Casual'])
- tags: Array of 3 to 5 style tags like ['minimalist', 'layering-piece', 'tailored']
- careInstructions: Professional garment care guideline
- stylingNote: Brief one-sentence note on how to pair this piece
- confidenceScore: Actual certainty of identification (0-100)

${hint ? `User context/hint: "${hint}"` : ""}
`;
      const contents = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        contents.push({
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || "image/jpeg"
          }
        });
      }
      contents.push(prompt);
      const response = await ai.models.generateContent({
        model: getGeminiModel(),
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai2.Type.OBJECT,
            properties: {
              hasMultipleItems: { type: import_genai2.Type.BOOLEAN },
              isClothingItem: { type: import_genai2.Type.BOOLEAN },
              name: { type: import_genai2.Type.STRING },
              category: { type: import_genai2.Type.STRING },
              type: { type: import_genai2.Type.STRING },
              subcategory: { type: import_genai2.Type.STRING },
              color: { type: import_genai2.Type.STRING },
              secondaryColor: { type: import_genai2.Type.STRING, nullable: true },
              pattern: { type: import_genai2.Type.STRING },
              material: { type: import_genai2.Type.STRING },
              style: { type: import_genai2.Type.STRING },
              formality: { type: import_genai2.Type.STRING },
              fit: { type: import_genai2.Type.STRING },
              season: {
                type: import_genai2.Type.ARRAY,
                items: { type: import_genai2.Type.STRING }
              },
              occasion: {
                type: import_genai2.Type.ARRAY,
                items: { type: import_genai2.Type.STRING }
              },
              tags: {
                type: import_genai2.Type.ARRAY,
                items: { type: import_genai2.Type.STRING }
              },
              careInstructions: { type: import_genai2.Type.STRING },
              stylingNote: { type: import_genai2.Type.STRING },
              confidenceScore: { type: import_genai2.Type.NUMBER }
            },
            required: ["hasMultipleItems", "isClothingItem", "name", "category", "type", "color", "pattern", "material", "style", "formality", "season", "tags", "confidenceScore"]
          }
        }
      });
      const parsed = JSON.parse(response.text || "{}");
      parsed.category = validateAndFixCategory(parsed.type, parsed.category);
      parsed.confidence = parsed.confidenceScore;
      return res.json({ success: true, analysis: parsed });
    } catch (_error) {
      return res.status(422).json({
        success: false,
        error: "AI identification couldn't be completed.",
        needsConfirmation: true
      });
    }
  });
  app.post("/api/gemini/stylist", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const userProfile = req.user?.profile || db.getUserById(userId)?.profile;
      const userWardrobe = db.getWardrobe(userId);
      const userWearHistory = db.data.wearHistory?.[userId] || [];
      const result = await generateStylistRecommendations(
        userId,
        req.body || {},
        userWardrobe,
        userProfile,
        userWearHistory,
        req.user?.name || "Client"
      );
      db.incrementAIRequestCount(userId, "Outfit Synthesis", result.outfitName || "Outfit Studio Generation");
      return res.json({ success: true, recommendation: result });
    } catch (error) {
      console.error("Stylist recommendation error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Stylist engine failed to generate recommendation."
      });
    }
  });
  app.post("/api/gemini/swap-piece", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const userProfile = req.body.userProfile || req.user?.profile || db.data.users.find((u) => u.id === userId)?.profile;
      const userWardrobe = db.getWardrobe(userId);
      const result = await swapOutfitPiece(
        userId,
        req.body,
        userWardrobe,
        userProfile
      );
      return res.json(result);
    } catch (err) {
      console.error("Swap piece error:", err);
      return res.status(500).json({ success: false, error: err.message || "Failed to swap piece." });
    }
  });
  app.post("/api/gemini/organize-wardrobe", authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const userWardrobe = db.getWardrobe(userId);
    if (!userWardrobe || userWardrobe.length === 0) {
      return res.status(400).json({ error: "Your wardrobe is empty. Please add items before auto-organizing." });
    }
    try {
      const ai = getAIClient2();
      const itemsSummary = userWardrobe.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        type: item.type || item.subcategory || "Garment",
        color: item.color || "Neutral",
        secondaryColor: item.secondaryColor || null,
        pattern: item.pattern || "Solid",
        material: item.material || "Fabric",
        style: item.style || "Smart Casual",
        formality: item.formality || "Smart Casual",
        fit: item.fit || "Regular"
      }));
      const prompt = `You are PAURVI's Head of Haute Couture Wardrobe Curation & Aesthetic Color Theory.
Analyze this user's wardrobe inventory (${userWardrobe.length} pieces) and organize them into 3 to 6 cohesive, visually stunning aesthetic clusters based on harmonious color palettes, garment styles, and silhouette vibes.

User's Wardrobe Inventory:
${JSON.stringify(itemsSummary, null, 2)}

TASK REQUIREMENTS:
1. Create 3 to 6 distinct aesthetic cluster groupings.
2. Every item in the wardrobe MUST be assigned to exactly one most suitable cluster group based on its color and style harmony.
3. For each cluster group, provide:
   - id: unique string identifier (e.g. "cluster_monochrome", "cluster_warm_earth")
   - name: refined, luxurious curation title (e.g. "Monochrome & Slate Tailoring", "Warm Earth Tones & Cashmere Neutrals", "Indigo Denim & Weekend Casuals", "Luminous Alabaster & Minimal Essentials", "Jewel Tones & Evening Statement")
   - themeType: one of ['color', 'style', 'aesthetic_harmony']
   - primaryColorPalette: array of 2-4 primary hex codes or color names in this cluster (e.g. ["#0F172A", "#334155", "#E2E8F0"])
   - styleVibe: high-fashion style aesthetic descriptor (e.g. "Quiet Luxury Minimalist", "Warm Relaxed Elegance", "Contemporary Urban Sartorial")
   - itemIds: array of exact garment IDs from the inventory assigned to this cluster
   - aestheticDescription: 1-2 sentence description explaining the visual synergy of this color and style group
   - stylingTip: 1 actionable haute-couture styling guideline for wearing pieces from this group
4. Provide a color palette breakdown summary with calculated distribution.
5. Provide a style distribution breakdown.
6. Provide an overall capsule harmony score (integer from 0 to 100 calculated from color and style versatility across the wardrobe) and executive aesthetic summary.
`;
      const response = await ai.models.generateContent({
        model: getGeminiModel(),
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai2.Type.OBJECT,
            properties: {
              executiveAestheticSummary: { type: import_genai2.Type.STRING },
              capsuleHarmonyScore: { type: import_genai2.Type.INTEGER },
              clusters: {
                type: import_genai2.Type.ARRAY,
                items: {
                  type: import_genai2.Type.OBJECT,
                  properties: {
                    id: { type: import_genai2.Type.STRING },
                    name: { type: import_genai2.Type.STRING },
                    themeType: { type: import_genai2.Type.STRING },
                    primaryColorPalette: {
                      type: import_genai2.Type.ARRAY,
                      items: { type: import_genai2.Type.STRING }
                    },
                    styleVibe: { type: import_genai2.Type.STRING },
                    itemIds: {
                      type: import_genai2.Type.ARRAY,
                      items: { type: import_genai2.Type.STRING }
                    },
                    aestheticDescription: { type: import_genai2.Type.STRING },
                    stylingTip: { type: import_genai2.Type.STRING }
                  },
                  required: ["id", "name", "themeType", "primaryColorPalette", "styleVibe", "itemIds", "aestheticDescription", "stylingTip"]
                }
              },
              paletteBreakdown: {
                type: import_genai2.Type.ARRAY,
                items: {
                  type: import_genai2.Type.OBJECT,
                  properties: {
                    colorName: { type: import_genai2.Type.STRING },
                    hex: { type: import_genai2.Type.STRING },
                    itemCount: { type: import_genai2.Type.INTEGER },
                    percentage: { type: import_genai2.Type.NUMBER }
                  },
                  required: ["colorName", "hex", "itemCount", "percentage"]
                }
              },
              styleDistribution: {
                type: import_genai2.Type.ARRAY,
                items: {
                  type: import_genai2.Type.OBJECT,
                  properties: {
                    styleName: { type: import_genai2.Type.STRING },
                    itemCount: { type: import_genai2.Type.INTEGER },
                    percentage: { type: import_genai2.Type.NUMBER }
                  },
                  required: ["styleName", "itemCount", "percentage"]
                }
              }
            },
            required: ["executiveAestheticSummary", "capsuleHarmonyScore", "clusters", "paletteBreakdown", "styleDistribution"]
          }
        }
      });
      const parsed = JSON.parse(response.text || "{}");
      const assignedItemIds = /* @__PURE__ */ new Set();
      (parsed.clusters || []).forEach((c) => {
        (c.itemIds || []).forEach((id) => assignedItemIds.add(id));
      });
      const unassignedItems = userWardrobe.filter((w) => !assignedItemIds.has(w.id));
      if (unassignedItems.length > 0 && parsed.clusters && parsed.clusters.length > 0) {
        parsed.clusters[0].itemIds.push(...unassignedItems.map((w) => w.id));
      }
      const result = {
        organizedAt: (/* @__PURE__ */ new Date()).toISOString(),
        ...parsed
      };
      db.incrementAIRequestCount(userId, "Wardrobe Auto-Organize", `${parsed.clusters?.length || 0} Aesthetic Clusters`);
      return res.json({ success: true, organization: result });
    } catch (_err) {
      const colorMap = {
        "Neutrals & Monochromes": [],
        "Warm Earth & Amber Tones": [],
        "Cool Blues & Denim": [],
        "Rich Jewels & Evening Accents": []
      };
      userWardrobe.forEach((item) => {
        const c = (item.color || "").toLowerCase();
        if (c.includes("black") || c.includes("charcoal") || c.includes("white") || c.includes("grey") || c.includes("gray") || c.includes("silver")) {
          colorMap["Neutrals & Monochromes"].push(item.id);
        } else if (c.includes("beige") || c.includes("camel") || c.includes("brown") || c.includes("khaki") || c.includes("terracotta") || c.includes("gold")) {
          colorMap["Warm Earth & Amber Tones"].push(item.id);
        } else if (c.includes("blue") || c.includes("navy") || c.includes("denim")) {
          colorMap["Cool Blues & Denim"].push(item.id);
        } else {
          colorMap["Rich Jewels & Evening Accents"].push(item.id);
        }
      });
      const clusters = Object.entries(colorMap).filter(([_, ids]) => ids.length > 0).map(([name, ids], idx) => {
        let styleVibe = "Refined Minimalist";
        let palette = ["#0F172A", "#64748B"];
        let tip = "Balance darker pieces with lighter foundational layers for structural depth.";
        if (name.includes("Warm")) {
          styleVibe = "Soft Sartorial Warmth";
          palette = ["#D97706", "#92400E", "#FDE68A"];
          tip = "Combine textured knits with smooth tailored wool for tactile harmony.";
        } else if (name.includes("Blues")) {
          styleVibe = "Elevated Casual & Denim";
          palette = ["#1D4ED8", "#60A5FA", "#DBEAFE"];
          tip = "Layer varying tones of blue to achieve effortless tonal symmetry.";
        } else if (name.includes("Jewels")) {
          styleVibe = "High-Impact Sophistication";
          palette = ["#059669", "#881337", "#7C3AED"];
          tip = "Use as the solitary focal statement piece anchored by dark neutral trousers.";
        }
        return {
          id: `cluster_fallback_${idx}`,
          name,
          themeType: "color",
          primaryColorPalette: palette,
          styleVibe,
          itemIds: ids,
          aestheticDescription: `Curated grouping of ${ids.length} pieces sharing tonal balance and compatible silhouette textures.`,
          stylingTip: tip
        };
      });
      const totalItems = userWardrobe.length || 1;
      const colorCounts = {};
      userWardrobe.forEach((item) => {
        const norm = normalizeColor(item.color);
        const key = norm.displayName;
        if (!colorCounts[key]) {
          let hex = "#64748B";
          if (norm.family === "BLACK") hex = "#0F172A";
          else if (norm.family === "BLUE") hex = "#1E40AF";
          else if (norm.family === "GREY") hex = "#475569";
          else if (norm.family === "WHITE") hex = "#F8FAFC";
          else if (norm.family === "BROWN") hex = "#92400E";
          else if (norm.family === "GREEN") hex = "#166534";
          else if (norm.family === "RED") hex = "#991B1B";
          else if (norm.family === "YELLOW") hex = "#CA8A04";
          else if (norm.family === "ORANGE") hex = "#C2410C";
          else if (norm.family === "PURPLE") hex = "#6B21A8";
          colorCounts[key] = { count: 0, hex, displayName: key };
        }
        colorCounts[key].count++;
      });
      const paletteBreakdown = Object.values(colorCounts).sort((a, b) => b.count - a.count).map((entry) => ({
        colorName: entry.displayName,
        hex: entry.hex,
        itemCount: entry.count,
        percentage: Math.round(entry.count / totalItems * 100)
      }));
      const styleCounts = {};
      userWardrobe.forEach((item) => {
        const st = item.style || "Smart Casual";
        styleCounts[st] = (styleCounts[st] || 0) + 1;
      });
      const styleDistribution = Object.entries(styleCounts).sort((a, b) => b[1] - a[1]).map(([styleName, count]) => ({
        styleName,
        itemCount: count,
        percentage: Math.round(count / totalItems * 100)
      }));
      let pairCompatibilitySum = 0;
      let pairCount = 0;
      const tops = userWardrobe.filter((i) => i.category === "Tops");
      const bottoms = userWardrobe.filter((i) => i.category === "Bottoms");
      for (const t of tops.slice(0, 8)) {
        for (const b of bottoms.slice(0, 8)) {
          const colorEval = evaluateColorCompatibility([t.color, b.color]);
          const patternEval = evaluatePatternCompatibility([t.pattern || "Solid", b.pattern || "Solid"]);
          pairCompatibilitySum += Math.round((colorEval.score + patternEval.score) / 2);
          pairCount++;
        }
      }
      const calculatedHarmonyScore = pairCount > 0 ? Math.round(pairCompatibilitySum / pairCount) : 75;
      const fallbackResult = {
        organizedAt: (/* @__PURE__ */ new Date()).toISOString(),
        executiveAestheticSummary: `Your wardrobe showcases real capsule synergy with ${clusters.length} distinct tonal categories across ${userWardrobe.length} catalogued pieces.`,
        capsuleHarmonyScore: calculatedHarmonyScore,
        clusters,
        paletteBreakdown,
        styleDistribution
      };
      db.incrementAIRequestCount(userId, "Wardrobe Auto-Organize", `${clusters.length} Aesthetic Clusters (Deterministic)`);
      return res.json({
        success: true,
        isQuotaFallback: true,
        organization: fallbackResult
      });
    }
  });
  app.post("/api/gemini/chat", authMiddleware, async (req, res) => {
    try {
      const { message, conversationHistory = [], weather, location, time, date } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ error: "Message cannot be empty." });
      }
      const userId = req.user.id;
      const userWardrobe = db.getWardrobe(userId);
      const userOutfits = db.getOutfits(userId);
      const ai = getAIClient2();
      const systemPrompt = `You are PN Outfit Suggester \u2014 an elite personal fashion stylist and wardrobe archivist for client ${req.user.name}.
You speak with quiet luxury sophistication: authoritative, discerning, warm, articulate, and precise in tailoring terminology.

You support TWO MODES. Intelligently determine which mode to use:

MODE 1: GENERAL STYLE ADVISOR
Answer general fashion/styling questions using your vast styling knowledge. (e.g., "What colour shirt goes with navy trousers?", "How do I style Chelsea boots?", "What should I wear to a wedding?")

MODE 2: PERSONAL WARDROBE STYLIST & OUTFIT GENERATOR
Use the user's actual uploaded wardrobe to make personalized recommendations and handle interactive outfit refinement.

ENVIRONMENTAL CONTEXT (Use when styling depends on weather/location/time):
Location: ${location || "Unknown"}
Weather: ${weather || "Unknown"}
Time: ${time || "Unknown"}
Date: ${date || "Unknown"}

CLIENT WARDROBE CONTEXT:
${userWardrobe.length === 0 ? "Wardrobe is currently empty (0 items). Encourage the client to catalogue their pieces by uploading photos or adding garments. When asked for advice, suggest timeless capsule essentials." : `Total catalogued pieces: ${userWardrobe.length}. Available Items: ` + userWardrobe.map((i) => `"${i.name}" (${i.category}, ${i.color}, ${i.fit || "Tailored"})`).join("; ")}

STRICT INSTRUCTIONS FOR WARDROBE-BASED RECOMMENDATIONS (MODE 2):
1. ACCURACY: ONLY recommend items that actually exist in the client's wardrobe when constructing specific outfits. Never invent shirts, trousers, shoes, outerwear, or accessories.
2. MISSING ITEMS: If the user doesn't own something necessary, say so clearly (e.g., "You don't currently have a formal blazer in your wardrobe...").
3. NO FAKE CERTAINTY: If you cannot determine something, say you are uncertain. Do not pretend an item exists if it doesn't.
4. STRUCTURED FORMAT: When proposing an outfit recommendation from the wardrobe, you MUST use EXACTLY this clean structured visual format:

LOOK NAME: [Name of the look]

TOP
[Exact name of item from wardrobe]

BOTTOM
[Exact name of item from wardrobe]

FOOTWEAR
[Exact name of item from wardrobe]

OUTERWEAR
[Exact name of item from wardrobe, or "None needed" / "Omit for warm climate"]

ACCESSORIES
[Exact name of item from wardrobe if appropriate, or "Minimalist accents"]

WHY IT WORKS
[Clear explanation of color harmony, silhouette balance, and fabric texture]

BEST FOR
[Occasion, time of day, and weather suitability]

STYLE TIP
[Specific sartorial advice on cuffing, tucking, or layering]

ALTERNATIVE
[Second configuration or piece substitution from available wardrobe]

FOLLOW-UP REFINEMENT REQUESTS:
Maintain complete continuity across conversation turns. When the user sends follow-up requests such as:
- "Make it less formal / more formal"
- "I don't want to wear jeans" / "Swap the trousers for something darker"
- "Use my black boots instead"
- "Add a layer for cooler evening weather"
- "Give me another alternative"
Directly reference the previously proposed outfit from the conversation history, adjust the specified items while keeping the harmonious pieces intact, and re-output the refined outfit using the exact structured format above.

GENERAL RULES:
- Do NOT use repetitive generic phrases like "This outfit is perfect for you." Explain WHY it works.
- If a question requires missing information (such as destination occasion), ask a brief, focused follow-up. Do not ask for weather/location/time if already provided in the context.`;
      const contents = [];
      contents.push({ role: "user", parts: [{ text: systemPrompt }] });
      contents.push({ role: "model", parts: [{ text: `Understood. I am PN Outfit Suggester, ready to advise ${req.user.name} with precise context awareness, strict wardrobe grounding, and interactive refinement.` }] });
      for (const msg of conversationHistory.slice(-20)) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        });
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });
      const response = await ai.models.generateContent({
        model: getGeminiModel(),
        contents
      });
      db.incrementAIRequestCount(userId, "Concierge Conversation", message.substring(0, 40));
      return res.json({
        reply: response.text || "I have analyzed your request and look forward to refining your style."
      });
    } catch (_error) {
      markQuotaCooldown();
      const userId = req.user.id;
      const userWardrobe = db.getWardrobe(userId);
      const top = userWardrobe.find((i) => i.category === "Tops");
      const bottom = userWardrobe.find((i) => i.category === "Bottoms");
      const footwear = userWardrobe.find((i) => i.category === "Footwear");
      const outerwear = userWardrobe.find((i) => i.category === "Outerwear");
      let replyText = "";
      if (userWardrobe.length > 0 && (top || bottom)) {
        replyText = `LOOK NAME: The Refined Tailored Capsule

TOP
${top ? top.name : "Tailored Cotton Shirt"}

BOTTOM
${bottom ? bottom.name : "Pleated Trousers"}

FOOTWEAR
${footwear ? footwear.name : "Classic Leather Loafers"}

OUTERWEAR
${outerwear ? outerwear.name : "Omit for current temperature"}

ACCESSORIES
Minimalist leather watch and silver accents

WHY IT WORKS
This pairing balances crisp linear proportions with comfortable drape, creating an effortless transition from day to evening.

BEST FOR
Smart Casual engagements, dinner, and professional settings.

STYLE TIP
Tuck the shirt cleanly into the waistband to accentuate the rise of the trousers.

ALTERNATIVE
Pair with neutral footwear or swap in a fine-gauge sweater for cooler temperatures.`;
      } else {
        replyText = `I have received your styling request. For timeless sartorial elegance, pairing neutral earthy tones (espresso, navy, charcoal, and ecru) with clean silhouettes creates an effortlessly polished look. Once you catalogue items in your PAURVI digital wardrobe, I will assemble tailored outfit formulas using your exact pieces.`;
      }
      db.incrementAIRequestCount(userId, "Concierge Conversation", req.body?.message?.substring(0, 40) || "Query");
      return res.json({
        reply: replyText,
        isQuotaFallback: true
      });
    }
  });
  const trendCache = /* @__PURE__ */ new Map();
  const TREND_CACHE_TTL = 1e3 * 60 * 60;
  let quotaCooldownUntil = 0;
  function markQuotaCooldown() {
    quotaCooldownUntil = Date.now() + 1e3 * 60 * 5;
  }
  function isQuotaCoolingDown() {
    return Date.now() < quotaCooldownUntil;
  }
  function getSeasonalCuratedTrends(season) {
    const isSpringSummer = /spring|summer/i.test(season);
    const isResort = /resort|cruise/i.test(season);
    if (isSpringSummer) {
      return {
        season: season || "Spring / Summer 2026",
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
        headlineSummary: "Fluid tailoring in breathable linen and crinkled silk, softened sorbet accents, and deconstructed blazers redefine warm-weather luxury with breezy lightness.",
        keyTakeaways: [
          "Relaxed unstructured tailoring in lightweight natural silks and open-weave linens",
          "Sun-bleached limoncello, pale pistache, and seafoam pastels grounded by crisp ecru",
          "Woven raffia carryalls and ergonomic minimalist leather slides"
        ],
        searchQueries: [
          `Spring Summer 2026 fashion runway trends Vogue GQ`,
          `Warm weather luxury tailoring color trends 2026`,
          `Ready to wear spring summer fashion week reports`
        ],
        sources: [
          { title: "Vogue: Spring/Summer Runway Analysis & Key Trends", uri: "https://www.vogue.com/fashion/trends" },
          { title: "GQ: Warm Weather Tailoring & Modern Menswear", uri: "https://www.gq.com/style" },
          { title: "WWD: Spring Ready-to-Wear Collection Highlights", uri: "https://wwd.com/fashion-news/fashion-features/" },
          { title: "Harper's Bazaar: Essential Summer Silhouettes", uri: "https://www.harpersbazaar.com/fashion/trends/" }
        ],
        trends: [
          {
            id: "trend_ss_1",
            title: "Deconstructed Linen & Silk Suiting",
            category: "Key Silhouettes",
            season: season || "Spring / Summer 2026",
            headline: "Unlined, soft-shouldered tailoring in open-weave breathable fabrics.",
            summary: "Runways across Milan embraced unlined blazers with draped lapels and fluid, wide-leg trousers that keep tailoring crisp yet entirely effortless in warmer climates.",
            keyElements: [
              "Unlined interior construction for maximum airflow",
              "Subtle slub texture in pure Italian linen and silk blends",
              "Soft natural shoulders without stiff padding"
            ],
            colorPalette: [
              { name: "Crisp Ecru", hex: "#F5F2EB" },
              { name: "Warm Sand", hex: "#D6C7B2" },
              { name: "Pale Sage", hex: "#9EADA0" }
            ],
            howToStyle: "Wear an unlined linen jacket over a fine supima cotton tank or open-collar knit polo with pleated linen trousers.",
            matchingCategories: ["Outerwear", "Tops", "Bottoms"],
            tag: "Runway Focus"
          },
          {
            id: "trend_ss_2",
            title: "Sorbet & Citron Sun-Bleached Palettes",
            category: "Color Palettes",
            season: season || "Spring / Summer 2026",
            headline: "Limoncello yellow, washed pistache, and dusty sky blue anchor warm-weather palettes.",
            summary: "Designers infused breezy collections with optimistic, soft pastels that blend smoothly with warm stone neutrals and crisp optic whites.",
            keyElements: [
              "Tonal pastel pairing with matte ivory and bone",
              "Garment-dyed washed finishes for lived-in character",
              "Translucent silk georgette in sunny hues"
            ],
            colorPalette: [
              { name: "Limoncello", hex: "#FFF275" },
              { name: "Pistachio Gelato", hex: "#A8D5BA" },
              { name: "Dusty Azure", hex: "#7EA8BE" }
            ],
            howToStyle: "Incorporate a pale citron silk shirt or pastel knit tucked into bone-white trousers with neutral suede footwear.",
            matchingCategories: ["Tops", "Dresses", "Accessories"],
            tag: "Color Trend"
          },
          {
            id: "trend_ss_3",
            title: "Textural Open Knits & Crochet Gauze",
            category: "Fabrics & Textures",
            season: season || "Spring / Summer 2026",
            headline: "Tactile mesh knits and airy open-weave cotton providing dimensional breathability.",
            summary: "Textured summer knitwear took center stage, providing a three-dimensional visual rhythm while remaining exceptionally light.",
            keyElements: [
              "Open cellular knit structures",
              "Mercerized cotton with a subtle natural sheen",
              "Contrast ribbing along collar and hem"
            ],
            colorPalette: [
              { name: "Raw Cotton", hex: "#EBE3D5" },
              { name: "Deep Terracotta", hex: "#C86D51" },
              { name: "Espresso", hex: "#382923" }
            ],
            howToStyle: "Layer an open-knit short-sleeve polo over an airy ribbed tank and tailored Bermuda shorts or lightweight chinos.",
            matchingCategories: ["Tops", "Outerwear"],
            tag: "Tactile Detail"
          },
          {
            id: "trend_ss_4",
            title: "Sculpted Woven Slides & Fisherman Sandals",
            category: "Accessories & Footwear",
            season: season || "Spring / Summer 2026",
            headline: "Polished calfskin fisherman sandals and woven leather slides grounding summer ensembles.",
            summary: "Footwear balances artisanal craftsmanship and architectural ergonomics with clean cage straps and beveled leather soles.",
            keyElements: [
              "Interlocking smooth calfskin straps",
              "Brushed metal micro-buckles",
              "Ergonomic molded footbed in tonal leather"
            ],
            colorPalette: [
              { name: "Burnished Tan", hex: "#A76D38" },
              { name: "Rich Cognac", hex: "#7B3F00" },
              { name: "Midnight Noir", hex: "#18181B" }
            ],
            howToStyle: "Pair woven leather slides with cropped trousers or linen shorts for an effortless Mediterranean resort vibe.",
            matchingCategories: ["Footwear", "Accessories"],
            tag: "Footwear Essential"
          },
          {
            id: "trend_ss_5",
            title: "Slouchy Raffia & Canvas Shoppers",
            category: "Accessories & Footwear",
            season: season || "Spring / Summer 2026",
            headline: "Oversized natural fiber totes with rich leather trim and clean geometric lines.",
            summary: "Bags focus on organic tactile luxury, blending durable Madagascar raffia with bridle leather handles and brass studs.",
            keyElements: [
              "Hand-braided natural raffia weaves",
              "Cognac saddle-leather top handles",
              "Spacious, unconstructed volume"
            ],
            colorPalette: [
              { name: "Natural Raffia", hex: "#D8C3A5" },
              { name: "Saddle Tan", hex: "#8E5B3E" },
              { name: "Chalk White", hex: "#F3F4F6" }
            ],
            howToStyle: "Carry a large raffia shopper under the arm with monochrome linen tailoring for a balanced contrast of textures.",
            matchingCategories: ["Bags", "Accessories"],
            tag: "Bags Trend"
          },
          {
            id: "trend_ss_6",
            title: "Pleated Linen Bermudas & Wide Shorts",
            category: "Key Silhouettes",
            season: season || "Spring / Summer 2026",
            headline: "Tailored knee-length shorts with sharp front pleats and refined dress-trouser details.",
            summary: "Shorts step into formal territory with trouser-like waistbands, double pleats, and extended hems that hit just at the knee.",
            keyElements: [
              "Double forward pleats and extended tab closure",
              "Generous leg opening with clean tailored cuffs",
              "Heavyweight Irish linen drape"
            ],
            colorPalette: [
              { name: "Navy Serge", hex: "#1E293B" },
              { name: "Stone Khaki", hex: "#C5BAAF" },
              { name: "Olive Drape", hex: "#556B2F" }
            ],
            howToStyle: "Pair with an oversized poplin button-down shirt tucked in at the front, styled with leather loafers.",
            matchingCategories: ["Bottoms"],
            tag: "Silhouette Staple"
          }
        ]
      };
    }
    if (isResort) {
      return {
        season: season || "Resort & High Summer",
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
        headlineSummary: "The resort season exudes barefoot opulence through billowing silk habotai, sunset ombr\xE9 gradients, and artisanal woven embellishments designed for effortless global travel.",
        keyTakeaways: [
          "Draped kaftan silhouettes, flowing maxi dresses, and fluid poplin matching sets",
          "Rich sunset terracotta, golden saffron, and deep cerulean blue harmonies",
          "Artisanal macram\xE9 cords, polished horn buttons, and sculpted statement cuffs"
        ],
        searchQueries: [
          `Resort Cruise fashion runway trends Vogue GQ`,
          `Luxury resortwear vacation capsule trends 2026`,
          `High summer designer collections Harper's Bazaar`
        ],
        sources: [
          { title: "Vogue: Resort & Cruise Runway Collections", uri: "https://www.vogue.com/fashion/trends" },
          { title: "WWD: Luxury Resortwear Market Forecast", uri: "https://wwd.com/fashion-news/fashion-features/" },
          { title: "Harper's Bazaar: The Ultimate Vacation Capsule Edit", uri: "https://www.harpersbazaar.com/fashion/trends/" },
          { title: "GQ: Riviera & Resort Style Guide", uri: "https://www.gq.com/style" }
        ],
        trends: [
          {
            id: "trend_resort_1",
            title: "Sunset Ombr\xE9 & Saffron Silk Separates",
            category: "Color Palettes",
            season: season || "Resort & High Summer",
            headline: "Graduated warm sunset washes and rich golden spice tones.",
            summary: "Cruise collections captured the warmth of Mediterranean evenings with flowing silks dyed in harmonious gradients of saffron, peach, and burnt terracotta.",
            keyElements: [
              "Fluid silk twill with subtle luminous reflection",
              "Dip-dyed ombr\xE9 transitions",
              "Minimalist clean stitching"
            ],
            colorPalette: [
              { name: "Golden Saffron", hex: "#F4A261" },
              { name: "Burnt Terracotta", hex: "#E76F51" },
              { name: "Rose Sunset", hex: "#E9967A" }
            ],
            howToStyle: "Wear a fluid silk button-down over ecru wide-leg linen trousers, unbuttoned at the neckline with gold jewelry.",
            matchingCategories: ["Tops", "Dresses", "Accessories"],
            tag: "Resort Focus"
          },
          {
            id: "trend_resort_2",
            title: "Draped Kaftans & Relaxed Camp Shirts",
            category: "Key Silhouettes",
            season: season || "Resort & High Summer",
            headline: "Generous airy cuts with open convertible collars and breezy side slits.",
            summary: "Effortless resort silhouettes that transition from private coastal cabanas to evening terrace dinners with pure sartorial nonchalance.",
            keyElements: [
              "Wide Cuban/camp collars with relaxed drape",
              "Deep side-seam vents for movement",
              "Mother-of-pearl buttons"
            ],
            colorPalette: [
              { name: "Pure Chalk", hex: "#FAFAF9" },
              { name: "Aegean Azure", hex: "#2A9D8F" },
              { name: "Warm Almond", hex: "#D4A373" }
            ],
            howToStyle: "Pair a boxy camp-collar shirt with fluid drawstring trousers and leather sandals for a relaxed evening look.",
            matchingCategories: ["Tops", "Bottoms", "Dresses"],
            tag: "Vacation Core"
          },
          {
            id: "trend_resort_3",
            title: "Modernist Sculpted Metals & Organic Horn",
            category: "Accessories & Footwear",
            season: season || "Resort & High Summer",
            headline: "Chunky molten gold cuffs, hammered silver, and polished natural horn accents.",
            summary: "Jewelry draws inspiration from brutalist coastal architecture and natural beach glass, delivering sculptural focal points.",
            keyElements: [
              "Hammered high-polish 18k gold finishes",
              "Organic asymmetrical silhouettes",
              "Heavyweight feel with ergonomic balance"
            ],
            colorPalette: [
              { name: "Brushed 18k Gold", hex: "#E5C158" },
              { name: "Molten Silver", hex: "#CBD5E1" },
              { name: "Dark Buffalo Horn", hex: "#3E2723" }
            ],
            howToStyle: "Wear a single oversized gold cuff on the bare forearm with a minimalist monochrome linen dress or shirt.",
            matchingCategories: ["Jewelry", "Accessories"],
            tag: "Jewelry Statement"
          },
          {
            id: "trend_resort_4",
            title: "Artisanal Crochet Gauze & Macram\xE9 Accents",
            category: "Fabrics & Textures",
            season: season || "Resort & High Summer",
            headline: "Hand-knotted cords and geometric openwork textures.",
            summary: "Artisanal techniques lend tactile soul to modern vacation dressing, creating airy textures that layer over clean swim and evening base pieces.",
            keyElements: [
              "Hand-crafted open gauge macram\xE9 fringe",
              "Organic unbleached cotton yarns",
              "Subtle wood and shell beading details"
            ],
            colorPalette: [
              { name: "Unbleached Cotton", hex: "#F7F4EB" },
              { name: "Deep Indigo", hex: "#1D3557" },
              { name: "Clay Brown", hex: "#8B5E3C" }
            ],
            howToStyle: "Layer a crochet vest or gauze overshirt over a simple silk slip dress or tailored trousers.",
            matchingCategories: ["Tops", "Outerwear", "Accessories"],
            tag: "Tactile Resort"
          }
        ]
      };
    }
    return {
      season: season || "Autumn / Winter 2026",
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
      headlineSummary: "The season pivots toward architectural tailoring, tactile earthy richness, and effortless drape, defined by quiet luxury subtleties and elevated utilitarian proportions.",
      keyTakeaways: [
        "Architectural outerwear with hourglass cinching and strong structured shoulders",
        "Rich espresso, oxblood, and warm terracotta replacing monochrome black",
        "Wide-leg puddle trousers paired with sharply pointed-toe footwear"
      ],
      searchQueries: [
        `Autumn Winter 2026 fashion runway trends Vogue GQ`,
        `Key fashion color palettes and silhouettes 2026`,
        `Ready to wear trend report WWD Harper's Bazaar`
      ],
      sources: [
        { title: "Vogue: The Top Seasonal Runway & Style Trends", uri: "https://www.vogue.com/fashion/trends" },
        { title: "GQ: Essential Menswear & Tailoring Directions", uri: "https://www.gq.com/style" },
        { title: "WWD: Ready-to-Wear Fashion Week Analysis", uri: "https://wwd.com/fashion-news/fashion-features/" },
        { title: "Harper's Bazaar: The Defining Silhouettes & Colors", uri: "https://www.harpersbazaar.com/fashion/trends/" }
      ],
      trends: [
        {
          id: "trend_1",
          title: "Architectural Tailoring & Hourglass Coats",
          category: "Key Silhouettes",
          season: season || "Autumn / Winter 2026",
          headline: "Strong structured shoulders balanced by sculpted waists and double-breasted closures.",
          summary: "Runways across Milan and Paris emphasized powerful, statuesque outerwear that reclaims the authority of classic tailoring without feeling rigid. Think double-faced wool, extended lapels, and sharp waist cinching.",
          keyElements: [
            "Structured shoulder pads with clean linear drape",
            "Double-breasted fastening with horn or matte metal buttons",
            "Floor-grazing hemline with deep center vent"
          ],
          colorPalette: [
            { name: "Charcoal Slate", hex: "#2E3842" },
            { name: "Deep Camel", hex: "#B8860B" },
            { name: "Obsidian", hex: "#1A1D20" }
          ],
          howToStyle: "Pair an oversized tailored coat with slim-cut knitwear and straight-leg trousers to let the outerwear silhouette remain the commanding focal point.",
          matchingCategories: ["Outerwear", "Tops", "Bottoms"],
          tag: "Runway Focus"
        },
        {
          id: "trend_2",
          title: "Espresso & Oxblood Monochromatic Layers",
          category: "Color Palettes",
          season: season || "Autumn / Winter 2026",
          headline: "Deep chocolate brown, rich espresso, and dark burgundy surpass traditional black.",
          summary: "Designers shifted away from stark black in favor of deep roasted coffee tones, bitter chocolate leather, and wine-tinted burgundy, creating warm, rich textural depth in monochrome styling.",
          keyElements: [
            "Tonal layering across varying fabric textures",
            "Supple calfskin in burnished dark cognac and espresso",
            "Burgundy knitwear anchoring neutral outerwear"
          ],
          colorPalette: [
            { name: "Espresso Brown", hex: "#3B2219" },
            { name: "Oxblood Burgundy", hex: "#581825" },
            { name: "Warm Almond", hex: "#D2B48C" }
          ],
          howToStyle: "Wear a dark brown wool sweater with camel or dark chocolate trousers, adding oxblood leather loafers or boots for a refined tonal contrast.",
          matchingCategories: ["Tops", "Bottoms", "Footwear", "Outerwear"],
          tag: "Color Trend"
        },
        {
          id: "trend_3",
          title: "Tactile Luxury: Brushed Cashmere & Raw Denim",
          category: "Fabrics & Textures",
          season: season || "Autumn / Winter 2026",
          headline: "The tension between rugged unwashed denim and ultra-soft fine gauge knitwear.",
          summary: "A standout styling formula pairing stiff, deep indigo Japanese selvedge denim with cloud-soft brushed mohair or high-gauge cashmere turtlenecks, striking an effortless balance between casual and opulent.",
          keyElements: [
            "Clean dark-rinse selvedge denim with no distressing",
            "Chunky ribbed collar and cuffs",
            "Minimalist hardware and contrast stitching"
          ],
          colorPalette: [
            { name: "Raw Indigo", hex: "#1F2937" },
            { name: "Oatmeal Heather", hex: "#E5E0D8" },
            { name: "Terracotta", hex: "#C25E3E" }
          ],
          howToStyle: "Tuck a fine knit into high-rise raw denim jeans and layer with an unbuttoned denim overshirt or lightweight trench.",
          matchingCategories: ["Tops", "Bottoms", "Outerwear"],
          tag: "Tactile Contrast"
        },
        {
          id: "trend_4",
          title: "Sleek Elongated Point-Toe & Chelsea Hybrid",
          category: "Accessories & Footwear",
          season: season || "Autumn / Winter 2026",
          headline: "Sharp angular toes and slim shaft Chelsea boots grounding fluid trousers.",
          summary: "Footwear takes an architectural turn with elongated chiselled or pointed toes that peek out effortlessly beneath wide-leg pants and maxi outerwear.",
          keyElements: [
            "Slightly chiseled almond or pointed toe profile",
            "Beveled block heel (3-4 cm)",
            "Polished box-calf leather with high-shine luster"
          ],
          colorPalette: [
            { name: "Patent Black", hex: "#111827" },
            { name: "Burnished Cherry", hex: "#4A0E17" },
            { name: "Dark Taupe", hex: "#4B443B" }
          ],
          howToStyle: "Let fluid, wide-leg trousers drape over the boot with just the clean, pointed toe exposed for a continuous elongating leg line.",
          matchingCategories: ["Footwear", "Accessories"],
          tag: "Footwear Statement"
        },
        {
          id: "trend_5",
          title: "Fluid Pleated Trousers with Puddle Drapes",
          category: "Key Silhouettes",
          season: season || "Autumn / Winter 2026",
          headline: "Relaxed high-waisted tailoring with generous leg volume and natural break.",
          summary: "Rigid skinny cuts continue their retreat as designers double down on voluminous, fluid double-pleat trousers that move gracefully with every step.",
          keyElements: [
            "Double forward pleats for room through the hips",
            "High natural waistline with internal tab closures",
            "Extended leg length with a gentle puddle over footwear"
          ],
          colorPalette: [
            { name: "Heather Slate", hex: "#64748B" },
            { name: "Ecru Wool", hex: "#F1EBE1" },
            { name: "Deep Navy", hex: "#0F172A" }
          ],
          howToStyle: "Pair with a cropped jacket or firmly tucked-in shirt to highlight the high-rise silhouette and accentuate waist proportions.",
          matchingCategories: ["Bottoms"],
          tag: "Silhouette Staple"
        },
        {
          id: "trend_6",
          title: "Subtle Sculptural Metals & Suede Totes",
          category: "Accessories & Footwear",
          season: season || "Autumn / Winter 2026",
          headline: "Brushed matte hardware and oversized slouchy suede carryalls.",
          summary: "Accessories emphasize sensory materials: unlined velvety suede totes in warm tobacco hues paired with modernist, organic curved jewelry in brushed brass and chrome.",
          keyElements: [
            "Supple unstructured suede shoulder bags",
            "Brushed matte gold and sculpted silver jewelry",
            "Clean buckle-less belts with tab closures"
          ],
          colorPalette: [
            { name: "Tobacco Suede", hex: "#8B5A2B" },
            { name: "Brushed Gold", hex: "#D4AF37" },
            { name: "Olive Moss", hex: "#4A5D4E" }
          ],
          howToStyle: "Carry a large suede tote in the crook of your arm or tucked under the shoulder to introduce organic texture to structured coats.",
          matchingCategories: ["Bags", "Accessories", "Jewelry"],
          tag: "Accessories Essential"
        }
      ]
    };
  }
  app.all("/api/gemini/fashion-trends", async (req, res) => {
    const season = req.body?.season || req.query?.season || "Current Season";
    const category = req.body?.category || req.query?.category || "All";
    const forceRefresh = req.body?.forceRefresh === true || req.query?.forceRefresh === "true";
    const cacheKey = `${season}_${category}`.toLowerCase();
    const cached = trendCache.get(cacheKey);
    if (!forceRefresh && cached && Date.now() - cached.timestamp < TREND_CACHE_TTL) {
      return res.json({
        success: true,
        cached: true,
        report: cached.report
      });
    }
    if (isQuotaCoolingDown()) {
      const fallbackReport = getSeasonalCuratedTrends(season);
      return res.json({
        success: true,
        isQuotaFallback: true,
        report: fallbackReport
      });
    }
    try {
      const ai = getAIClient2();
      const searchQuery = `Latest fashion runway and ready-to-wear seasonal trends ${season} Vogue GQ Harper's Bazaar WWD key silhouettes color palettes styling`;
      const prompt = `You are PAURVI Atelier's Global Haute Couture Director & Fashion Trend Forecaster.
Perform a live search on current seasonal fashion trends (${season}) from global fashion capitals, runways (Milan, Paris, London, New York), top fashion journals (Vogue, GQ, Harper's Bazaar, Business of Fashion, WWD, Elle, Highsnobiety), and contemporary high-end street style.

Search specifically for:
"${searchQuery}"

Provide an authoritative, editorial analysis of the top seasonal fashion movements. Return your response formatted strictly as a single, valid JSON object enclosed in a \`\`\`json ... \`\`\` code block with EXACTLY this structure:

\`\`\`json
{
  "season": "${season}",
  "headlineSummary": "A concise 2-sentence editorial synthesis of the overarching seasonal mood, silhouette shifts, and aesthetic direction.",
  "keyTakeaways": [
    "Key takeaway 1 (e.g. Sculpted tailoring and relaxed shoulder pads)",
    "Key takeaway 2 (e.g. Earthy tonal palettes and espresso hues)",
    "Key takeaway 3 (e.g. Fluid puddle trousers with pointed boots)"
  ],
  "trends": [
    {
      "id": "trend_1",
      "title": "Editorial Trend Title (e.g. Architectural Hourglass Tailoring)",
      "category": "One of: Key Silhouettes, Color Palettes, Fabrics & Textures, Accessories & Footwear, Occasion & Vibe, Trending Now",
      "season": "${season}",
      "headline": "Punchy 1-line summary of this specific trend",
      "summary": "2-3 sentences detailing how this trend appeared on recent runways and why it is defining modern dressing.",
      "keyElements": [
        "Signature detail 1",
        "Signature detail 2",
        "Signature detail 3"
      ],
      "colorPalette": [
        { "name": "Color Name (e.g. Espresso)", "hex": "#3B2219" },
        { "name": "Color Name (e.g. Charcoal Slate)", "hex": "#2E3842" },
        { "name": "Color Name (e.g. Deep Ochre)", "hex": "#CC7A00" }
      ],
      "howToStyle": "Practical, elegant styling advice on how an individual can style this trend using pieces from their personal wardrobe.",
      "matchingCategories": ["Outerwear", "Tops", "Bottoms"],
      "tag": "e.g. Runway Focus, Quiet Luxury, Essential Core, Footwear Statement"
    }
  ]
}
\`\`\`

Generate 6 high-fashion trends covering diverse categories (Key Silhouettes, Color Palettes, Fabrics & Textures, Accessories & Footwear, Occasion & Vibe). Ensure hex colors match high-fashion palettes.`;
      const response = await ai.models.generateContent({
        model: getGeminiModel(),
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      const rawText = response.text || "";
      let parsedReport = null;
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || rawText.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        try {
          parsedReport = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch (e) {
          console.warn("Failed to parse JSON directly, cleaning text:", e);
        }
      }
      if (!parsedReport && rawText.trim().startsWith("{")) {
        try {
          parsedReport = JSON.parse(rawText);
        } catch (e) {
          console.error("JSON parse fallback failed:", e);
        }
      }
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const webSearchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];
      const extractedSources = [];
      for (const chunk of groundingChunks) {
        if (chunk?.web?.uri) {
          const uri = chunk.web.uri;
          const title = chunk.web.title || "Fashion Reference Source";
          if (!extractedSources.some((s) => s.uri === uri)) {
            extractedSources.push({ title, uri });
          }
        }
      }
      const defaultTrendsData = getSeasonalCuratedTrends(season);
      if (extractedSources.length === 0) {
        extractedSources.push(...defaultTrendsData.sources);
      }
      const finalReport = {
        season: parsedReport?.season || defaultTrendsData.season,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
        headlineSummary: parsedReport?.headlineSummary || defaultTrendsData.headlineSummary,
        keyTakeaways: parsedReport?.keyTakeaways || defaultTrendsData.keyTakeaways,
        trends: parsedReport?.trends && Array.isArray(parsedReport.trends) && parsedReport.trends.length > 0 ? parsedReport.trends.map((t, index) => ({
          id: t.id || `trend_${index + 1}`,
          title: t.title || "Curated Runway Trend",
          category: t.category || "Trending Now",
          season: t.season || season,
          headline: t.headline || "Elevated styling direction",
          summary: t.summary || "A defining seasonal movement celebrating refined craftsmanship and contemporary tailoring.",
          keyElements: t.keyElements || ["Clean linear proportions", "Tactile textures", "Sophisticated finishes"],
          colorPalette: t.colorPalette || [{ name: "Neutral Tone", hex: "#334155" }],
          howToStyle: t.howToStyle || "Integrate with clean wardrobe staples for an effortless sartorial statement.",
          matchingCategories: t.matchingCategories || ["Tops", "Bottoms", "Outerwear"],
          tag: t.tag || "Runway Direction",
          popularityScore: typeof t.popularityScore === "number" ? t.popularityScore : void 0,
          sources: extractedSources.slice(0, 2)
        })) : defaultTrendsData.trends,
        searchQueries: webSearchQueries.length > 0 ? webSearchQueries : defaultTrendsData.searchQueries,
        sources: extractedSources
      };
      trendCache.set(cacheKey, {
        report: finalReport,
        timestamp: Date.now()
      });
      return res.json({
        success: true,
        report: finalReport
      });
    } catch (_error) {
      markQuotaCooldown();
      const fallbackReport = getSeasonalCuratedTrends(season);
      trendCache.set(cacheKey, {
        report: fallbackReport,
        timestamp: Date.now()
      });
      return res.json({
        success: true,
        isQuotaFallback: true,
        report: fallbackReport
      });
    }
  });
}
async function startServer() {
  setupApiRoutes();
  app.use("/api", (req, res) => {
    res.status(404).json({ error: `API Route Not Found: ${req.method} ${req.originalUrl}` });
  });
  const PORT = 3e3;
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = import_path2.default.resolve(process.cwd(), "index.html");
        let template = import_fs2.default.readFileSync(indexPath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        if (vite) {
          vite.ssrFixStacktrace(e);
        }
        next(e);
      }
    });
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PAURVI Atelier Server running on http://0.0.0.0:${PORT}`);
  });
}
if (process.env.RUN_LOCAL_SERVER === "true") {
  startServer();
}

// cloud-functions/api/[[default]].ts
app.use((req, _res, next) => {
  if (req.url && !req.url.startsWith("/api")) {
    req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
  }
  next();
});
setupApiRoutes();
app.use("/api", (req, res) => {
  res.status(404).json({ error: `API Route Not Found: ${req.method} ${req.originalUrl || req.url}` });
});
var default_default = app;
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
