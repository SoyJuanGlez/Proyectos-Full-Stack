const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  category: String,
  style: String,
  color: String,
  stock: Number
});

module.exports = mongoose.model("Product", productSchema);