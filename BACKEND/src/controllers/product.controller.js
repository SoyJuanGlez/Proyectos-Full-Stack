
const productService = require("../services/product.service");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await productService.getAll();
    res.json(products);
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await productService.getById(req.params.id);
    if (!product) return res.status(404).json({ message: "Producto no encontrado." });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const product = await productService.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await productService.update(req.params.id, req.body);
    if (!product) return res.status(404).json({ message: "Producto no encontrado." });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await productService.delete(req.params.id);
    if (!product) return res.status(404).json({ message: "Producto no encontrado." });
    res.json({ message: "Producto eliminado." });
  } catch (error) {
    next(error);
  }
};