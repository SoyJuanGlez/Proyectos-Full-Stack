const express = require("express");
const cors = require("cors");

// Creamos la aplicacion principal de Express.
const app = express();

// Lista de frontends autorizados para consumir la API.
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

// Habilita peticiones CORS solo desde los origenes permitidos.
app.use(cors({
  origin: allowedOrigins
}));

// Permite que Express lea cuerpos JSON en las peticiones.
app.use(express.json());

// Ruta de prueba para confirmar que la API esta encendida.
app.get("/", (req, res) => {
  res.send("ðŸš€ API OutfAit funcionando correctamente");
});

// Montaje de rutas por modulo.
app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/products", require("./src/routes/product.routes"));
app.use("/api/orders", require("./src/routes/order.routes"));
app.use("/api/outfit", require("./src/routes/outfit.routes"));
app.use("/api/ai", require("./src/routes/ai.routes"));
app.use("/api/payments", require("./src/routes/payment.routes"));

// Exportamos la app para reutilizarla en server.js.
module.exports = app;
