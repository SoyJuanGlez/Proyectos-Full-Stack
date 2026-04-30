require("dotenv").config();
const app = require("./app");
const connectDB = require("./src/config/db");

// Puerto del servidor. Si no existe en .env, se usa 5000 por defecto.
const PORT = process.env.PORT || 5000;

// Abre la conexion con MongoDB antes de empezar a recibir peticiones.
connectDB();

// Inicia el servidor HTTP de Express.
app.listen(PORT, () => {
  console.log(`ðŸš€ Servidor corriendo en: http://localhost:${PORT}`);
});
