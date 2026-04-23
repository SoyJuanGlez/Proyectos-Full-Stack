
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    // ── Rol del usuario ──────────────────────────────────────────────────────
    // Solo puede ser "user" o "admin". El default siempre es "user".
    // Para promover a alguien a admin hay que hacerlo directamente en la BD
    // o mediante el endpoint PATCH /api/users/:id/role (solo admins).
    role: {
      type:    String,
      enum:    ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

// Nunca devolvemos la contraseña en las respuestas JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);