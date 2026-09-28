const medicoModel = require("../models/medico.model");
const { NotFoundError, ConflictError } = require("../utils/AppError");

async function listar(especialidade) {
  return medicoModel.listar(especialidade);
}

async function listarEspecialidades() {
  const registros = await medicoModel.listarEspecialidades();
  return registros.map((r) => r.especialidade);
}

async function buscarPorId(id) {
  const medico = await medicoModel.buscarPorId(id);
  if (!medico) {
    throw new NotFoundError("Médico não encontrado.");
  }
  return medico;
}

async function criar(dados) {
  const existente = await medicoModel.buscarPorCrm(dados.crm);
  if (existente) {
    throw new ConflictError("Já existe um médico cadastrado com esse CRM.");
  }
  return medicoModel.criar(dados);
}

async function atualizar(id, dados) {
  await buscarPorId(id); // garante 404 antes de tentar o update
  return medicoModel.atualizar(id, dados);
}

async function remover(id) {
  await buscarPorId(id);
  await medicoModel.remover(id);
}

async function horariosDoMedico(id) {
  await buscarPorId(id);
  return medicoModel.horariosDoMedico(id);
}

module.exports = { listar, listarEspecialidades, buscarPorId, criar, atualizar, remover, horariosDoMedico };
