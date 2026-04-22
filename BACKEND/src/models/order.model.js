const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: Array,
  total: Number,
  status: { type: String, default: "pending" },
  paymentSessionId: { type: String, unique: true, sparse: true },
  paymentStatus: { type: String, default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
