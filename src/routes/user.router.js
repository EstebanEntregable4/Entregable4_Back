const {
  getAll,
  create,
  getOne,
  remove,
  update,
  verifyCode,
  login,
  resetPassword,
  verifyResetPassword,
} = require("../controllers/user.controllers");
const express = require("express");

const routerUser = express.Router();

routerUser.route("/").get(getAll).post(create);

routerUser.route("/login").post(login);
routerUser.route("/reset_password").post(verifyResetPassword);

routerUser.route("/reset_password/:code").post(resetPassword);

routerUser.route("/verify/:code").get(verifyCode);
routerUser.route("/:id").get(getOne).delete(remove).put(update);

module.exports = routerUser;
