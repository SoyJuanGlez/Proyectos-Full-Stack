const Product = require("../models/product.model");

// Obtiene todo el catalogo.
exports.getAll = async () => {
  return await Product.find();
};

// Crea un producto nuevo.
exports.create = async (data) => {
  return await Product.create(data);
};

// Actualiza un producto por ID y devuelve la version nueva.
exports.update = async (id, data) => {
  return await Product.findByIdAndUpdate(id, data, { new: true });
};

// Elimina un producto por ID.
exports.delete = async (id) => {
  return await Product.findByIdAndDelete(id);
};
