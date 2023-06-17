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
  getMe,
} = require("../controllers/user.controllers");
const express = require("express");
const verifyJWT = require("../utils/verifyJWT");
const routerUser = express.Router();

routerUser.route("/").get(verifyJWT, getAll).post(create);
routerUser.route("/me").get(verifyJWT, getMe);

routerUser.route("/login").post(login);
routerUser.route("/reset_password").post(verifyResetPassword);

routerUser.route("/reset_password/:code").post(resetPassword);

routerUser.route("/verify/:code").get(verifyCode);
routerUser
  .route("/:id")
  .get(verifyJWT, getOne)
  .delete(verifyJWT, remove)
  .put(verifyJWT, update);

module.exports = routerUser;
