const prisma = require("../config/prismaClient");

module.exports = {
  listar(especialidade) {
    return prisma.medico.findMany({
      where: especialidade ? { especialidade } : undefined,
      orderBy: { nome: "asc" },
    });
  },

  listarEspecialidades() {
    return prisma.medico.findMany({
      distinct: ["especialidade"],
      select: { especialidade: true },
      orderBy: { especialidade: "asc" },
    });
  },

  buscarPorId(id) {
    return prisma.medico.findUnique({
      where: { id },
      include: { horarios: true },
    });
  },

  buscarPorCrm(crm) {
    return prisma.medico.findUnique({ where: { crm } });
  },

  criar(dados) {
    return prisma.medico.create({ data: dados });
  },

  atualizar(id, dados) {
    return prisma.medico.update({ where: { id }, data: dados });
  },

  remover(id) {
    return prisma.medico.delete({ where: { id } });
  },

  horariosDoMedico(medicoId) {
    return prisma.horarioDisponivel.findMany({ where: { medicoId } });
  },
};
