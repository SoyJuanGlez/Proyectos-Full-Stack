const express        = require("express");
const router         = express.Router();
const aiController   = require("../controllers/ai.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/recommend", authMiddleware, aiController.getRecommendation);
router.get("/suggestions", (req, res) => {
  res.json(aiController.CHAT_SUGGESTIONS);
});

module.exports = router;