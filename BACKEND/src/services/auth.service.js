const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // <--- Importante instalar esta librería

exports.register = async (data) => {
  const hashed = await bcrypt.hash(data.password, 10);
  return await User.create({
    name: data.name,
    email: data.email,
    password: hashed,
    role: data.role || "user" // Evita errores si el esquema pide role
  });
};

exports.login = async (email, password) => {
  // 1. Buscar al usuario
  const user = await User.findOne({ email });
  if (!user) throw new Error("Usuario no encontrado");

  // 2. Comparar contraseñas
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Credenciales inválidas");

  // 3. GENERAR EL TOKEN (Esto evita el error 500 en el flujo)
  // Usa una palabra secreta para firmar el token
  const token = jwt.sign(
    { id: user._id, role: user.role || "user" },
    "mi_llave_secreta_provisional", 
    { expiresIn: "24h" }
  );

  // 4. Retornar el objeto COMPLETO que espera tu Frontend
  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "user"
    }
  };
};