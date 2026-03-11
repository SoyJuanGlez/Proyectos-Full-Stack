const Product = require("../models/product.model");

exports.getAll = async () => {
  return await Product.find();
};

exports.create = async (data) => {
  return await Product.create(data);
};