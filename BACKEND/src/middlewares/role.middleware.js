// Middleware de autorizacion por rol.
// Se usa despues del middleware de auth, porque depende de req.user.
module.exports = (requiredRole) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autorizado" });
  }

  // Solo deja pasar a usuarios con el rol exacto solicitado.
  if (req.user.role !== requiredRole) {
    return res.status(403).json({ message: "Debe ser administrador" });
  }

  next();
};
