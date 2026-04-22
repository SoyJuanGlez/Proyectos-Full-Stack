const router = require("express").Router();
const Order = require("../models/order.model");
const auth = require("../middlewares/auth.middleware");

// Crear orden
router.post("/", auth, async (req, res) => {
  try {
    const {
      items = [],
      total = 0,
      paymentSessionId,
      paymentStatus = "pending",
    } = req.body;

    if (paymentSessionId) {
      const existingOrder = await Order.findOne({
        paymentSessionId,
        user: req.user.id,
      });

      if (existingOrder) {
        return res.json(existingOrder);
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "La orden debe incluir productos" });
    }

    const order = await Order.create({
      user: req.user.id,
      items,
      total,
      status: paymentStatus === "paid" ? "processing" : "pending",
      paymentSessionId,
      paymentStatus,
    });

    res.status(201).json(order);
  } catch (error) {
    if (error.code === 11000 && req.body.paymentSessionId) {
      const existingOrder = await Order.findOne({
        paymentSessionId: req.body.paymentSessionId,
        user: req.user.id,
      });

      if (existingOrder) {
        return res.json(existingOrder);
      }
    }

    res.status(500).json({ message: "Error creando orden" });
  }
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
