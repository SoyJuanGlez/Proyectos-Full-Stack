const Product = require("../models/product.model");

exports.getRecommendation = async (req, res) => {
  try {
    const { prompt } = req.body;
    const input = prompt.toLowerCase();

    // 1. Lógica de "IA" simplificada (Búsqueda semántica básica)
    let query = {};
    if (input.includes("formal") || input.includes("boda")) {
      query = { category: "formal" };
    } else if (input.includes("calle") || input.includes("urbano") || input.includes("aesthetic")) {
      query = { style: "streetwear" };
    } else if (input.includes("frío") || input.includes("invierno")) {
      query = { type: "abrigo" };
    }

    // 2. Buscar artículos reales en tu MongoDB
    const items = await Product.find(query).limit(3);

    // 3. Construir respuesta amigable
    let reply = "Basado en lo que me cuentas, estos artículos te ayudarían a armar ese look:";
    if (items.length === 0) {
      reply = "Aún no tengo algo exacto para eso, pero mira estos estilos similares que te podrían gustar.";
    }

    res.json({ reply, items });
  } catch (error) {
    res.status(500).json({ message: "Error procesando recomendación" });
  }
};