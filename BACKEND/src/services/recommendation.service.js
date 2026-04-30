const Product = require("../models/product.model");

// Genera un outfit simple buscando una prenda superior, una inferior y unos zapatos
// que compartan el estilo pedido por el usuario.
exports.generateOutfit = async (preferences) => {
  const top = await Product.findOne({
    category: "top",
    style: preferences.style
  });

  const bottom = await Product.findOne({
    category: "bottom",
    style: preferences.style
  });

  const shoes = await Product.findOne({
    category: "shoes",
    style: preferences.style
  });

  // La respuesta ya viene separada por tipo de prenda para facilitar el render en frontend.
  return { top, bottom, shoes };
};
