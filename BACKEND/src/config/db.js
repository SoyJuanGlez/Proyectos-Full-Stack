const mongoose = require("mongoose");

// Conecta Mongoose con la base de datos definida en MONGO_URI.
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB conectado");
  } catch (error) {
    // Si la conexion falla, cerramos el proceso para no dejar la API en estado inconsistente.
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
