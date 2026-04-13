import api from "./api";

export const createCheckoutSession = async (items) => {
  const res = await api.post("/payments/checkout-session", { items });
  return res.data;
};

export const getCheckoutSession = async (sessionId) => {
  const res = await api.get(`/payments/checkout-session/${sessionId}`);
  return res.data;
};
