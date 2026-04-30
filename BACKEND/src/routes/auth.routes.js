const router = require("express").Router();
const authService = require("../services/auth.service");

// Registro de usuarios.
// Recibe los datos del body, delega al servicio y devuelve el usuario creado.
router.post("/register", async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login.
// Valida credenciales y devuelve token + datos minimos del usuario.
router.post("/login", async (req, res) => {
  try {
    const result = await authService.login(
      req.body.email,
      req.body.password
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
