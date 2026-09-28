const request = require("supertest");
const app = require("../../src/app");
const { criarAdminEToken, emailUnico } = require("../helpers/auth");

describe("GET /api/medicos", () => {
  it("lista médicos publicamente (sem autenticação)", async () => {
    const resposta = await request(app).get("/api/medicos");
    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body.dados)).toBe(true);
  });

  it("retorna 404 para um médico que não existe", async () => {
    const resposta = await request(app).get("/api/medicos/999999");
    expect(resposta.status).toBe(404);
  });

  it("lista as especialidades únicas", async () => {
    const resposta = await request(app).get("/api/medicos/especialidades");
    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body.dados)).toBe(true);
  });

  it("lista os horários de um médico existente", async () => {
    const { criarMedicoTeste } = require("../helpers/auth");
    const medico = await criarMedicoTeste();

    const resposta = await request(app).get(`/api/medicos/${medico.id}/horarios`);
    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body.dados)).toBe(true);
  });

  it("retorna 404 ao pedir horários de um médico inexistente", async () => {
    const resposta = await request(app).get("/api/medicos/999999/horarios");
    expect(resposta.status).toBe(404);
  });
});

describe("POST /api/medicos", () => {
  it("retorna 401 sem token", async () => {
    const resposta = await request(app).post("/api/medicos").send({});
    expect(resposta.status).toBe(401);
  });

  it("retorna 403 para um paciente comum", async () => {
    const email = emailUnico("naoadmin");
    const registro = await request(app)
      .post("/api/auth/registro")
      .send({ nome: "Paciente", email, senha: "123456" });

    const resposta = await request(app)
      .post("/api/medicos")
      .set("Authorization", `Bearer ${registro.body.dados.token}`)
      .send({ nome: "Dr. X", crm: emailUnico("crm"), especialidade: "Clínica Geral", valorConsulta: 100 });

    expect(resposta.status).toBe(403);
  });

  it("cria um médico quando autenticado como admin, e permite atualizar e remover", async () => {
    const { token } = await criarAdminEToken();
    const crm = `CRM-INTEGRACAO-${Date.now()}`;

    const criacao = await request(app)
      .post("/api/medicos")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Dr. Integração", crm, especialidade: "Clínica Geral", valorConsulta: 150 });

    expect(criacao.status).toBe(201);
    const id = criacao.body.dados.id;

    const atualizacao = await request(app)
      .put(`/api/medicos/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ valorConsulta: 175 });

    expect(atualizacao.status).toBe(200);
    expect(atualizacao.body.dados.valorConsulta).toBe(175);

    const remocao = await request(app).delete(`/api/medicos/${id}`).set("Authorization", `Bearer ${token}`);
    expect(remocao.status).toBe(204);

    const busca = await request(app).get(`/api/medicos/${id}`);
    expect(busca.status).toBe(404);
  });

  it("retorna 409 ao criar médico com CRM já usado", async () => {
    const { token } = await criarAdminEToken();
    const crm = `CRM-DUPLICADO-${Date.now()}`;
    const dados = { nome: "Dr. Um", crm, especialidade: "Clínica Geral", valorConsulta: 100 };

    await request(app).post("/api/medicos").set("Authorization", `Bearer ${token}`).send(dados);
    const resposta = await request(app)
      .post("/api/medicos")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...dados, nome: "Dr. Dois" });

    expect(resposta.status).toBe(409);
  });
});
