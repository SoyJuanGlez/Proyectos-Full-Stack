const Product = require("../models/product.model");

exports.getRecommendation = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: "El prompt es requerido" });
    }

    const input = prompt.toLowerCase();
    let matchQuery = {};

    // 1. Lógica de "IA" con más palabras clave para OUTF-AI
    if (input.includes("formal") || input.includes("boda") || input.includes("elegante")) {
      matchQuery.category = "formal";
    } else if (input.includes("calle") || input.includes("urbano") || input.includes("aesthetic") || input.includes("oversized")) {
      matchQuery.style = "streetwear";
    } else if (input.includes("frío") || input.includes("invierno") || input.includes("chamarra")) {
      matchQuery.type = "abrigo";
    } else if (input.includes("deporte") || input.includes("gym") || input.includes("entrenar")) {
      matchQuery.category = "sport";
    } else if (input.includes("minimal") || input.includes("básico") || input.includes("sencillo")) {
      matchQuery.style = "minimalist";
    }

    // 2. Búsqueda Aleatoria mediante Agregación
    // Esto evita que siempre salgan los mismos 3 productos
    let items = await Product.aggregate([
      { $match: matchQuery },
      { $sample: { size: 3 } }
    ]);

    // 3. Respuesta Dinámica
    const intros = [
      "¡Claro! Checa estos artículos que combinan con lo que buscas:",
      "He analizado tu estilo y creo que esto te quedaría genial:",
      "Para ese plan, estos artículos de OUTF-AI son tendencia:",
      "Basado en tus gustos, aquí tienes unas opciones clave:"
    ];

    let reply = intros[Math.floor(Math.random() * intros.length)];

    // Si no hay resultados para la búsqueda específica, enviamos 3 aleatorios generales
    if (items.length === 0) {
      reply = "No encontré algo exacto para esa descripción, pero mira estos estilos que te podrían gustar:";
      items = await Product.aggregate([{ $sample: { size: 3 } }]);
    }

    res.json({ reply, items });

  } catch (error) {
    console.error("Error en la recomendación de IA:", error);
    res.status(500).json({ message: "Error procesando la recomendación" });
  }
};