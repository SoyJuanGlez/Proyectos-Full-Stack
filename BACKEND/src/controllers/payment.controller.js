const paymentService = require("../services/payment.service");

// Controlador HTTP para iniciar el checkout.
exports.createCheckoutSession = async (req, res) => {
  try {
    // El frontend envia req.body.items y el servicio arma la sesion de Stripe.
    const session = await paymentService.createCheckoutSession(req.body.items);
    res.status(201).json({
      id: session.id,
      url: session.url,
    });
  } catch (error) {
    // Algunos errores son culpa del request y deben responder 400.
    // El resto se considera problema interno o de integracion.
    const isBadRequest = [
      "El carrito esta vacio",
      "Hay productos invalidos en el carrito",
    ].includes(error.message);

    res.status(isBadRequest ? 400 : 500).json({
      message: error.message || "No se pudo iniciar el pago",
    });
  }
};

// Controlador HTTP para revisar el resultado de una sesion de pago.
exports.getCheckoutSession = async (req, res) => {
  try {
    const session = await paymentService.getCheckoutSession(req.params.sessionId);

    // Se devuelven solo los campos que el frontend necesita para confirmar el pago.
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
