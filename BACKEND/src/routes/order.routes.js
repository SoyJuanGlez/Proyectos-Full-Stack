const router = require("express").Router();
const Order = require("../models/order.model");
const auth = require("../middlewares/auth.middleware");

router.post("/", auth, async (req, res) => {
  const order = await Order.create({
    user: req.user.id,
    items: req.body.items,
    total: req.body.total
  });

  res.json(order);
});

module.exports = router;