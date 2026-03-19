const router = require("express").Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Protegido: requiere JWT
router.use(authMiddleware);

router.get("/", userController.getUsers); // admin
router.get("/:id", userController.getUser); // admin o propietario
router.post("/", userController.createUser); // admin
router.put("/:id", userController.updateUser); // admin o propietario
router.delete("/:id", userController.deleteUser); // admin

module.exports = router;