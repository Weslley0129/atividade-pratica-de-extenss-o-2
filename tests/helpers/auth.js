const bcrypt = require("bcryptjs");
const prisma = require("../../src/config/prismaClient");
const { gerarToken } = require("../../src/utils/jwt");

// O endpoint público de registro só cria pacientes; para testar rotas de
// admin, o teste de integração precisa inserir um admin direto no banco.
async function criarAdminEToken() {
  const admin = await prisma.usuario.create({
    data: {
      nome: "Admin Teste",
      email: `admin${Date.now()}-${Math.random().toString(36).slice(2)}@teste.com`,
      senha: await bcrypt.hash("admin123", 4),
      tipo: "admin",
    },
  });
  return { admin, token: gerarToken({ id: admin.id, tipo: "admin" }) };
}

async function criarMedicoTeste(dadosParciais = {}) {
  return prisma.medico.create({
    data: {
      nome: "Dr. Teste Integração",
      crm: `CRM-TESTE-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      especialidade: "Clínica Geral",
      valorConsulta: 150,
      ...dadosParciais,
    },
  });
}

function emailUnico(prefixo = "usuario") {
  return `${prefixo}${Date.now()}-${Math.random().toString(36).slice(2)}@teste.com`;
}

module.exports = { criarAdminEToken, criarMedicoTeste, emailUnico };
