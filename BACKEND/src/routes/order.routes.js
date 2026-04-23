
const router = require("express").Router();
const Order  = require("../models/order.model");
const auth   = require("../middlewares/auth.middleware");
const role   = require("../middlewares/role.middleware");
const { validateCreateOrder, validateOrderId } = require("../middlewares/validate.middleware");
const ownsOrder = require("../middlewares/ownership.middleware");
const { createOrderLimiter, readOrderLimiter } = require("../middlewares/rateLimit.middleware");

// ── POST / — Crear orden ─────────────────────────────────────────────────────
// 1. auth          : verifica JWT y pone req.user
// 2. createOrderLimiter : máx 10 creaciones/min por usuario
// 3. validateCreateOrder: valida y sanitiza el body
router.post(
  "/",
  auth,
  createOrderLimiter,
  validateCreateOrder,
  async (req, res, next) => {
    try {
      const {
        items,
        total,
        paymentSessionId,
        paymentStatus = "pending",
      } = req.body;

      // Idempotencia: si ya existe una orden con este paymentSessionId, la devolvemos
      if (paymentSessionId) {
        const existing = await Order.findOne({
          paymentSessionId,
          user: req.user.id,
        });
        if (existing) return res.json(existing);
      }

      const order = await Order.create({
        user: req.user.id,         // Siempre tomamos el ID del token, nunca del body
        items,
        total,
        status: paymentStatus === "paid" ? "processing" : "pending",
        paymentSessionId,
        paymentStatus,
      });

      res.status(201).json(order);
    } catch (error) {
      // Duplicate key de paymentSessionId (race condition entre dos requests)
      if (error.code === 11000 && req.body.paymentSessionId) {
        const existing = await Order.findOne({
          paymentSessionId: req.body.paymentSessionId,
          user: req.user.id,
        }).catch(() => null);
        if (existing) return res.json(existing);
      }
      next(error); // Delegamos al error.middleware
    }
  }
);

// ── GET /my — Órdenes del usuario autenticado ─────────────────────────────────
// Solo devuelve las órdenes que pertenecen al usuario del token (req.user.id)
router.get(
  "/my",
  auth,
  readOrderLimiter,
  async (req, res, next) => {
    try {
      const orders = await Order
        .find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .lean();        // .lean() es más rápido para lectura pura

      res.json(orders);
    } catch (error) {
      next(error);
    }
  }
);

// ── GET /:id — Detalle de una orden específica ────────────────────────────────
// ownsOrder verifica que req.user.id === order.user (admins se saltan esto)
router.get(
  "/:id",
  auth,
  readOrderLimiter,
  validateOrderId,    // Rechaza IDs malformados antes de consultar la BD
  ownsOrder,          // 403 si el usuario no es el dueño (ni admin)
  (req, res) => {
    // ownsOrder ya encontró la orden y la guardó en req.order
    res.json(req.order);
  }
);

// ── PATCH /:id/cancel — Cancelar una orden ────────────────────────────────────
// Solo se puede cancelar si el status actual es "pending"
router.patch(
  "/:id/cancel",
  auth,
  validateOrderId,
  ownsOrder,
  async (req, res, next) => {
    try {
      const order = req.order; // Ya cargada por ownsOrder

      if (order.status !== "pending") {
        return res.status(409).json({
          message: `No se puede cancelar una orden con estado '${order.status}'.`,
        });
      }

      const updated = await Order.findByIdAndUpdate(
        order._id,
        { status: "cancelled" },
        { new: true }
      );

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);

// ── GET / — Todas las órdenes (solo admin) ────────────────────────────────────
// Paginación básica con ?page=1&limit=20
router.get(
  "/",
  auth,
  role("admin"),      // 403 si no es admin
  readOrderLimiter,
  async (req, res, next) => {
    try {
      const page  = Math.max(1, parseInt(req.query.page)  || 1);
      const limit = Math.min(100, parseInt(req.query.limit) || 20); // máx 100 por página
      const skip  = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Order.countDocuments(),
      ]);

      res.json({
        data: orders,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;