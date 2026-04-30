const router = require("express").Router();
const paymentController = require("../controllers/payment.controller");

// Crea una sesion de checkout en Stripe o una sesion simulada si esta activo el modo demo.
router.post("/checkout-session", paymentController.createCheckoutSession);

// Consulta el estado de una sesion de checkout ya creada.
router.get("/checkout-session/:sessionId", paymentController.getCheckoutSession);

module.exports = router;
