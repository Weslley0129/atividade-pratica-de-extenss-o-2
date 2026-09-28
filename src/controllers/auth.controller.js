const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");

const registrar = asyncHandler(async (req, res) => {
  const resultado = await authService.registrar(req.body);
  res.status(201).json({ sucesso: true, dados: resultado });
});

const login = asyncHandler(async (req, res) => {
  const resultado = await authService.login(req.body);
  res.status(200).json({ sucesso: true, dados: resultado });
});

const perfil = asyncHandler(async (req, res) => {
  const usuario = await authService.buscarPerfil(req.usuario.id);
  res.status(200).json({ sucesso: true, dados: usuario });
});

module.exports = { registrar, login, perfil };
