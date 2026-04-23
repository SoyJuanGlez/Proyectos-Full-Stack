
const router         = require("express").Router();
const User           = require("../models/user.model");
const userController = require("../controllers/user.controller");
const auth           = require("../middlewares/auth.middleware");
const role           = require("../middlewares/role.middleware");

// Todos los endpoints requieren estar autenticado
router.use(auth);

// ── Listar usuarios — solo admin ──────────────────────────────────────────────
router.get("/", role("admin"), userController.getUsers);

// ── Ver usuario por ID — admin o el propio usuario ────────────────────────────
router.get("/:id", userController.getUser);

// ── Actualizar usuario — admin o el propio usuario ────────────────────────────
router.put("/:id", userController.updateUser);

// ── Eliminar usuario — solo admin ─────────────────────────────────────────────
router.delete("/:id", role("admin"), userController.deleteUser);

// ── Cambiar rol — solo admin ──────────────────────────────────────────────────
// PATCH /api/users/:id/role   body: { "role": "admin" } o { "role": "user" }
// Esta es la única forma correcta de asignar roles (no desde registro ni desde updateUser)
router.patch("/:id/role", role("admin"), async (req, res, next) => {
  try {
    const { role: newRole } = req.body;
    const VALID_ROLES = ["user", "admin"];

    if (!newRole || !VALID_ROLES.includes(newRole)) {
      return res.status(422).json({
        message: `Rol inválido. Valores permitidos: ${VALID_ROLES.join(", ")}.`,
      });
    }

    // Un admin no puede quitarse a sí mismo el rol de admin (evita quedar sin admins)
    if (req.params.id === req.user.id && newRole !== "admin") {
      return res.status(409).json({
        message: "No puedes quitarte el rol de administrador a ti mismo.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: newRole },
      { new: true, runValidators: true }   // runValidators respeta el enum del modelo
    );

    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

    res.json({ message: `Rol actualizado a '${newRole}'.`, user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;