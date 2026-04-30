// Controlador alterno de autenticacion.
// Este archivo implementa registro/login directo con el modelo, sin pasar por auth.service.
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Crea un usuario nuevo con password hasheada.
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Se instancia el documento manualmente y luego se persiste con save().
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ message: "Usuario creado" });

  } catch (error) {
    res.status(500).json({ message: "Error registrando usuario" });
  }
};

// Valida credenciales y responde con datos basicos del usuario.
// A diferencia de auth.service, aqui no se genera JWT.
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ message: "ContraseÃ±a incorrecta" });

    // Devuelve solo datos del usuario autenticado.
    res.json({
      id: user._id,
      name: user.name,
      email: user.email
    });

  } catch (error) {
    res.status(500).json({ message: "Error en login" });
  }
};
