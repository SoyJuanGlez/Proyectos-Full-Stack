
// Mapa en memoria: clave → lista de timestamps de solicitudes recientes
const requestLog = new Map();

// Limpia entradas antiguas cada 10 minutos para no acumular memoria
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of requestLog.entries()) {
    const recent = timestamps.filter((t) => now - t < 15 * 60 * 1000);
    if (recent.length === 0) {
      requestLog.delete(key);
    } else {
      requestLog.set(key, recent);
    }
  }
}, 10 * 60 * 1000);

// ── Fábrica de middleware de rate limit ──────────────────────────────────────
// windowMs  : ventana de tiempo en ms
// maxRequests: máximo de peticiones permitidas en esa ventana
// message   : mensaje de error personalizable
const createRateLimiter = ({ windowMs, maxRequests, message }) =>
  (req, res, next) => {
    // Usamos el ID del usuario autenticado si existe, sino la IP
    const key = req.user?.id
      ? `user:${req.user.id}`
      : `ip:${req.ip}`;

    const now = Date.now();
    const windowStart = now - windowMs;

    // Filtramos solo los timestamps dentro de la ventana actual
    const timestamps = (requestLog.get(key) || []).filter((t) => t > windowStart);
    timestamps.push(now);
    requestLog.set(key, timestamps);

    // Cabeceras informativas (útiles para el frontend o herramientas de monitoreo)
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - timestamps.length));
    res.setHeader("X-RateLimit-Reset", Math.ceil((windowStart + windowMs) / 1000));

    if (timestamps.length > maxRequests) {
      return res.status(429).json({ message });
    }

    next();
  };

// ── Límites específicos por operación ────────────────────────────────────────

// Crear orden: máximo 10 por minuto (previene spam de órdenes)
exports.createOrderLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: "Demasiadas solicitudes para crear órdenes. Intenta en un momento.",
});

// Consultar órdenes: máximo 60 por minuto (lectura, más permisivo)
exports.readOrderLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: "Demasiadas consultas. Intenta de nuevo en un momento.",
});