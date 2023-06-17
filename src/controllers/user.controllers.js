const catchError = require("../utils/catchError");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmails");
const EmailCode = require("../models/EmailCode");
const jwt = require("jsonwebtoken");
const getAll = catchError(async (req, res) => {
  const results = await User.findAll({ include: [EmailCode] });
  return res.json(results);
});

const create = catchError(async (req, res) => {
  const { email, password, firstName, lastName, country, image, frontBaseUrl } =
    req.body;

  const hashPassword = await bcrypt.hash(password, 10);

  const body = {
    email,
    password: hashPassword,
    firstName,
    lastName,
    country,
    image,
  };

  const result = await User.create(body);
  const code = require("crypto").randomBytes(64).toString("hex");
  const url = `${frontBaseUrl}/verify_email/${code}`;

  await sendEmail({
    to: email,
    subject: `Verificacion de cuenta`,
    html: `
    <h2>Haz click en el enlace para verificar la cuenta</h2>
    <a href=${url}>Click Me!</a>`,
  });

  const bodyCode = { code, userId: result.id };

  await EmailCode.create(bodyCode);

  return res.status(201).json(result);
});

const getOne = catchError(async (req, res) => {
  const { id } = req.params;
  const result = await User.findByPk(id);
  if (!result) return res.sendStatus(404);
  return res.json(result);
});

const remove = catchError(async (req, res) => {
  const { id } = req.params;
  const user = await User.destroy({ where: { id } });
  if (!user) return res.sendStatus(404);
  return res.sendStatus(204);
});

const update = catchError(async (req, res) => {
  const { id } = req.params;
  const result = await User.update(req.body, {
    where: { id },
    returning: true,
  });
  if (result[0] === 0) return res.sendStatus(404);
  return res.json(result[1][0]);
});

const verifyCode = catchError(async (req, res) => {
  // /verify/:code
  const { code } = req.params;
  const codeUser = await EmailCode.findOne({ where: { code } });
  if (!codeUser) return res.sendStatus(401);

  const body = { isVerified: true };
  const userUpdate = await User.update(body, {
    where: { id: codeUser.userId },
    returning: true,
  });

  await codeUser.destroy();

  return res.json(userUpdate[1][0]);
});
const login = catchError(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.sendStatus(401);
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) return res.sendStatus(401);
  if (!user.isVerified) return res.sendStatus(401);
  const token = jwt.sign({ user }, process.env.TOKEN_SECRET, {
    expiresIn: "1d",
  });

  return res.json({ user, token });
});

const getMe = catchError(async (req, res) => {
  const loggedUser = req.user;
  return res.json(loggedUser);
});

const verifyResetPassword = catchError(async (req, res) => {
  const { email, frontBaseUrl } = req.body;
  const result = await User.findOne({ where: { email } });
  if (!result) return res.sendStatus(401);

  const code = require("crypto").randomBytes(64).toString("hex");

  const bodyCode = { code, userId: result.id };

  await EmailCode.create(bodyCode);

  const url = `${frontBaseUrl}/reset_password/${code}`;

  await sendEmail({
    to: email,
    subject: `Password reset`,
    html: `
    <h2>Haz click en el enlace para resetear la password</h2>
    <a href=${url}>Click Me!</a>`,
  });
  return res.status(201).json(result);
});

const resetPassword = catchError(async (req, res) => {
  const { password } = req.body;
  const { code } = req.params;
  const verifyCode = await EmailCode.findOne({ where: { code } });
  if (!code) return res.status(401).json({ message: "Invalid credentials" });
  const hashPassword = await bcrypt.hash(password, 10);

  const userUpdate = await User.update(
    { password: hashPassword },
    {
      where: { id: verifyCode.userId },
      returning: true,
    }
  );
  await verifyCode.destroy();

  return res.json(userUpdate[1][0]);
});

module.exports = {
  getAll,
  create,
  getOne,
  getMe,
  remove,
  update,
  verifyCode,
  login,
  verifyResetPassword,
  resetPassword,
};
