module.exports = (req, res, next) => {
  // Middleware desactivado temporalmente: no requiere JWT.
  return next();
};