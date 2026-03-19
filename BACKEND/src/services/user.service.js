const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

exports.getAllUsers = async () => {
  return await User.find({}, "name email role");
};

exports.getUserById = async (id) => {
  return await User.findById(id, "name email role");
};

exports.updateUser = async (id, payload) => {
  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, 10);
  }
  return await User.findByIdAndUpdate(id, payload, { new: true, runValidators: true, fields: "name email role" });
};

exports.deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

exports.createUser = async (data) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  return await User.create(data);
};