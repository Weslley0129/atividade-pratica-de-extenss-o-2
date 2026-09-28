const prisma = require("../config/prismaClient");

const INCLUDE_PADRAO = {
  medico: { select: { id: true, nome: true, especialidade: true, valorConsulta: true } },
  paciente: { select: { id: true, nome: true, email: true } },
};

module.exports = {
  listarDoPaciente(pacienteId) {
    return prisma.consulta.findMany({
      where: { pacienteId },
      include: INCLUDE_PADRAO,
      orderBy: [{ data: "asc" }, { hora: "asc" }],
    });
  },

  listarTodas(status) {
    return prisma.consulta.findMany({
      where: status ? { status } : undefined,
      include: INCLUDE_PADRAO,
      orderBy: [{ data: "asc" }, { hora: "asc" }],
    });
  },

  buscarPorId(id) {
    return prisma.consulta.findUnique({ where: { id }, include: INCLUDE_PADRAO });
  },

  buscarConflito({ medicoId, data, hora }) {
    return prisma.consulta.findFirst({
      where: { medicoId, data, hora, status: "Agendado" },
    });
  },

  criar(dados) {
    return prisma.consulta.create({ data: dados, include: INCLUDE_PADRAO });
  },

  atualizar(id, dados) {
    return prisma.consulta.update({ where: { id }, data: dados, include: INCLUDE_PADRAO });
  },

  remover(id) {
    return prisma.consulta.delete({ where: { id } });
  },
};
