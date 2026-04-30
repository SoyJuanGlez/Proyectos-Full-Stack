const jwt = require("jsonwebtoken");

// Clave usada para validar los JWT del cliente.
// Si no existe una variable de entorno, se usa una provisional para desarrollo.
const JWT_SECRET = process.env.JWT_SECRET || "mi_llave_secreta_provisional";

// Middleware de autenticacion:
// 1. Lee el header Authorization.
// 2. Extrae el token Bearer.
// 3. Valida el token.
// 4. Inyecta los datos basicos del usuario en req.user.
module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    // Si no hay token, se corta la peticion antes de llegar al controlador.
    if (!token) {
      return res.status(401).json({ message: "Token requerido" });
    }

    // jwt.verify valida la firma y tambien revisa si el token expiro.
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role || "user",
    };

    // Si todo sale bien, pasamos el control al siguiente middleware o ruta.
    next();
  } catch (error) {
    // Cualquier fallo en la validacion se trata como acceso no autorizado.
    return res.status(401).json({ message: "Token invalido o expirado" });
  }
};
