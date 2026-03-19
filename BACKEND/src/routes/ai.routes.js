const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Verifica que el nombre de la función coincida: getRecommendation
router.post("/recommend", authMiddleware, aiController.getRecommendation);

module.exports = router;