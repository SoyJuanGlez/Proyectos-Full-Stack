
module.exports = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Siempre logueamos el error completo en el servidor
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} →`, err);

  // ── Errores de Mongoose ───────────────────────────────────────────────────
  // CastError: ID de Mongo con formato incorrecto
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({ message: "ID con formato inválido." });
  }

  // ValidationError de Mongoose (campos requeridos, enums, etc.)
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({ message: "Error de validación.", errors });
  }

  // Duplicate key (índice único violado, e.g. paymentSessionId repetido)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "campo";
    return res.status(409).json({
      message: `El valor de '${field}' ya existe. No se permiten duplicados.`,
    });
  }

  // ── Errores de JWT ────────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Token inválido." });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expirado. Inicia sesión de nuevo." });
  }

  // ── Errores con statusCode explícito ─────────────────────────────────────
  const status = err.statusCode || err.status;
  if (status && status >= 400 && status < 600) {
    return res.status(status).json({ message: err.message || "Error en la solicitud." });
  }

  // ── Error genérico / inesperado ───────────────────────────────────────────
  // En producción no exponemos el stack trace
  const isDev = process.env.NODE_ENV !== "production";
  res.status(500).json({
    message: "Error interno del servidor.",
    ...(isDev && { detail: err.message, stack: err.stack }),
  });
};