const axios = require("axios");

const STRIPE_API_BASE = "https://api.stripe.com/v1";
const DEFAULT_FRONTEND_URL = "http://localhost:5173";
const DEFAULT_CURRENCY = "mxn";

const getStripeSecretKey = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY no esta configurada");
  }

  return secretKey;
};

const buildStripeHeaders = () => ({
  Authorization: `Bearer ${getStripeSecretKey()}`,
  "Content-Type": "application/x-www-form-urlencoded",
});

const getFrontendUrl = () => process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;

const isValidImageUrl = (value) => /^https?:\/\//i.test(value || "");

exports.createCheckoutSession = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("El carrito esta vacio");
  }

  const params = new URLSearchParams();
  const frontendUrl = getFrontendUrl();

  params.append("mode", "payment");
  params.append("success_url", `${frontendUrl}/cart?payment=success&session_id={CHECKOUT_SESSION_ID}`);
  params.append("cancel_url", `${frontendUrl}/cart?payment=cancelled`);

  items.forEach((item, index) => {
    const unitAmount = Math.round(Number(item.price || 0) * 100);
    const quantity = Math.max(1, Number(item.quantity || 1));

    if (!item.name || unitAmount <= 0) {
      throw new Error("Hay productos invalidos en el carrito");
    }

    params.append(`line_items[${index}][price_data][currency]`, DEFAULT_CURRENCY);
    params.append(`line_items[${index}][price_data][product_data][name]`, item.name);

    if (isValidImageUrl(item.image)) {
      params.append(`line_items[${index}][price_data][product_data][images][0]`, item.image);
    }

    params.append(`line_items[${index}][price_data][unit_amount]`, String(unitAmount));
    params.append(`line_items[${index}][quantity]`, String(quantity));
  });

  const response = await axios.post(
    `${STRIPE_API_BASE}/checkout/sessions`,
    params.toString(),
    { headers: buildStripeHeaders() }
  );

  return response.data;
};

exports.getCheckoutSession = async (sessionId) => {
  if (!sessionId) {
    throw new Error("El session_id es requerido");
  }

  const response = await axios.get(
    `${STRIPE_API_BASE}/checkout/sessions/${sessionId}`,
    { headers: { Authorization: `Bearer ${getStripeSecretKey()}` } }
  );

  return response.data;
};
