
const router            = require("express").Router();
const productController = require("../controllers/product.controller");
const auth              = require("../middlewares/auth.middleware");
const role              = require("../middlewares/role.middleware");

// ── Lectura: pública, no requiere token ───────────────────────────────────────
router.get("/",    productController.getProducts);
router.get("/:id", productController.getProductById);

// ── Escritura: requiere token + rol admin ─────────────────────────────────────
// auth verifica el JWT → role("admin") verifica el rol → llega al controlador
router.post(  "/",    auth, role("admin"), productController.createProduct);
router.put(   "/:id", auth, role("admin"), productController.updateProduct);
router.delete("/:id", auth, role("admin"), productController.deleteProduct);

module.exports = router;