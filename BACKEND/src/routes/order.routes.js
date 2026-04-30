const router = require("express").Router();
const Order = require("../models/order.model");
const auth = require("../middlewares/auth.middleware");

// Crear una orden para el usuario autenticado.
// Esta ruta trabaja directo con el modelo en vez de pasar por un servicio/controlador.
router.post("/", auth, async (req, res) => {
  try {
    const {
      items = [],
      total = 0,
      paymentSessionId,
      paymentStatus = "pending",
    } = req.body;

    // Si llega una sesion de pago ya usada por este usuario, devolvemos la orden existente
    // para evitar duplicar compras por refresh o reintentos del frontend.
    if (paymentSessionId) {
      const existingOrder = await Order.findOne({
        paymentSessionId,
        user: req.user.id,
      });

      if (existingOrder) {
        return res.json(existingOrder);
      }
    }

    // Una orden sin productos no tiene sentido de negocio.
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "La orden debe incluir productos" });
    }

    // Se crea la orden asociada al usuario autenticado.
    // Si el pago ya esta marcado como paid, la orden avanza a processing.
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
    // Si Stripe o el frontend intentan crear dos veces la misma orden con igual session ID,
    // Mongo lanza un error por el indice unique. Aqui recuperamos la orden ya creada.
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

// Obtener el historial de ordenes del usuario autenticado.
// Se ordena de la mas reciente a la mas antigua.
router.get("/my", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo Ã³rdenes" });
  }
});

module.exports = router;
