const medicosService = require("../services/medicos.service");
const asyncHandler = require("../utils/asyncHandler");

const listar = asyncHandler(async (req, res) => {
  const medicos = await medicosService.listar(req.query.especialidade);
  res.status(200).json({ sucesso: true, dados: medicos });
});

const listarEspecialidades = asyncHandler(async (req, res) => {
  const especialidades = await medicosService.listarEspecialidades();
  res.status(200).json({ sucesso: true, dados: especialidades });
});

const buscarPorId = asyncHandler(async (req, res) => {
  const medico = await medicosService.buscarPorId(Number(req.params.id));
  res.status(200).json({ sucesso: true, dados: medico });
});

const horarios = asyncHandler(async (req, res) => {
  const horarios = await medicosService.horariosDoMedico(Number(req.params.id));
  res.status(200).json({ sucesso: true, dados: horarios });
});

const criar = asyncHandler(async (req, res) => {
  const medico = await medicosService.criar(req.body);
  res.status(201).json({ sucesso: true, dados: medico });
});

const atualizar = asyncHandler(async (req, res) => {
  const medico = await medicosService.atualizar(Number(req.params.id), req.body);
  res.status(200).json({ sucesso: true, dados: medico });
});

const remover = asyncHandler(async (req, res) => {
  await medicosService.remover(Number(req.params.id));
  res.status(204).send();
});

module.exports = { listar, listarEspecialidades, buscarPorId, horarios, criar, atualizar, remover };
