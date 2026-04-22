const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "mi_llave_secreta_provisional";

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: "Token requerido" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role || "user",
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalido o expirado" });
  }
};
