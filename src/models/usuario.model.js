const prisma = require("../config/prismaClient");

const SELECT_PUBLICO = { id: true, nome: true, email: true, tipo: true, criadoEm: true };

module.exports = {
  buscarPorEmail(email) {
    return prisma.usuario.findUnique({ where: { email } });
  },

  buscarPorId(id) {
    return prisma.usuario.findUnique({ where: { id }, select: SELECT_PUBLICO });
  },

  criar({ nome, email, senha, tipo }) {
    return prisma.usuario.create({
      data: { nome, email, senha, tipo },
      select: SELECT_PUBLICO,
    });
  },
};
