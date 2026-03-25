const router = require("express").Router();
const Order = require("../models/order.model");
const auth = require("../middlewares/auth.middleware");

// Crear orden
router.post("/", auth, async (req, res) => {
  const order = await Order.create({
    user: req.user.id,
    items: req.body.items,
    total: req.body.total
  });
  res.json(order);
});

// Obtener órdenes del usuario autenticado
router.get("/my", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo órdenes" });
  }
});

module.exports = router;