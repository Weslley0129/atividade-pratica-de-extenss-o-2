const { PrismaClient } = require("@prisma/client");

// Uma única instância do Prisma Client para toda a aplicação: o Prisma já
// gerencia um pool de conexões internamente, e reabrir clients a cada
// requisição esgotaria as conexões disponíveis rapidamente.
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

module.exports = prisma;
