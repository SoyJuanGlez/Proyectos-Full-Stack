
const User      = require("../models/user.model");
const bcrypt    = require("bcryptjs");
const jwt       = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "mi_llave_secreta_provisional";

// ── Registro ──────────────────────────────────────────────────────────────────
exports.register = async (data) => {
  // Verificar si el email ya existe
  const exists = await User.findOne({ email: data.email?.toLowerCase() });
  if (exists) throw new Error("El email ya está registrado.");

  const hashed = await bcrypt.hash(data.password, 10);

  // NUNCA tomamos data.role del body — siempre "user"
  const user = await User.create({
    name:     data.name,
    email:    data.email,
    password: hashed,
    role:     "user",   // fijo, ignoramos cualquier role que venga del body
  });

  return {
    id:    user._id,
    name:  user.name,
    email: user.email,
    role:  user.role,
  };
};

// ── Login ─────────────────────────────────────────────────────────────────────
exports.login = async (email, password) => {
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user) throw new Error("Credenciales inválidas.");  // mensaje genérico (no revelar si existe el email)

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Credenciales inválidas.");

  // El token incluye el rol — así los middlewares pueden leerlo sin consultar la BD
  const token = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  return {
    token,
    user: {
      id:    user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,   // el frontend puede usarlo para mostrar/ocultar opciones de admin
    },
  };
};