// Controlador alterno para ordenes.
// Recibe un payload y lo persiste tal cual en MongoDB.
const Order = require("../models/Order");

// Crea una nueva orden.
exports.createOrder = async (req, res) => {
  try {
    // Se construye el documento directamente desde req.body.
    const order = new Order(req.body);
    const saved = await order.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Error creando orden" });
  }
};
