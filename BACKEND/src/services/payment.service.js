const axios = require("axios");

// Configuracion base para hablar con la API REST de Stripe.
const STRIPE_API_BASE = "https://api.stripe.com/v1";
const DEFAULT_FRONTEND_URL = "http://localhost:5173";
const DEFAULT_CURRENCY = "mxn";
const MOCK_SESSION_PREFIX = "mock_session_";

// Recupera la secret key de Stripe desde variables de entorno.
const getStripeSecretKey = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY no esta configurada");
  }

  return secretKey;
};

// Headers comunes para peticiones a Stripe con contenido form-urlencoded.
const buildStripeHeaders = () => ({
  Authorization: `Bearer ${getStripeSecretKey()}`,
  "Content-Type": "application/x-www-form-urlencoded",
});

// URL del frontend usada para redirects post-pago.
const getFrontendUrl = () => process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;

// Modo demo: simula cobros sin tocar la API real de Stripe.
const isDemoMode = () => process.env.STRIPE_DEMO_MODE === "true";

// Stripe solo acepta URLs publicas validas para imagenes del checkout.
const isValidImageUrl = (value) => /^https?:\/\//i.test(value || "");

// Genera una sesion falsa para desarrollo o demo sin credenciales reales.
const buildMockSession = (items = []) => {
  const sessionId = `${MOCK_SESSION_PREFIX}${Date.now()}`;

  // Stripe trabaja en centavos; por eso se multiplica por 100.
  const amountTotal = items.reduce((sum, item) => {
    return sum + Math.round(Number(item.price || 0) * 100) * Math.max(1, Number(item.quantity || 1));
  }, 0);

  return {
    id: sessionId,
    url: `${getFrontendUrl()}/checkout-demo?session_id=${sessionId}`,
    payment_status: "paid",
    status: "complete",
    amount_total: amountTotal,
    currency: DEFAULT_CURRENCY,
    customer_details: null,
  };
};

// Crea una sesion de checkout:
// - valida el carrito
// - construye line_items para Stripe
// - devuelve la sesion creada
exports.createCheckoutSession = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("El carrito esta vacio");
  }

  // Si estamos en demo, no llamamos a Stripe y devolvemos una respuesta simulada.
  if (isDemoMode()) {
    return buildMockSession(items);
  }

  const params = new URLSearchParams();
  const frontendUrl = getFrontendUrl();

  // Configura tipo de checkout y paginas de exito/cancelacion.
  params.append("mode", "payment");
  params.append("success_url", `${frontendUrl}/cart?payment=success&session_id={CHECKOUT_SESSION_ID}`);
  params.append("cancel_url", `${frontendUrl}/cart?payment=cancelled`);

  items.forEach((item, index) => {
    // Convierte el precio a centavos y fuerza una cantidad minima de 1.
    const unitAmount = Math.round(Number(item.price || 0) * 100);
    const quantity = Math.max(1, Number(item.quantity || 1));

    // Cada linea debe tener al menos nombre y precio valido.
    if (!item.name || unitAmount <= 0) {
      throw new Error("Hay productos invalidos en el carrito");
    }

    // Armado del esquema que Stripe espera para cada articulo.
    params.append(`line_items[${index}][price_data][currency]`, DEFAULT_CURRENCY);
    params.append(`line_items[${index}][price_data][product_data][name]`, item.name);

    if (isValidImageUrl(item.image)) {
      params.append(`line_items[${index}][price_data][product_data][images][0]`, item.image);
    }

    params.append(`line_items[${index}][price_data][unit_amount]`, String(unitAmount));
    params.append(`line_items[${index}][quantity]`, String(quantity));
  });

  // Llamada real a Stripe para crear la sesion.
  const response = await axios.post(
    `${STRIPE_API_BASE}/checkout/sessions`,
    params.toString(),
    { headers: buildStripeHeaders() }
  );

  return response.data;
};

// Consulta una sesion existente para conocer el estado del pago.
exports.getCheckoutSession = async (sessionId) => {
  if (!sessionId) {
    throw new Error("El session_id es requerido");
  }

  // Si la sesion es mock, devolvemos una respuesta estandar compatible con el frontend.
  if (sessionId.startsWith(MOCK_SESSION_PREFIX)) {
    return {
      id: sessionId,
      payment_status: "paid",
      status: "complete",
      amount_total: 0,
      currency: DEFAULT_CURRENCY,
      customer_details: null,
    };
  }

  // Consulta directa a Stripe para recuperar detalles de la sesion.
  const response = await axios.get(
    `${STRIPE_API_BASE}/checkout/sessions/${sessionId}`,
    { headers: { Authorization: `Bearer ${getStripeSecretKey()}` } }
  );

  return response.data;
};
