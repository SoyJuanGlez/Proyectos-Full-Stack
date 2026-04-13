const paymentService = require("../services/payment.service");

exports.createCheckoutSession = async (req, res) => {
  try {
    const session = await paymentService.createCheckoutSession(req.body.items);
    res.status(201).json({
      id: session.id,
      url: session.url,
    });
  } catch (error) {
    const isBadRequest = [
      "El carrito esta vacio",
      "Hay productos invalidos en el carrito",
    ].includes(error.message);

    res.status(isBadRequest ? 400 : 500).json({
      message: error.message || "No se pudo iniciar el pago",
    });
  }
};

exports.getCheckoutSession = async (req, res) => {
  try {
    const session = await paymentService.getCheckoutSession(req.params.sessionId);
    res.json({
      id: session.id,
      payment_status: session.payment_status,
      status: session.status,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_email: session.customer_details?.email || null,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "No se pudo verificar el pago",
    });
  }
};
