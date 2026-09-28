const consultasService = require("../services/consultas.service");
const asyncHandler = require("../utils/asyncHandler");

const minhas = asyncHandler(async (req, res) => {
  const consultas = await consultasService.listarDoPaciente(req.usuario.id);
  res.status(200).json({ sucesso: true, dados: consultas });
});

const listarTodas = asyncHandler(async (req, res) => {
  const consultas = await consultasService.listarTodas(req.query.status);
  res.status(200).json({ sucesso: true, dados: consultas });
});

const agendar = asyncHandler(async (req, res) => {
  const consulta = await consultasService.agendar(req.usuario.id, req.body);
  res.status(201).json({ sucesso: true, dados: consulta });
});

const atualizar = asyncHandler(async (req, res) => {
  const consulta = await consultasService.atualizar(Number(req.params.id), req.usuario, req.body);
  res.status(200).json({ sucesso: true, dados: consulta });
});

const remover = asyncHandler(async (req, res) => {
  await consultasService.remover(Number(req.params.id), req.usuario);
  res.status(204).send();
});

module.exports = { minhas, listarTodas, agendar, atualizar, remover };
