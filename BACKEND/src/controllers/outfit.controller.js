const Product = require("../models/Product");

exports.generateOutfit = async (req, res) => {
  try {
    const { style, color } = req.body;

    const products = await Product.find({
      style,
      color
    });

    res.json(products);

  } catch (error) {
    res.status(500).json({ message: "Error generando outfit" });
  }
};