const consultaModel = require("../models/consulta.model");
const medicoModel = require("../models/medico.model");
const { ValidationError, ConflictError, NotFoundError, ForbiddenError } = require("../utils/AppError");
const { ehFimDeSemana } = require("../utils/data");

async function listarDoPaciente(pacienteId) {
  return consultaModel.listarDoPaciente(pacienteId);
}

async function listarTodas(status) {
  return consultaModel.listarTodas(status);
}

async function agendar(pacienteId, { medicoId, data, hora, observacoes }) {
  const medico = await medicoModel.buscarPorId(medicoId);
  if (!medico) {
    throw new NotFoundError("Médico não encontrado.");
  }

  if (ehFimDeSemana(data)) {
    throw new ValidationError("Não há atendimento aos fins de semana.");
  }

  const conflito = await consultaModel.buscarConflito({ medicoId, data, hora });
  if (conflito) {
    throw new ConflictError("Esse horário já está reservado. Escolha outro.");
  }

  return consultaModel.criar({ pacienteId, medicoId, data, hora, observacoes });
}

async function atualizar(id, usuarioLogado, dados) {
  const consulta = await consultaModel.buscarPorId(id);
  if (!consulta) {
    throw new NotFoundError("Consulta não encontrada.");
  }

  const ehDona = consulta.pacienteId === usuarioLogado.id;
  const ehAdmin = usuarioLogado.tipo === "admin";

  if (!ehDona && !ehAdmin) {
    throw new ForbiddenError("Você só pode alterar suas próprias consultas.");
  }

  // Paciente comum só pode cancelar; mudar para "Realizado" é privilégio do admin.
  if (!ehAdmin && dados.status && dados.status !== "Cancelado") {
    throw new ForbiddenError("Somente um administrador pode alterar esse status.");
  }

  if (consulta.status === "Cancelado") {
    throw new ConflictError("Essa consulta já está cancelada.");
  }

  return consultaModel.atualizar(id, dados);
}

async function remover(id, usuarioLogado) {
  if (usuarioLogado.tipo !== "admin") {
    throw new ForbiddenError("Somente um administrador pode excluir consultas.");
  }
  const consulta = await consultaModel.buscarPorId(id);
  if (!consulta) {
    throw new NotFoundError("Consulta não encontrada.");
  }
  await consultaModel.remover(id);
}

module.exports = { listarDoPaciente, listarTodas, agendar, atualizar, remover };
