const userService = require("../services/user.service");

// Lista usuarios. Solo administradores tienen permiso.
exports.getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Solo administradores pueden listar usuarios" });
    }

    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo usuarios" });
  }
};

// Obtiene un usuario por ID.
// Puede consultarlo un admin o el propio usuario autenticado.
exports.getUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Evita que un usuario normal vea informacion de otros usuarios.
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const user = await userService.getUserById(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo usuario" });
  }
};

// Actualiza un usuario existente.
// Mantiene la misma regla de acceso: admin o propietario.
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const user = await userService.updateUser(userId, req.body);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error actualizando usuario" });
  }
};

// Elimina un usuario. Esta accion se reserva solo para admin.
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Solo admin puede eliminar" });
    }

    const user = await userService.deleteUser(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando usuario" });
  }
};

// Crea un usuario desde una ruta protegida de administracion.
exports.createUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Solo admin puede crear usuario" });
    }

    const user = await userService.createUser(req.body);

    // La respuesta expone solo datos publicos, nunca la password.
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: "Error creando usuario" });
  }
};
