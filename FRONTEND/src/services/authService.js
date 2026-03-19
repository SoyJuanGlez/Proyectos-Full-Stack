import api, { setAuthToken } from "./api";

export const login = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  const { token, user } = res.data;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  setAuthToken(token);
  return user;
};

export const register = async (name, email, password, role = "user") => {
  const res = await api.post("/auth/register", { name, email, password, role });
  return res.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setAuthToken(null);
};

export const getCurrentUser = () => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
};

// Pre-cargar Token al iniciar app
const existingToken = localStorage.getItem("token");
if (existingToken) setAuthToken(existingToken);
