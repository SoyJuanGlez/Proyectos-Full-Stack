const Product = require("../models/product.model");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const userRequests = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [userId, timestamp] of userRequests.entries()) {
    if (now - timestamp > 300000) { // 5 minutos
      userRequests.delete(userId);
    }
  }
}, 300000);

const CLOTHING_KEYWORDS = [
  "camisa", "camiseta", "playera", "blusa", "top",
  "pantalón", "pantalon", "jeans", "short", "falda", "vestido",
  "chamarra", "abrigo", "suéter", "sueter", "hoodie", "sudadera",
  "zapato", "tenis", "bota", "sandalia", "calzado",
  "ropa", "outfit", "look", "estilo", "prenda", "moda",
  "formal", "casual", "elegante", "sport", "gym",
  "color", "talla", "oversized", "streetwear", "aesthetic",
  "cita", "evento", "boda", "fiesta", "trabajo", "playa",
  "invierno", "verano", "frío", "calor",
  "negro", "blanco", "azul", "rojo", "verde", "gris", "beige",
];

const isClothingRelated = (text) => {
  const lower = text.toLowerCase();
  return CLOTHING_KEYWORDS.some((kw) => lower.includes(kw));
};

const findMatchingProducts = async (prompt) => {
  const input = prompt.toLowerCase();

  const categoryMap = {
    "camisa": "camisas", "camiseta": "camisetas", "playera": "camisetas",
    "pantalón": "pantalones", "pantalon": "pantalones", "jeans": "pantalones",
    "vestido": "vestidos", "falda": "faldas", "short": "shorts",
    "chamarra": "chamarras", "abrigo": "abrigos", "suéter": "suéteres",
    "sueter": "suéteres", "hoodie": "sudaderas", "sudadera": "sudaderas",
    "zapato": "zapatos", "tenis": "tenis", "bota": "botas", "sandalia": "sandalias",
  };

  const styleMap = {
    "formal": "formal", "elegante": "formal", "boda": "formal",
    "casual": "casual", "calle": "streetwear", "urbano": "streetwear",
    "aesthetic": "streetwear", "oversized": "oversized", "streetwear": "streetwear",
    "sport": "sport", "gym": "sport", "deporte": "sport",
    "minimal": "minimalist", "básico": "minimalist", "sencillo": "minimalist",
  };

  const colorMap = {
    "negro": "Negro", "negra": "Negro",
    "blanco": "Blanco", "blanca": "Blanco",
    "azul": "Azul", "rojo": "Rojo", "roja": "Rojo",
    "verde": "Verde", "gris": "Gris", "beige": "Beige",
    "café": "Café", "morado": "Morado", "rosa": "Rosa",
  };

  const orConditions = [];

  for (const [kw, val] of Object.entries(categoryMap)) {
    if (input.includes(kw)) {
      orConditions.push({ category: new RegExp(val, "i") });
      break;
    }
  }

  for (const [kw, val] of Object.entries(styleMap)) {
    if (input.includes(kw)) {
      orConditions.push({ style: new RegExp(val, "i") });
      break;
    }
  }

  for (const [kw, val] of Object.entries(colorMap)) {
    if (input.includes(kw)) {
      orConditions.push({ color: new RegExp(val, "i") });
      break;
    }
  }

  if (orConditions.length === 0) {
    return await Product.aggregate([{ $sample: { size: 3 } }]);
  }

  const matched = await Product.aggregate([
    { $match: { $or: orConditions } },
    { $sample: { size: 5 } }, 
  ]);

  if (matched.length === 0) {
    return await Product.aggregate([{ $sample: { size: 3 } }]);
  }

  return matched;
};

exports.getRecommendation = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user?.id || req.ip; 

    const now = Date.now();
    const lastRequest = userRequests.get(userId);
    if (lastRequest && (now - lastRequest) < 5000) {
      return res.status(429).json({
        message: "Espera un momento antes de hacer otra petición. ⏳",
        items: []
      });
    }
    userRequests.set(userId, now);

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ message: "El mensaje no puede estar vacío." });
    }

    if (!isClothingRelated(prompt)) {
      return res.json({
        reply: "No encontré resultados. Intenta pedirme un outfit o una prenda específica.",
        items: [],
      });
    }

    const matchedProducts = await findMatchingProducts(prompt);

    const catalogoTexto = matchedProducts
      .map(
        (p) =>
          `- ${p.name} | Categoría: ${p.category} | Estilo: ${p.style} | Color: ${p.color} | Precio: $${p.price} | Stock: ${p.stock}`
      )
      .join("\n");

    const userMessageWithContext = `
El usuario preguntó: "${prompt}"

Productos disponibles en el catálogo que podrían ser relevantes:
${catalogoTexto}

Con base en estos productos reales, recomiéndale al usuario los que mejor se adapten a lo que pidió. Menciona el nombre, color y precio. Sé entusiasta y natural, como un asesor de moda.
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 300, 
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente que recomienda ropa de una tienda online llamada OUTF-AI. " +
            "Solo sugiere productos que estén en el catálogo proporcionado. " +
            "Responde siempre en español, de forma amigable y directa. " +
            "Si el usuario pide algo fuera de contexto de ropa o productos, responde: " +
            "'No encontré resultados. Intenta pedirme un outfit o una prenda específica.'",
        },
        {
          role: "user",
          content: userMessageWithContext,
        },
      ],
    });

    const reply = completion.choices[0]?.message?.content?.trim()
      || "No encontré resultados. Intenta pedirme un outfit o una prenda específica.";

    const noResults = reply.toLowerCase().includes("no encontré resultados");

    res.json({
      reply,

      items: noResults ? [] : matchedProducts.slice(0, 3),
    });

  } catch (error) {
    console.error("Error en ai.controller.js:", error.message);

    if (error.status === 401) {
      return res.status(500).json({ message: "Clave de OpenAI inválida. Verifica tu .env" });
    }
    if (error.status === 429) {
      return res.status(429).json({
        message: "Límite de OpenAI alcanzado. Intenta de nuevo en 1-2 minutos. 💭",
        items: []
      });
    }
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({
        message: "Has alcanzado el límite de tu cuenta de OpenAI. Revisa tu plan de uso. 💳",
        items: []
      });
    }

    res.status(500).json({
      message: "Error interno al procesar la recomendación. Inténtalo de nuevo. 🤖",
      items: []
    });
  }
};