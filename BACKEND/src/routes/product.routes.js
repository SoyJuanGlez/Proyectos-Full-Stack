const router = require("express").Router();
const productController = require("../controllers/product.controller");

router.get("/", productController.getProducts);
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;