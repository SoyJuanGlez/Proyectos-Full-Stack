const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

// Devuelve todos los usuarios sin incluir la password.
exports.getAllUsers = async () => {
  return await User.find({}, "name email role");
};

// Obtiene un usuario por ID sin exponer la password.
exports.getUserById = async (id) => {
  return await User.findById(id, "name email role");
};

// Actualiza un usuario.
// Si se envia password nueva, se re-hashea antes de guardar.
exports.updateUser = async (id, payload) => {
  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, 10);
  }
  return await User.findByIdAndUpdate(id, payload, { new: true, runValidators: true, fields: "name email role" });
};

// Elimina un usuario por ID.
exports.deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

// Crea un usuario nuevo, protegiendo la password con hash si viene en el payload.
exports.createUser = async (data) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  return await User.create(data);
};
