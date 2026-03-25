import api from "./api";

export const getMyOrders = async () => {
  const res = await api.get("/orders/my");
  return res.data;
};

export const createOrder = async (items, total) => {
  const res = await api.post("/orders", { items, total });
  return res.data;
};