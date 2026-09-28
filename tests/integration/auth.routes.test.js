const request = require("supertest");
const app = require("../../src/app");
const { emailUnico } = require("../helpers/auth");

describe("POST /api/auth/registro", () => {
  it("cria um paciente novo e retorna 201 com token", async () => {
    const email = emailUnico("registro");
    const resposta = await request(app)
      .post("/api/auth/registro")
      .send({ nome: "Paciente Teste", email, senha: "123456" });

    expect(resposta.status).toBe(201);
    expect(resposta.body.sucesso).toBe(true);
    expect(resposta.body.dados.usuario.email).toBe(email);
    expect(resposta.body.dados.usuario.senha).toBeUndefined();
    expect(resposta.body.dados.token).toEqual(expect.any(String));
  });

  it("retorna 400 quando os dados são inválidos", async () => {
    const resposta = await request(app)
      .post("/api/auth/registro")
      .send({ nome: "a", email: "nao-e-email", senha: "123" });

    expect(resposta.status).toBe(400);
    expect(resposta.body.codigo).toBe("ERRO_VALIDACAO");
    expect(resposta.body.detalhes.length).toBeGreaterThan(0);
  });

  it("retorna 409 ao tentar registrar um e-mail já usado", async () => {
    const email = emailUnico("duplicado");
    await request(app).post("/api/auth/registro").send({ nome: "Um", email, senha: "123456" });

    const resposta = await request(app)
      .post("/api/auth/registro")
      .send({ nome: "Outro", email, senha: "123456" });

    expect(resposta.status).toBe(409);
    expect(resposta.body.codigo).toBe("ERRO_CONFLITO");
  });
});

describe("POST /api/auth/login", () => {
  it("autentica com credenciais corretas", async () => {
    const email = emailUnico("login");
    await request(app).post("/api/auth/registro").send({ nome: "Login Teste", email, senha: "123456" });

    const resposta = await request(app).post("/api/auth/login").send({ email, senha: "123456" });

    expect(resposta.status).toBe(200);
    expect(resposta.body.dados.token).toEqual(expect.any(String));
  });

  it("retorna 401 com senha errada", async () => {
    const email = emailUnico("senhaerrada");
    await request(app).post("/api/auth/registro").send({ nome: "X", email, senha: "123456" });

    const resposta = await request(app).post("/api/auth/login").send({ email, senha: "outraSenha" });

    expect(resposta.status).toBe(401);
    expect(resposta.body.codigo).toBe("ERRO_AUTENTICACAO");
  });
});

describe("GET /api/auth/perfil", () => {
  it("retorna 401 sem token", async () => {
    const resposta = await request(app).get("/api/auth/perfil");
    expect(resposta.status).toBe(401);
  });

  it("retorna os dados do usuário logado com token válido", async () => {
    const email = emailUnico("perfil");
    const registro = await request(app)
      .post("/api/auth/registro")
      .send({ nome: "Perfil Teste", email, senha: "123456" });
    const token = registro.body.dados.token;

    const resposta = await request(app).get("/api/auth/perfil").set("Authorization", `Bearer ${token}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body.dados.email).toBe(email);
  });

  it("retorna 401 com um token inválido", async () => {
    const resposta = await request(app).get("/api/auth/perfil").set("Authorization", "Bearer token-invalido");
    expect(resposta.status).toBe(401);
  });
});
