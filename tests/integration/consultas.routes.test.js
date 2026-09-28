const request = require("supertest");
const app = require("../../src/app");
const { criarAdminEToken, criarMedicoTeste, emailUnico } = require("../helpers/auth");

async function criarPacienteEToken(prefixo) {
  const email = emailUnico(prefixo);
  const registro = await request(app).post("/api/auth/registro").send({ nome: "Paciente", email, senha: "123456" });
  return { token: registro.body.dados.token, id: registro.body.dados.usuario.id };
}

// Uma segunda-feira e um sábado fixos, usados em todos os testes deste
// arquivo, para os asserts de dia útil/fim de semana serem previsíveis.
const SEGUNDA = "2026-11-02";
const SABADO = "2026-11-07";

describe("Fluxo completo de agendamento de consultas", () => {
  it("bloqueia agendamento em fim de semana", async () => {
    const { token } = await criarPacienteEToken("fds");
    const medico = await criarMedicoTeste();

    const resposta = await request(app)
      .post("/api/consultas")
      .set("Authorization", `Bearer ${token}`)
      .send({ medicoId: medico.id, data: SABADO, hora: "08:00" });

    expect(resposta.status).toBe(400);
  });

  it("agenda com sucesso e impede um segundo paciente no mesmo horário", async () => {
    const paciente1 = await criarPacienteEToken("p1");
    const paciente2 = await criarPacienteEToken("p2");
    const medico = await criarMedicoTeste();

    const primeiro = await request(app)
      .post("/api/consultas")
      .set("Authorization", `Bearer ${paciente1.token}`)
      .send({ medicoId: medico.id, data: SEGUNDA, hora: "08:00" });
    expect(primeiro.status).toBe(201);
    expect(primeiro.body.dados.status).toBe("Agendado");

    const segundo = await request(app)
      .post("/api/consultas")
      .set("Authorization", `Bearer ${paciente2.token}`)
      .send({ medicoId: medico.id, data: SEGUNDA, hora: "08:00" });
    expect(segundo.status).toBe(409);
  });

  it("paciente vê a própria consulta em /minhas, mas não em /  (admin only)", async () => {
    const paciente = await criarPacienteEToken("minhas");
    const medico = await criarMedicoTeste();

    await request(app)
      .post("/api/consultas")
      .set("Authorization", `Bearer ${paciente.token}`)
      .send({ medicoId: medico.id, data: SEGUNDA, hora: "09:00" });

    const minhas = await request(app).get("/api/consultas/minhas").set("Authorization", `Bearer ${paciente.token}`);
    expect(minhas.status).toBe(200);
    expect(minhas.body.dados.length).toBeGreaterThan(0);

    const todas = await request(app).get("/api/consultas").set("Authorization", `Bearer ${paciente.token}`);
    expect(todas.status).toBe(403);
  });

  it("paciente cancela a própria consulta, mas não pode marcar como Realizado", async () => {
    const paciente = await criarPacienteEToken("cancela");
    const medico = await criarMedicoTeste();

    const agendada = await request(app)
      .post("/api/consultas")
      .set("Authorization", `Bearer ${paciente.token}`)
      .send({ medicoId: medico.id, data: SEGUNDA, hora: "10:00" });
    const id = agendada.body.dados.id;

    const tentativaRealizado = await request(app)
      .put(`/api/consultas/${id}`)
      .set("Authorization", `Bearer ${paciente.token}`)
      .send({ status: "Realizado" });
    expect(tentativaRealizado.status).toBe(403);

    const cancelamento = await request(app)
      .put(`/api/consultas/${id}`)
      .set("Authorization", `Bearer ${paciente.token}`)
      .send({ status: "Cancelado" });
    expect(cancelamento.status).toBe(200);
    expect(cancelamento.body.dados.status).toBe("Cancelado");
  });

  it("admin marca consulta como Realizado e depois a exclui", async () => {
    const paciente = await criarPacienteEToken("admin-flow");
    const { token: tokenAdmin } = await criarAdminEToken();
    const medico = await criarMedicoTeste();

    const agendada = await request(app)
      .post("/api/consultas")
      .set("Authorization", `Bearer ${paciente.token}`)
      .send({ medicoId: medico.id, data: SEGUNDA, hora: "11:00" });
    const id = agendada.body.dados.id;

    const realizada = await request(app)
      .put(`/api/consultas/${id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ status: "Realizado" });
    expect(realizada.status).toBe(200);
    expect(realizada.body.dados.status).toBe("Realizado");

    const exclusao = await request(app).delete(`/api/consultas/${id}`).set("Authorization", `Bearer ${tokenAdmin}`);
    expect(exclusao.status).toBe(204);
  });

  it("admin filtra a listagem geral por status", async () => {
    const { token: tokenAdmin } = await criarAdminEToken();
    const resposta = await request(app)
      .get("/api/consultas?status=Agendado")
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body.dados.every((c) => c.status === "Agendado")).toBe(true);
  });

  it("um paciente não pode alterar a consulta de outro paciente", async () => {
    const dono = await criarPacienteEToken("dono");
    const intruso = await criarPacienteEToken("intruso");
    const medico = await criarMedicoTeste();

    const agendada = await request(app)
      .post("/api/consultas")
      .set("Authorization", `Bearer ${dono.token}`)
      .send({ medicoId: medico.id, data: SEGUNDA, hora: "13:00" });
    const id = agendada.body.dados.id;

    const tentativa = await request(app)
      .put(`/api/consultas/${id}`)
      .set("Authorization", `Bearer ${intruso.token}`)
      .send({ status: "Cancelado" });

    expect(tentativa.status).toBe(403);
  });
});
