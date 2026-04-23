
const mongoose = require("mongoose");

// ── Helpers ──────────────────────────────────────────────────────────────────

// Elimina espacios extremos de strings y rechaza valores que no sean string
const sanitizeString = (val) =>
  typeof val === "string" ? val.trim() : undefined;

// Valida que un ObjectId de Mongo tenga el formato correcto
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Acumula errores y los devuelve todos juntos (no uno por uno)
class ValidationError {
  constructor() {
    this.errors = [];
  }
  add(field, message) {
    this.errors.push({ field, message });
  }
  hasErrors() {
    return this.errors.length > 0;
  }
}

// ── Validador de creación de orden  ──────────────────────────────────────────
// Valida: items (array no vacío, cada item con productId, quantity, price),
//         total (número positivo), paymentSessionId (string seguro, opcional)
exports.validateCreateOrder = (req, res, next) => {
  const v = new ValidationError();
  const { items, total, paymentSessionId, paymentStatus } = req.body;

  // ── items ──────────────────────────────────────────────────────────────────
  if (!Array.isArray(items)) {
    v.add("items", "Debe ser un arreglo.");
  } else if (items.length === 0) {
    v.add("items", "La orden debe tener al menos un producto.");
  } else if (items.length > 50) {
    // Límite razonable para evitar body gigantes
    v.add("items", "Una orden no puede tener más de 50 productos.");
  } else {
    items.forEach((item, idx) => {
      if (!item || typeof item !== "object") {
        v.add(`items[${idx}]`, "Cada item debe ser un objeto.");
        return;
      }

      // productId debe ser un ObjectId válido de Mongo
      if (!item.productId || !isValidObjectId(item.productId)) {
        v.add(`items[${idx}].productId`, "Debe ser un ID de producto válido.");
      }

      // quantity: entero positivo, máximo 999
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 999) {
        v.add(`items[${idx}].quantity`, "Debe ser un entero entre 1 y 999.");
      }

      // price: número positivo (viene del catálogo, pero lo validamos igualmente)
      const price = Number(item.price);
      if (isNaN(price) || price < 0) {
        v.add(`items[${idx}].price`, "Debe ser un número mayor o igual a 0.");
      }
    });
  }

  // ── total ──────────────────────────────────────────────────────────────────
  const parsedTotal = Number(total);
  if (total === undefined || total === null || total === "") {
    v.add("total", "El total es requerido.");
  } else if (isNaN(parsedTotal) || parsedTotal < 0) {
    v.add("total", "Debe ser un número mayor o igual a 0.");
  } else if (parsedTotal > 1_000_000) {
    // Tope máximo para evitar valores absurdos
    v.add("total", "El total supera el límite permitido.");
  }

  // ── paymentSessionId (opcional) ───────────────────────────────────────────
  if (paymentSessionId !== undefined) {
    const sid = sanitizeString(paymentSessionId);
    if (!sid || sid.length < 5 || sid.length > 255) {
      v.add("paymentSessionId", "Debe ser un string entre 5 y 255 caracteres.");
    } else if (!/^[a-zA-Z0-9_\-]+$/.test(sid)) {
      // Solo caracteres alfanuméricos y guiones — bloquea inyecciones
      v.add("paymentSessionId", "Contiene caracteres no permitidos.");
    } else {
      // Sobreescribimos con la versión sanitizada
      req.body.paymentSessionId = sid;
    }
  }

  // ── paymentStatus (opcional) ──────────────────────────────────────────────
  const VALID_STATUSES = ["pending", "paid", "failed", "refunded"];
  if (paymentStatus !== undefined && !VALID_STATUSES.includes(paymentStatus)) {
    v.add("paymentStatus", `Debe ser uno de: ${VALID_STATUSES.join(", ")}.`);
  }

  if (v.hasErrors()) {
    return res.status(422).json({
      message: "Error de validación",
      errors: v.errors,
    });
  }

  next();
};

// ── Validador de parámetro :id en la URL ──────────────────────────────────────
// Evita que IDs malformados lleguen a Mongoose (que lanzaría un CastError)
exports.validateOrderId = (req, res, next) => {
  const { id } = req.params;
  if (!id || !isValidObjectId(id)) {
    return res.status(400).json({ message: "ID de orden inválido." });
  }
  next();
};