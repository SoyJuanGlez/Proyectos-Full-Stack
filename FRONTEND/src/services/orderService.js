import api from "./api";

export const getMyOrders = async () => {
  const res = await api.get("/orders/my");
  return res.data;
};

export const createOrder = async ({
  items,
  total,
  paymentSessionId,
  paymentStatus,
}) => {
  const res = await api.post("/orders", {
    items,
    total,
    paymentSessionId,
    paymentStatus,
  });
  return res.data;
};
