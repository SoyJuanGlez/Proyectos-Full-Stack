const Product = require("../models/product.model");

exports.getAll = async () => {
  return await Product.find();
};

exports.create = async (data) => {
  return await Product.create(data);
};

exports.update = async (id, data) => {
  return await Product.findByIdAndUpdate(id, data, { new: true });
};

exports.delete = async (id) => {
  return await Product.findByIdAndDelete(id);
};