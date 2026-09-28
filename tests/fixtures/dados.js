// Fixtures: objetos de exemplo reutilizados entre os testes, para não
// repetir os mesmos literais em cada arquivo.
const medicoExemplo = {
  id: 1,
  nome: "Dra. Carla Nunes",
  crm: "CRM-SP 10234",
  especialidade: "Cardiologia",
  valorConsulta: 250,
};

const usuarioExemplo = {
  id: 2,
  nome: "Weslley Santos",
  email: "paciente@cliquesaude.com",
  tipo: "paciente",
};

const consultaExemplo = {
  id: 1,
  pacienteId: 2,
  medicoId: 1,
  data: "2026-10-05",
  hora: "09:00",
  status: "Agendado",
  observacoes: null,
};

module.exports = { medicoExemplo, usuarioExemplo, consultaExemplo };
