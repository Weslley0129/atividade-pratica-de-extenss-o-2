const swaggerJsdoc = require("swagger-jsdoc");

const definicao = {
  openapi: "3.0.3",
  info: {
    title: "Clique Saúde API",
    version: "1.0.0",
    description:
      "API REST do Clique Saúde — sistema de agendamento de consultas médicas. " +
      "Documentação interativa gerada com Swagger/OpenAPI (Atividade 4, PPE III).",
    contact: {
      name: "Weslley Santos",
      email: "weslley0129@gmail.com",
    },
  },
  servers: [
    { url: "http://localhost:3333/api", description: "Ambiente local de desenvolvimento" },
  ],
  tags: [
    { name: "Autenticação", description: "Registro, login e perfil do usuário logado" },
    { name: "Médicos", description: "Consulta e gestão de médicos e seus horários fixos" },
    { name: "Consultas", description: "Agendamento, listagem e cancelamento de consultas" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token JWT retornado por POST /auth/login. Envie como `Authorization: Bearer <token>`.",
      },
    },
    schemas: {
      Usuario: {
        type: "object",
        properties: {
          id: { type: "integer", example: 2 },
          nome: { type: "string", example: "Weslley Santos" },
          email: { type: "string", format: "email", example: "paciente@cliquesaude.com" },
          tipo: { type: "string", enum: ["paciente", "admin"], example: "paciente" },
        },
      },
      Medico: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          nome: { type: "string", example: "Dra. Carla Nunes" },
          crm: { type: "string", example: "CRM-SP 10234" },
          especialidade: { type: "string", example: "Cardiologia" },
          valorConsulta: { type: "number", format: "float", example: 250 },
        },
      },
      HorarioDisponivel: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          medicoId: { type: "integer", example: 1 },
          diaSemana: {
            type: "string",
            enum: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"],
            example: "Segunda",
          },
          horario: { type: "string", example: "08:00" },
        },
      },
      Consulta: {
        type: "object",
        properties: {
          id: { type: "integer", example: 5 },
          pacienteId: { type: "integer", example: 2 },
          medicoId: { type: "integer", example: 1 },
          data: { type: "string", example: "2026-10-12" },
          hora: { type: "string", example: "08:00" },
          status: { type: "string", enum: ["Agendado", "Realizado", "Cancelado"], example: "Agendado" },
          observacoes: { type: "string", nullable: true, example: "Retorno" },
        },
      },
      ErroResposta: {
        type: "object",
        properties: {
          sucesso: { type: "boolean", example: false },
          codigo: { type: "string", example: "ERRO_NAO_ENCONTRADO" },
          mensagem: { type: "string", example: "Recurso não encontrado." },
          detalhes: {
            type: "array",
            nullable: true,
            items: {
              type: "object",
              properties: {
                campo: { type: "string", example: "email" },
                mensagem: { type: "string", example: "E-mail inválido." },
              },
            },
          },
        },
      },
    },
    responses: {
      NaoAutenticado: {
        description: "Token ausente, inválido ou expirado.",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErroResposta" } } },
      },
      NaoAutorizado: {
        description: "Usuário autenticado, mas sem permissão (rota exige admin).",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErroResposta" } } },
      },
      NaoEncontrado: {
        description: "Recurso não encontrado.",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErroResposta" } } },
      },
      ErroValidacao: {
        description: "Dados de entrada inválidos.",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErroResposta" } } },
      },
    },
  },
};

const opcoes = {
  definition: definicao,
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(opcoes);
