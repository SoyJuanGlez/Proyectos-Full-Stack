const router = require("express").Router();
const recommendation = require("../services/recommendation.service");

// Genera una recomendacion sencilla de outfit a partir de preferencias.
router.post("/generate", async (req, res) => {
  const outfit = await recommendation.generateOutfit(req.body);
  res.json(outfit);
});

module.exports = router;
