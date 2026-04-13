const express = require("express");
const cors = require("cors");

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 API OutfAit funcionando correctamente");
});

app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/products", require("./src/routes/product.routes"));
app.use("/api/orders", require("./src/routes/order.routes"));
app.use("/api/outfit", require("./src/routes/outfit.routes"));
app.use("/api/ai", require("./src/routes/ai.routes"));
app.use("/api/payments", require("./src/routes/payment.routes"));

module.exports = app;
