const router = require("express").Router();
const paymentController = require("../controllers/payment.controller");

router.post("/checkout-session", paymentController.createCheckoutSession);
router.get("/checkout-session/:sessionId", paymentController.getCheckoutSession);

module.exports = router;
