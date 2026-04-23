
const userService = require("../services/user.service");

exports.getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    // Admin puede ver cualquier usuario; un user solo puede verse a sí mismo
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Acceso denegado." });
    }

    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    // Solo admin o el propio usuario pueden editar
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Acceso denegado." });
    }

    // ⚠️ Bloqueamos el cambio de rol desde este endpoint
    // Los roles SOLO se cambian desde PATCH /:id/role
    const { role: _role, password: _password, ...safeData } = req.body;

    const user = await userService.updateUser(req.params.id, safeData);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    // Evitar que el admin se elimine a sí mismo
    if (req.params.id === req.user.id) {
      return res.status(409).json({ message: "No puedes eliminar tu propia cuenta." });
    }

    const user = await userService.deleteUser(req.params.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

    res.json({ message: "Usuario eliminado." });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({
      id:    user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    });
  } catch (error) {
    next(error);
  }
};