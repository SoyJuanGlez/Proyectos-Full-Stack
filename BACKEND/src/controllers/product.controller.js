const productService = require("../services/product.service");

exports.getProducts = async (req, res) => {
  try {
    const products = await productService.getAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo productos" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await productService.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error creando producto" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await productService.update(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error actualizando producto" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await productService.delete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando producto" });
  }
};