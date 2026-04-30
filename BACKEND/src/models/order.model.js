const mongoose = require("mongoose");

// Modelo de orden de compra.
// Guarda el usuario que compro, los articulos, el total y el estado del pago.
const orderSchema = new mongoose.Schema({
  // Referencia al usuario que realizo la compra.
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // Se guarda como arreglo libre; aqui suele venir el snapshot del carrito comprado.
  items: Array,

  // Total de la orden.
  total: Number,

  // Estado operativo interno de la orden.
  status: { type: String, default: "pending" },

  // ID de la sesion de pago para evitar duplicados por reintentos.
  paymentSessionId: { type: String, unique: true, sparse: true },

  // Estado reportado por la plataforma de pago.
  paymentStatus: { type: String, default: "pending" }
}, { timestamps: true });

// Exportamos el modelo para consultas y escritura en MongoDB.
module.exports = mongoose.model("Order", orderSchema);
