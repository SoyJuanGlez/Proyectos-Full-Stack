const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Clave usada para firmar los tokens de sesion.
const JWT_SECRET = process.env.JWT_SECRET || "mi_llave_secreta_provisional";

// Registra un nuevo usuario.
// Antes de guardar, convierte la password en un hash seguro.
exports.register = async (data) => {
  const hashed = await bcrypt.hash(data.password, 10);
  return await User.create({
    name: data.name,
    email: data.email,
    password: hashed,
    // Si no se envia rol, se crea como usuario normal.
    role: data.role || "user"
  });
};

// Inicia sesion:
// 1. Busca al usuario por email.
// 2. Compara la password en texto plano contra el hash.
// 3. Genera un JWT que el frontend usara en peticiones protegidas.
exports.login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Usuario no encontrado");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Credenciales invÃ¡lidas");

  // El payload incluye el id y el rol, necesarios para auth y autorizacion.
  const token = jwt.sign(
    { id: user._id, role: user.role || "user" },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  // Se devuelve la estructura que normalmente espera el frontend tras el login.
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
