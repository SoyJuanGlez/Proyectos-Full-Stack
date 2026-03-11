const Product = require("../models/product.model");

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

  return { top, bottom, shoes };
};