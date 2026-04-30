const Product = require("../models/product.model");

// Procesa un prompt libre del usuario y lo convierte en filtros simples sobre productos.
// No usa un modelo de IA externo; la "inteligencia" aqui es una heuristica por palabras clave.
exports.getRecommendation = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Sin prompt no hay nada que interpretar.
    if (!prompt) {
      return res.status(400).json({ message: "El prompt es requerido" });
    }

    const input = prompt.toLowerCase();
    let matchQuery = {};

    // Traduce palabras del usuario a filtros de Mongo segun estilo, categoria o tipo.
    if (input.includes("formal") || input.includes("boda") || input.includes("elegante")) {
      matchQuery.category = "formal";
    } else if (input.includes("calle") || input.includes("urbano") || input.includes("aesthetic") || input.includes("oversized")) {
      matchQuery.style = "streetwear";
    } else if (input.includes("frÃ­o") || input.includes("invierno") || input.includes("chamarra")) {
      matchQuery.type = "abrigo";
    } else if (input.includes("deporte") || input.includes("gym") || input.includes("entrenar")) {
      matchQuery.category = "sport";
    } else if (input.includes("minimal") || input.includes("bÃ¡sico") || input.includes("sencillo")) {
      matchQuery.style = "minimalist";
    }

    // Busca hasta 3 productos al azar que cumplan el criterio.
    // $sample evita repetir siempre los mismos resultados.
    let items = await Product.aggregate([
      { $match: matchQuery },
      { $sample: { size: 3 } }
    ]);

    // Frases de respuesta para que la recomendacion no siempre suene igual.
    const intros = [
      "Â¡Claro! Checa estos artÃ­culos que combinan con lo que buscas:",
      "He analizado tu estilo y creo que esto te quedarÃ­a genial:",
      "Para ese plan, estos artÃ­culos de OUTF-AI son tendencia:",
      "Basado en tus gustos, aquÃ­ tienes unas opciones clave:"
    ];

    let reply = intros[Math.floor(Math.random() * intros.length)];

    // Si no hubo coincidencias, regresamos 3 productos generales para no dejar la respuesta vacia.
    if (items.length === 0) {
      reply = "No encontrÃ© algo exacto para esa descripciÃ³n, pero mira estos estilos que te podrÃ­an gustar:";
      items = await Product.aggregate([{ $sample: { size: 3 } }]);
    }

    // La respuesta contiene texto sugerido + productos candidatos.
    res.json({ reply, items });

  } catch (error) {
    // Log interno para depurar sin exponer el stack al cliente.
    console.error("Error en la recomendaciÃ³n de IA:", error);
    res.status(500).json({ message: "Error procesando la recomendaciÃ³n" });
  }
};
