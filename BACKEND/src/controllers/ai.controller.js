const Product = require("../models/product.model");
const OpenAI  = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const userRequests = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [id, ts] of userRequests.entries()) {
    if (now - ts > 300_000) userRequests.delete(id);
  }
}, 300_000);

const CLOTHING_KEYWORDS = [
  "camisa","camiseta","playera","polo",
  "pantalón","pantalon","jeans","jean","short","bermuda",
  "chamarra","chaqueta","abrigo","suéter","sueter","hoodie","sudadera","sweatshirt",
  "zapato","tenis","bota","sandalia","calzado","sneaker",
  "gorra","cinturón","cinturon","accesorio",
  "ropa","outfit","look","estilo","prenda","moda","vestir",
  "formal","casual","elegante","sport","gym","deportivo",
  "oversized","streetwear","aesthetic","urbano",
  "cita","evento","boda","fiesta","trabajo","oficina",
  "playa","alberca","pool","verano","calor","tropical",
  "invierno","frío","frio","nieve",
  "graduación","graduacion","concierto","antro","salida",
  "negro","blanco","azul","rojo","verde","gris",
  "beige","café","morado","rosa","amarillo","naranja",
  "talla","color",
];

const isClothingRelated = (text) =>
  CLOTHING_KEYWORDS.some((kw) => text.toLowerCase().includes(kw));

const CONTEXT_MAPS = {

  playa: {
    label: "🏖️ Playa",
    styles:       ["casual","sport","verano","tropical","fresh","light","beach"],
    styleWeights: { beach: 3, tropical: 3, fresh: 2, light: 2, verano: 2 },
    colors:       ["Blanco","Azul","Beige","Verde","Amarillo","Naranja"],
    categories:   ["camisetas","shorts","calzado","accesorios"],
    excludeStyles: ["formal","business","gala","winter","invierno","cozy","warm"],
  },
  cena_formal: {
    label: "🍷 Cena formal",
    styles:       ["formal","elegante","clásico","clasico","business","dress","gala","luxury"],
    styleWeights: { formal: 3, gala: 3, elegante: 2, luxury: 2, business: 2 },
    colors:       ["Negro","Azul","Gris","Blanco","Beige"],
    categories:   ["camisas","pantalones","calzado"],
    excludeStyles: ["streetwear","hype","beach","sport","casual","oversized","skate","festival"],
  },
  cena_romantica: {
    label: "💑 Cena romántica",
    styles:       ["elegante","smart casual","romántico","romantico","date","casual chic"],
    styleWeights: { date: 3, romantico: 3, "casual chic": 2, elegante: 2 },
    colors:       ["Negro","Blanco","Azul","Vino","Beige","Gris"],
    categories:   ["camisas","camisetas","pantalones","calzado"],
    excludeStyles: ["streetwear","hype","oversized","skate","gym","sport","festival"],
  },
  salida_amigos: {
    label: "👥 Salida con amigos",
    styles:       ["casual","relaxed","chill","everyday"],
    styleWeights: { relaxed: 3, chill: 3, everyday: 2, casual: 1 },
    colors:       ["Negro","Blanco","Gris","Azul","Beige"],
    categories:   ["camisetas","pantalones","hoodies","calzado","accesorios"],
    excludeStyles: ["formal","business","gala","hype","edgy","dark","party","night","gym","sport","beach"],
  },
  boda: {
    label: "💍 Boda",
    styles:       ["formal","elegante","clásico","clasico","gala","wedding","smart"],
    styleWeights: { wedding: 3, gala: 3, formal: 2, elegante: 2 },
    colors:       ["Negro","Azul","Gris","Beige","Blanco"],
    categories:   ["camisas","pantalones","calzado"],
    excludeStyles: ["streetwear","hype","beach","sport","casual","oversized","skate","festival","gym"],
  },
  antro: {
    label: "🕺 Antro / Club",
    styles:       ["party","night","dark","hype","edgy","urbano"],
    styleWeights: { party: 3, night: 3, dark: 3, edgy: 2, hype: 2 },
    colors:       ["Negro","Gris","Blanco","Azul"],
    categories:   ["camisetas","pantalones","calzado","accesorios"],
    excludeStyles: ["formal","business","gala","relaxed","chill","everyday","gym","sport","beach","festival","wedding"],
  },
  concierto: {
    label: "🎵 Concierto",
    styles:       ["festival","rock","streetwear","aesthetic","hype"],
    styleWeights: { festival: 3, rock: 3, hype: 2, streetwear: 2, aesthetic: 2 },
    colors:       ["Negro","Gris","Blanco","Rojo"],
    categories:   ["camisetas","hoodies","pantalones","calzado","accesorios"],
    excludeStyles: ["formal","business","gala","relaxed","chill","everyday","gym","sport","beach","wedding","party","night"],
  },
  gym: {
    label: "💪 Gym",
    styles:       ["sport","deportivo","training","gym","athletic","performance","active"],
    styleWeights: { gym: 3, athletic: 3, performance: 3, training: 2, sport: 2 },
    colors:       ["Negro","Gris","Blanco","Azul","Rojo"],
    categories:   ["camisetas","pantalones","calzado","hoodies"],
    excludeStyles: ["formal","business","gala","casual","relaxed","chill","streetwear","hype","beach","festival","wedding"],
  },
  graduacion: {
    label: "🎓 Graduación",
    styles:       ["formal","smart casual","elegante","clásico","clasico"],
    styleWeights: { "smart casual": 3, elegante: 2, formal: 2 },
    colors:       ["Negro","Azul","Gris","Blanco"],
    categories:   ["camisas","pantalones","calzado"],
    excludeStyles: ["streetwear","hype","beach","sport","oversized","skate","festival","gym","party","night"],
  },
  viaje: {
    label: "✈️ Viaje",
    styles:       ["travel","comfortable","light","sport","everyday"],
    styleWeights: { travel: 3, comfortable: 3, light: 2, everyday: 2 },
    colors:       ["Beige","Blanco","Gris","Azul","Negro"],
    categories:   ["camisetas","pantalones","hoodies","calzado","accesorios"],
    excludeStyles: ["formal","business","gala","dark","edgy","hype","beach","gym","festival","party","night","wedding"],
  },
  dia_universitario: {
    label: "🎒 Universidad",
    styles:       ["streetwear","urbano","casual"],
    styleWeights: { streetwear: 2, urbano: 2, casual: 1 },
    colors:       ["Negro","Blanco","Gris","Azul","Beige"],
    categories:   ["camisetas","hoodies","pantalones","calzado","accesorios"],
    excludeStyles: ["formal","business","gala","party","night","dark","edgy","gym","sport","beach","festival","wedding","relaxed","chill","everyday"],
  },
  deporte: {
    label: "⚽ Deporte",
    styles:       ["sport","deportivo","training","athletic","outdoor","active"],
    styleWeights: { outdoor: 3, athletic: 2, sport: 2, training: 2 },
    colors:       ["Negro","Gris","Blanco","Azul","Rojo","Verde"],
    categories:   ["camisetas","pantalones","calzado"],
    excludeStyles: ["formal","business","gala","casual","relaxed","streetwear","hype","beach","festival","wedding","party","night"],
  },

  invierno: {
    styles:       ["winter","invierno","streetwear","urbano","layering","warm","cozy"],
    styleWeights: { winter: 3, cozy: 3, warm: 3, layering: 2, invierno: 2 },
    colors:       ["Negro","Gris","Azul","Café","Beige"],
    categories:   ["hoodies","chamarras","pantalones","calzado"],
    excludeStyles: ["beach","tropical","fresh","light","summer","verano"],
  },
  frio: {
    styles:       ["winter","invierno","warm","layering","urbano","cozy"],
    styleWeights: { warm: 3, cozy: 3, layering: 2, winter: 2 },
    colors:       ["Negro","Gris","Azul","Café"],
    categories:   ["hoodies","chamarras","pantalones"],
    excludeStyles: ["beach","tropical","fresh","light","summer","verano"],
  },
  verano: {
    styles:       ["casual","sport","verano","tropical","fresh","light"],
    styleWeights: { verano: 3, tropical: 3, fresh: 2, light: 2 },
    colors:       ["Blanco","Beige","Azul","Amarillo","Verde","Naranja"],
    categories:   ["camisetas","shorts","calzado"],
    excludeStyles: ["winter","invierno","warm","cozy","layering","formal","gala"],
  },
  calor: {
    styles:       ["casual","sport","verano","light","fresh","beach"],
    styleWeights: { light: 3, fresh: 3, verano: 2 },
    colors:       ["Blanco","Beige","Gris"],
    categories:   ["camisetas","shorts","calzado"],
    excludeStyles: ["winter","invierno","warm","cozy","layering","formal","gala"],
  },

  formal: {
    styles:       ["formal","business","elegante","clásico","clasico"],
    styleWeights: { formal: 3, business: 2, elegante: 2 },
    colors:       ["Negro","Azul","Gris","Blanco","Beige"],
    categories:   ["camisas","pantalones","calzado"],
    excludeStyles: ["streetwear","hype","beach","sport","casual","oversized","skate","festival"],
  },
  casual: {
    styles:       ["casual","streetwear","urbano","everyday","relaxed"],
    styleWeights: { casual: 2, everyday: 2, relaxed: 2 },
    colors:       ["Negro","Blanco","Gris","Azul","Beige"],
    categories:   ["camisetas","pantalones","hoodies","calzado"],
    excludeStyles: ["formal","business","gala","gym","sport","beach"],
  },
  streetwear: {
    styles:       ["streetwear","urbano","oversized","aesthetic","hype","skate"],
    styleWeights: { streetwear: 3, oversized: 2, hype: 2, skate: 2 },
    colors:       ["Negro","Blanco","Gris","Azul"],
    categories:   ["camisetas","hoodies","pantalones","calzado"],
    excludeStyles: ["formal","business","gala","gym","sport","beach"],
  },
  aesthetic: {
    styles:       ["aesthetic","minimal","minimalist","clean","soft"],
    styleWeights: { aesthetic: 3, minimal: 2, minimalist: 2, clean: 2 },
    colors:       ["Beige","Blanco","Gris","Negro"],
    categories:   ["camisetas","hoodies","pantalones","calzado"],
    excludeStyles: ["formal","business","gala","gym","sport","beach","hype","edgy"],
  },
  trabajo: {
    styles:       ["formal","business","smart casual","elegante"],
    styleWeights: { business: 3, formal: 2, elegante: 2 },
    colors:       ["Negro","Azul","Gris","Blanco","Beige"],
    categories:   ["camisas","pantalones","calzado"],
    excludeStyles: ["streetwear","hype","beach","sport","casual","oversized","skate","festival"],
  },
  oficina: {
    styles:       ["formal","business","smart casual","elegante"],
    styleWeights: { business: 3, formal: 2, elegante: 2 },
    colors:       ["Negro","Azul","Gris","Blanco"],
    categories:   ["camisas","pantalones","calzado"],
    excludeStyles: ["streetwear","hype","beach","sport","casual","oversized","skate","festival"],
  },
  fiesta: {
    styles:       ["streetwear","casual","urbano","party","elegante"],
    styleWeights: { party: 3, urbano: 2, elegante: 2 },
    colors:       ["Negro","Blanco","Azul","Rojo"],
    categories:   ["camisetas","pantalones","calzado"],
    excludeStyles: ["formal","business","gala","gym","sport","beach","relaxed","chill"],
  },
  cita: {
    styles:       ["casual","smart casual","elegante","urbano","date"],
    styleWeights: { date: 3, "smart casual": 2, elegante: 2 },
    colors:       ["Negro","Azul","Gris","Blanco","Beige"],
    categories:   ["camisas","camisetas","pantalones","calzado"],
    excludeStyles: ["streetwear","hype","gym","sport","beach","festival"],
  },
};

const CHAT_SUGGESTIONS = [
  "Dame un outfit para un día de playa",
  "Dame un outfit para una salida con amigos",
  "Dame un outfit para una cena formal",
  "Dame un outfit para una cena romántica",
  "Dame un outfit para ir a una boda",
  "Dame un outfit para salir al antro",
  "Dame un outfit para un concierto",
  "Dame un outfit para el gym",
  "Dame un outfit para una graduación",
  "Dame un outfit para un viaje",
  "Dame un outfit para la universidad",
];

const CONTEXT_ALIASES = {
  // Playa / verano
  "alberca":"playa","pool":"playa","tropical":"verano","caluroso":"calor",
  // Frío
  "frío":"frio","nieve":"frio","fresco":"frio",
  // Gym / deporte
  "entrenamiento":"gym","training":"gym","ejercicio":"gym","fútbol":"deporte","futbol":"deporte",
  // Trabajo
  "corporativo":"trabajo","negocios":"trabajo","ejecutivo":"formal","reunión":"trabajo","reunion":"trabajo",
  // Graduación
  "graduación":"graduacion","egresado":"graduacion","ceremonia":"graduacion",
  // Antro / salidas nocturnas
  "noche":"antro","club":"antro","bar":"antro","discoteca":"antro",
  // Concierto / festival
  "festival":"concierto","rock":"concierto","reggaeton":"concierto",
  // Estilos urbanos
  "hype":"streetwear","skate":"streetwear","urban":"streetwear",
  "minimal":"aesthetic","clean":"aesthetic","soft":"aesthetic",
  // Académico
  "universidad":"dia_universitario","uni":"dia_universitario","escuela":"dia_universitario",
  "clase":"dia_universitario","campus":"dia_universitario","diario":"casual",
  // Cenas / citas
  "romántica":"cena_romantica","romantica":"cena_romantica","aniversario":"cena_romantica",
  "primera cita":"cena_romantica","date":"cena_romantica",
  "cena":"cena_formal","restaurante":"cena_formal","restaurant":"cena_formal",
  // Boda
  "matrimonio":"boda","quinceañera":"boda","quinceanera":"boda","evento":"boda",
  // Salida con amigos
  "amigos":"salida_amigos","centro":"salida_amigos","cine":"salida_amigos","café":"salida_amigos",
  "parque":"salida_amigos","mall":"salida_amigos","plaza":"salida_amigos",
  // Viaje
  "vacaciones":"viaje","turismo":"viaje","aeropuerto":"viaje","trip":"viaje",
};

const extractContext = (input) => {
  for (const [alias, key] of Object.entries(CONTEXT_ALIASES)) {
    if (input.includes(alias) && CONTEXT_MAPS[key]) return { ...CONTEXT_MAPS[key], _key: key };
  }
  for (const [key, ctx] of Object.entries(CONTEXT_MAPS)) {
    if (input.includes(key)) return { ...ctx, _key: key };
  }
  return null;
};

const COLOR_MENTIONS = {
  "negro":"negro","negra":"negro","oscuro":"negro",
  "blanco":"blanco","blanca":"blanco","claro":"blanco",
  "azul":"azul","rojo":"rojo","roja":"rojo",
  "verde":"verde","gris":"gris","beige":"beige",
  "café":"café","cafe":"café","morado":"morado","rosa":"rosa",
  "amarillo":"amarillo","naranja":"naranja",
  "tinto":"tinto","vino":"tinto","vinotinto":"tinto",
};

const extractColors = (input) =>
  [...new Set(
    Object.entries(COLOR_MENTIONS)
      .filter(([kw]) => input.includes(kw))
      .map(([, v]) => v)
  )];

const _COLOR_KW_PATTERN = (() => {
  const kws = Object.keys(COLOR_MENTIONS).sort((a, b) => b.length - a.length);
  return new RegExp(
    String.raw`\b(\d+)\s+(?:(?!\d)[\wáéíóúüñ]+\s+){0,3}?(` +
    kws.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:s|as|es)?").join("|") +
    String.raw`)\b`,
    "gi"
  );
})();

const extractColorQuantities = (input) => {
  const result = new Map();
  let match;
  _COLOR_KW_PATTERN.lastIndex = 0;
  while ((match = _COLOR_KW_PATTERN.exec(input.toLowerCase())) !== null) {
    const qty = parseInt(match[1], 10);
    const rawKw = match[2].toLowerCase().replace(/(?:es|as|s)$/, "");
    for (const [kw, color] of Object.entries(COLOR_MENTIONS)) {
      if (rawKw === kw || kw.startsWith(rawKw) || rawKw.startsWith(kw)) {
        result.set(color, Math.max(result.get(color) || 0, qty));
        break;
      }
    }
  }
  return result;
};

const CATEGORY_MAP = {
  "camisa":"camisas","camiseta":"camisetas","playera":"camisetas","polo":"camisetas",
  "pantalón":"pantalones","pantalon":"pantalones","jeans":"pantalones","jean":"pantalones",
  "short":"shorts","bermuda":"shorts",
  "chamarra":"chamarras","chaqueta":"chamarras","abrigo":"chamarras",
  "suéter":"suéteres","sueter":"suéteres","hoodie":"hoodies","sudadera":"hoodies","sweatshirt":"hoodies",
  "zapato":"calzado","tenis":"calzado","sneaker":"calzado","bota":"calzado","sandalia":"calzado",
  "gorra":"accesorios","cinturón":"accesorios","accesorio":"accesorios",
};

const detectOutfitRequest = (input) =>
  ["outfit","look","conjunto","combina","combinar","completo"].some((w) => input.includes(w)) ||
  [...new Set(Object.keys(CATEGORY_MAP).filter((kw) => input.includes(kw)).map((kw) => CATEGORY_MAP[kw]))].length >= 2;

const detectRequestedCategories = (input) => {
  const found = new Set();
  for (const [kw, val] of Object.entries(CATEGORY_MAP)) {
    if (input.includes(kw)) found.add(val);
  }
  return [...found];
};

const scoreProduct = (p, { catsToSearch, stylesToSearch, colorsToSearch, directColors, context }) => {
  let score = 0;
  const pCat   = (p.category || "").toLowerCase();
  const pStyle = (p.style    || "").toLowerCase();
  const pColor = (p.color    || "").toLowerCase();
  const pName  = (p.name     || "").toLowerCase();

  const styleWeights   = context?.styleWeights   || {};
  const excludeStyles  = context?.excludeStyles  || [];

  for (const excl of excludeStyles) {
    if (pStyle.includes(excl.toLowerCase()) || pName.includes(excl.toLowerCase())) {
      score -= 20;
      break;
    }
  }

  for (const c of catsToSearch) {
    if (pCat.includes(c.toLowerCase())) { score += 4; break; }
  }

  for (const s of stylesToSearch) {
    if (pStyle.includes(s.toLowerCase()) || pName.includes(s.toLowerCase())) {
      const weight = styleWeights[s] || 1;
      score += 2 * weight;
    }
  }

  // Color
  const matchedColors = (directColors.length > 0 ? directColors : colorsToSearch)
    .filter((c) => pColor.includes(c.toLowerCase()));
  const colorMatch = matchedColors.length > 0;

  if (colorMatch) {
    score += 5;
  } else if (directColors.length > 0) {
    score -= 10;
  }
  if (p.stock > 0) score += 1;

  const _matchedColor = matchedColors[0]?.toLowerCase() || null;
  return { ...p, _score: score, _colorMatch: colorMatch, _matchedColor };
};

const findMatchingProducts = async (prompt) => {
  const input        = prompt.toLowerCase();
  const context      = extractContext(input);
  const directColors = extractColors(input);
  const isOutfit     = detectOutfitRequest(input);
  const reqCats      = detectRequestedCategories(input);

  const stylesToSearch = [...(context?.styles || [])];
  for (const s of ["formal","casual","oversized","streetwear","aesthetic","sport","minimal"]) {
    if (input.includes(s) && !stylesToSearch.includes(s)) stylesToSearch.push(s);
  }

  const colorsToSearch = directColors.length > 0 ? directColors : (context?.colors || []);

  let catsToSearch = reqCats.length > 0 ? reqCats : (context?.categories || []);

  if (isOutfit) {
    const OUTFIT_BASE = ["camisetas","pantalones","calzado","hoodies","accesorios"];
    for (const cat of OUTFIT_BASE) {
      if (!catsToSearch.includes(cat)) catsToSearch = [...catsToSearch, cat];
    }
  }

  if (conditions_empty(catsToSearch, stylesToSearch, colorsToSearch)) {
    return await Product.aggregate([{ $sample: { size: 6 } }]);
  }

  const scoreArgs = { catsToSearch, stylesToSearch, colorsToSearch, directColors, context };

  if (isOutfit) {
    const allCandidates = [];
    const seenIds = new Set();

    for (const cat of catsToSearch) {
      const colorConds = colorsToSearch.map((c) => ({ color: new RegExp(c, "i") }));
      const catQuery = { category: new RegExp(cat, "i") };

      const styleOrColorConds = [
        ...colorConds,
        ...stylesToSearch.map((s) => ({ style: new RegExp(s, "i") })),
        ...stylesToSearch.map((s) => ({ name:  new RegExp(s, "i") })),
      ];

      let catResults;
      if (styleOrColorConds.length > 0) {
        catResults = await Product.find({ $and: [catQuery, { $or: styleOrColorConds }] }).lean();
        if (catResults.length === 0) {
          catResults = await Product.find(catQuery).lean();
        }
      } else {
        catResults = await Product.find(catQuery).lean();
      }

      const scored = catResults
        .filter((p) => { if (seenIds.has(String(p._id))) return false; seenIds.add(String(p._id)); return true; })
        .map((p) => scoreProduct(p, scoreArgs))
        .sort((a, b) => b._score - a._score)
        .slice(0, 5);

      allCandidates.push(...scored);
    }

    return allCandidates;
  }

  const conditions = [];
  for (const cat of catsToSearch)  conditions.push({ category: new RegExp(cat, "i") });
  for (const s of stylesToSearch)  { conditions.push({ style: new RegExp(s, "i") }); conditions.push({ name: new RegExp(s, "i") }); }
  for (const c of colorsToSearch)  conditions.push({ color: new RegExp(c, "i") });

  const candidates = await Product.find({ $or: conditions }).lean();
  if (candidates.length === 0) return [];

  const scored = candidates.map((p) => scoreProduct(p, scoreArgs));
  scored.sort((a, b) => b._score - a._score);
  return scored.slice(0, 12);
};

const conditions_empty = (cats, styles, colors) =>
  cats.length === 0 && styles.length === 0 && colors.length === 0;

exports.CHAT_SUGGESTIONS = CHAT_SUGGESTIONS;
exports.CONTEXT_MAPS     = CONTEXT_MAPS;

exports.getRecommendation = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user?.id || req.ip;

    const now = Date.now();
    const lastRequest = userRequests.get(userId);
    if (lastRequest && now - lastRequest < 5000) {
      return res.status(429).json({
        message: "Espera un momento antes de hacer otra petición. ⏳",
        items: [],
      });
    }
    userRequests.set(userId, now);

    if (!prompt?.trim()) {
      return res.status(400).json({ message: "El mensaje no puede estar vacío." });
    }

    if (!isClothingRelated(prompt)) {
      return res.json({
        reply: "No encontré resultados. Intenta pedirme un outfit o una prenda específica.",
        items: [],
      });
    }

    const matchedProducts = await findMatchingProducts(prompt);

    const input        = prompt.toLowerCase();
    const context      = extractContext(input);
    const directColors = extractColors(input);
    const reqCats      = detectRequestedCategories(input);
    const wasOutfit    = detectOutfitRequest(input);

    let finalItems = [];

    if (matchedProducts.length === 0) {
      const colorMissing    = directColors.length > 0;
      const categoryMissing = reqCats.length > 0;

      let notFoundMsg = "😔 No encontramos exactamente lo que buscas en este momento, ";
      if (colorMissing && categoryMissing) {
        notFoundMsg += `pero pronto tendremos ${reqCats.join(", ")} en ${directColors.join(" y ")} disponibles. ¡Síguenos para enterarte cuando lleguen!`;
      } else if (colorMissing) {
        notFoundMsg += `pero próximamente tendremos más opciones en ${directColors.join(" y ")}. ¡Vuelve pronto!`;
      } else if (categoryMissing) {
        notFoundMsg += `pero en breve agregaremos más ${reqCats.join(" y ")} al catálogo. ¡No te lo pierdas!`;
      } else {
        notFoundMsg += "pero nuestro catálogo se actualiza constantemente. ¡Intenta con otra prenda o vuelve pronto!";
      }

      return res.json({ reply: notFoundMsg, items: [], isOutfit: false });
    }

    const withColorMatch    = matchedProducts.filter((p) => p._colorMatch !== false);
    const withoutColorMatch = matchedProducts.filter((p) => p._colorMatch === false);

    if (wasOutfit) {
      const byCategory = {};

      for (const p of withColorMatch) {
        if (!byCategory[p.category] || p._score > byCategory[p.category]._score) {
          byCategory[p.category] = p;
        }
      }

      for (const p of withoutColorMatch) {
        if (!byCategory[p.category]) {
          byCategory[p.category] = { ...p, _isColorSubstitute: true };
        }
      }

      finalItems = Object.values(byCategory).map(({ _score, _colorMatch, _matchedColor, ...p }) => p);
    } else if (directColors.length >= 2) {
      const colorQtyMap  = extractColorQuantities(input);
      const hasExplicitQty = colorQtyMap.size > 0;

      const byColor = {};
      for (const p of withColorMatch) {
        const c = p._matchedColor || "other";
        if (!byColor[c]) byColor[c] = [];
        byColor[c].push(p);
      }
      for (const g of Object.values(byColor)) g.sort((a, b) => b._score - a._score);

      const perColorItems = [];

      if (hasExplicitQty) {
        for (const [color, qty] of colorQtyMap.entries()) {
          const group = byColor[color] || [];
          perColorItems.push(...group.slice(0, qty));
        }
      } else {
        const perColor = Math.max(1, Math.floor(6 / directColors.length));
        for (const color of directColors) {
          const normalizedColor = color.toLowerCase();
          const group = byColor[normalizedColor] || [];
          perColorItems.push(...group.slice(0, perColor));
        }
      }

      const needed  = Math.max(0, 4 - perColorItems.length);
      const fallback = withoutColorMatch.slice(0, needed);
      const allItems = [...perColorItems, ...fallback];
      finalItems = allItems.slice(0, 8).map(({ _score, _colorMatch, _matchedColor, ...p }) => p);
    } else {
      const primary   = withColorMatch.slice(0, 6).map(({ _score, _colorMatch, _matchedColor, ...p }) => p);
      const secondary = withoutColorMatch.slice(0, Math.max(0, 6 - primary.length))
                          .map(({ _score, _colorMatch, _matchedColor, ...p }) => p);
      finalItems = [...primary, ...secondary];
    }

    const missingColorCats = reqCats.filter((cat) =>
      directColors.length > 0 &&
      !finalItems.some((p) =>
        p.category?.toLowerCase().includes(cat.toLowerCase()) &&
        directColors.some((c) => (p.color || "").toLowerCase().includes(c.toLowerCase()))
      )
    );

    if (finalItems.length === 0) {
      return res.json({
        reply: "😔 No encontramos productos disponibles para esa búsqueda. Nuestro catálogo se actualiza constantemente, ¡vuelve pronto!",
        items: [],
        isOutfit: false,
      });
    }

    const productosParaMostrar = finalItems
      .map((p, i) => {
        const colorNote = p._isColorSubstitute && directColors.length > 0
          ? ` ⚠️ (no disponible en ${directColors.join("/")} — mejor opción disponible)`
          : "";
        return `${i + 1}. "${p.name}" — ${p.color} — $${p.price} (${p.category})${colorNote}`;
      })
      .join("\n");

    const missingNote = missingColorCats.length > 0
      ? `\nNOTA: No hay ${missingColorCats.join(", ")} en ${directColors.join("/")} disponibles. Menciona esto al usuario y dile que próximamente se añadirán.`
      : "";

    const contextHint = context
      ? `Contexto: el usuario quiere ropa para "${prompt}". Paleta ideal: ${context.colors.slice(0, 3).join(", ")}.`
      : "";

    const userMessageWithContext = `
El usuario preguntó: "${prompt}"
${contextHint}

Estos son los productos que SE VAN A MOSTRAR en pantalla (usa EXACTAMENTE estos nombres):
${productosParaMostrar}
${missingNote}

${wasOutfit
  ? "Describe brevemente cómo combinar estas prendas. Si algún producto está marcado con ⚠️, avisa al usuario que no tenemos esa categoría en el color exacto pero que el sustituto combina bien. Menciona cada producto por su nombre exacto."
  : "Recomienda estos productos por su nombre exacto, color y precio. Si alguno está marcado con ⚠️, avisa amablemente que no tenemos esa prenda en el color pedido pero que este es el más cercano disponible, y que pronto habrá más opciones."}
Sé entusiasta como un asesor de moda masculina. Máximo 3 párrafos cortos.
    `.trim();

    const completion = await openai.chat.completions.create({
      model:       "gpt-3.5-turbo",
      max_tokens:  350,
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content:
            "Eres un asesor de moda masculina de la tienda OUTF-AI. " +
            "REGLA CRÍTICA: SOLO menciona los productos que aparecen en la lista del usuario. " +
            "NUNCA inventes nombres de productos, colores ni precios que no estén en esa lista. " +
            "Si el usuario te da una lista de productos, úsalos exactamente como aparecen. " +
            "Cuando describes un outfit, explica cómo cada prenda de la lista combina con las demás. " +
            "CRÍTICO: Esta tienda vende ÚNICAMENTE ropa para hombre. NUNCA menciones ropa femenina. " +
            "Reglas por contexto: " +
            "• Playa / calor / verano → destaca que son prendas ligeras y frescas. " +
            "• Frío / invierno → destaca el abrigo y la calidez. " +
            "• Formal / trabajo → destaca la elegancia y profesionalismo. " +
            "• Gym / deporte → destaca la comodidad y funcionalidad. " +
            "Si no hay productos responde: 'No encontré resultados. Intenta pedirme un outfit o una prenda específica.' " +
            "Responde siempre en español.",
        },
        { role: "user", content: userMessageWithContext },
      ],
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "No encontré resultados. Intenta pedirme un outfit o una prenda específica.";

    const noResults = reply.toLowerCase().includes("no encontré resultados");

    res.json({
      reply,
      items:    noResults ? [] : finalItems,
      isOutfit: !noResults && wasOutfit,
    });

  } catch (error) {
    console.error("Error en ai.controller.js:", error.message);
    if (error.status === 401) {
      return res.status(500).json({ message: "Clave de OpenAI inválida. Verifica tu .env" });
    }
    if (error.status === 429 || error.code === "insufficient_quota") {
      return res.status(429).json({
        message: "Límite de OpenAI alcanzado. Intenta de nuevo en 1-2 minutos. 💭",
        items: [],
      });
    }
    res.status(500).json({
      message: "Error interno al procesar la recomendación. Inténtalo de nuevo. 🤖",
      items: [],
    });
  }
};