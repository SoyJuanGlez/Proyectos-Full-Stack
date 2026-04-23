
const Order = require("../models/order.model");

// ── Verifica que req.user sea el dueño de la orden ───────────────────────────
// Debe usarse DESPUÉS de auth.middleware (que pone req.user) y validateOrderId.
// Si el usuario es admin, se salta la verificación y pasa directo.
module.exports = async (req, res, next) => {
  try {
    // Los administradores tienen acceso total a cualquier orden
    if (req.user?.role === "admin") return next();

    const order = await Order.findById(req.params.id).lean();

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada." });
    }

    // Comparamos como strings para evitar problemas de tipo ObjectId vs string
    if (order.user.toString() !== req.user.id.toString()) {
      // 403 y no 404: el recurso existe pero no tienes permiso
      return res.status(403).json({ message: "No tienes permiso para acceder a esta orden." });
    }

    // Guardamos la orden en req para no hacer una segunda consulta en el controlador
    req.order = order;
    next();
  } catch (error) {
    console.error("ownership.middleware error:", error.message);
    res.status(500).json({ message: "Error verificando propiedad de la orden." });
  }
};