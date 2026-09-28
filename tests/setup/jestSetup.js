const prisma = require("../../src/config/prismaClient");

// Fecha a conexão com o banco depois que TODOS os testes de um arquivo
// rodam, para o processo do Jest não ficar pendurado esperando o pool.
afterAll(async () => {
  await prisma.$disconnect();
});
