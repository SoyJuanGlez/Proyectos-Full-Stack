const router = require("express").Router();
const productService = require("../services/product.service");

router.get("/", async (req, res) => {
  const products = await productService.getAll();
  res.json(products);
});

router.post("/", async (req, res) => {
  const product = await productService.create(req.body);
  res.json(product);
});

module.exports = router;