const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Endpoint protegido que genera una recomendacion a partir de un prompt del usuario.
router.post("/recommend", authMiddleware, aiController.getRecommendation);

module.exports = router;
