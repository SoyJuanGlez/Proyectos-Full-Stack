const router = require("express").Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Todas las rutas de este modulo requieren JWT valido.
router.use(authMiddleware);

// Listado global de usuarios. Solo admin puede verlo.
router.get("/", userController.getUsers);

// Obtener un usuario puntual. Puede hacerlo admin o el propietario.
router.get("/:id", userController.getUser);

// Crear usuarios desde panel administrativo.
router.post("/", userController.createUser);

// Actualizar datos del usuario. Puede hacerlo admin o el propietario.
router.put("/:id", userController.updateUser);

// Eliminar usuarios. Solo admin.
router.delete("/:id", userController.deleteUser);

module.exports = router;
