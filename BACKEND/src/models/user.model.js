const mongoose = require("mongoose");

// Modelo de usuario.
const userSchema = new mongoose.Schema({
  // Nombre del usuario.
  name: String,
  // Correo unico para login.
  email: { type: String, unique: true },
  // Password ya hasheado antes de guardarse.
  password: String,
  // Rol basico para control de permisos.
  role: { type: String, default: "user" }
});

module.exports = mongoose.model("User", userSchema);
