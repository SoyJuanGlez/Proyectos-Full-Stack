const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

exports.register = async (data) => {
  const hashed = await bcrypt.hash(data.password, 10);
  return await User.create({
    name: data.name,
    email: data.email,
    password: hashed
  });
};

exports.login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Usuario no encontrado");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Credenciales inválidas");

  return {
    id: user._id,
    name: user.name,
    email: user.email
  };
};