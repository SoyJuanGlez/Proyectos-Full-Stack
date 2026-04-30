// Controlador alterno para buscar outfits por estilo y color.
const Product = require("../models/Product");

// Busca productos que cumplan simultaneamente con el estilo y color enviados.
exports.generateOutfit = async (req, res) => {
  try {
    const { style, color } = req.body;

    const products = await Product.find({
      style,
      color
    });

    // Devuelve todos los productos coincidentes sin agrupar por categoria.
    res.json(products);

  } catch (error) {
    res.status(500).json({ message: "Error generando outfit" });
  }
};
