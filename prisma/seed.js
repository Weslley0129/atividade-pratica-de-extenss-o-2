const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Limpando tabelas...");
  await prisma.consulta.deleteMany();
  await prisma.horarioDisponivel.deleteMany();
  await prisma.medico.deleteMany();
  await prisma.usuario.deleteMany();

  console.log("Criando usuários (senha com hash bcrypt)...");
  const senhaAdmin = await bcrypt.hash("admin123", 10);
  const senhaPaciente = await bcrypt.hash("123456", 10);

  const admin = await prisma.usuario.create({
    data: { nome: "Admin Clínica", email: "admin@cliquesaude.com", senha: senhaAdmin, tipo: "admin" },
  });

  const paciente = await prisma.usuario.create({
    data: { nome: "Weslley Santos", email: "paciente@cliquesaude.com", senha: senhaPaciente, tipo: "paciente" },
  });

  console.log("Criando médicos e horários...");
  const dadosMedicos = [
    { nome: "Dra. Carla Nunes", crm: "CRM-SP 10234", especialidade: "Cardiologia", valorConsulta: 250, horarios: [["Segunda", "08:00"], ["Segunda", "09:00"], ["Terça", "14:00"]] },
    { nome: "Dr. Bruno Alves", crm: "CRM-SP 10987", especialidade: "Neurologia", valorConsulta: 280, horarios: [["Segunda", "10:00"], ["Quarta", "15:00"]] },
    { nome: "Dra. Fernanda Lima", crm: "CRM-SP 11456", especialidade: "Dermatologia", valorConsulta: 220, horarios: [["Terça", "08:00"], ["Quinta", "11:00"]] },
    { nome: "Dr. Ricardo Souza", crm: "CRM-SP 11890", especialidade: "Pediatria", valorConsulta: 200, horarios: [["Sexta", "09:00"]] },
    { nome: "Dra. Juliana Prado", crm: "CRM-SP 12345", especialidade: "Ortopedia", valorConsulta: 240, horarios: [["Quarta", "16:00"]] },
    { nome: "Dr. Marcos Teixeira", crm: "CRM-SP 12987", especialidade: "Cardiologia", valorConsulta: 260, horarios: [["Quinta", "13:00"]] },
  ];

  const medicosCriados = [];
  for (const { horarios, ...dados } of dadosMedicos) {
    const medico = await prisma.medico.create({ data: dados });
    for (const [diaSemana, horario] of horarios) {
      await prisma.horarioDisponivel.create({ data: { medicoId: medico.id, diaSemana, horario } });
    }
    medicosCriados.push(medico);
  }

  console.log("Criando consultas de exemplo...");
  await prisma.consulta.create({
    data: {
      pacienteId: paciente.id,
      medicoId: medicosCriados[0].id,
      data: "2026-10-05",
      hora: "09:00",
      status: "Agendado",
      observacoes: "Check-up de rotina",
    },
  });
  await prisma.consulta.create({
    data: {
      pacienteId: paciente.id,
      medicoId: medicosCriados[2].id,
      data: "2026-09-20",
      hora: "08:00",
      status: "Realizado",
    },
  });

  console.log("Seed concluído.");
  console.log(`Admin: ${admin.email} / admin123`);
  console.log(`Paciente: ${paciente.email} / 123456`);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
