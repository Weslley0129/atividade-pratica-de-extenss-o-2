const bcrypt = require("bcryptjs");

// Mock do model: o teste de UNIDADE não deve tocar no banco de verdade.
jest.mock("../../src/models/usuario.model");
const usuarioModel = require("../../src/models/usuario.model");
const authService = require("../../src/services/auth.service");
const { ConflictError, AuthError } = require("../../src/utils/AppError");

describe("authService.registrar", () => {
  beforeEach(() => jest.clearAllMocks());

  it("lança ConflictError se o e-mail já existir", async () => {
    usuarioModel.buscarPorEmail.mockResolvedValue({ id: 1, email: "ja@existe.com" });

    await expect(
      authService.registrar({ nome: "Fulano", email: "ja@existe.com", senha: "123456" })
    ).rejects.toThrow(ConflictError);

    expect(usuarioModel.criar).not.toHaveBeenCalled();
  });

  it("cria o usuário com a senha em hash (nunca em texto puro) quando o e-mail é livre", async () => {
    usuarioModel.buscarPorEmail.mockResolvedValue(null);
    usuarioModel.criar.mockImplementation(async (dados) => ({ id: 10, ...dados }));

    const resultado = await authService.registrar({
      nome: "Fulano",
      email: "novo@teste.com",
      senha: "123456",
    });

    expect(usuarioModel.criar).toHaveBeenCalledTimes(1);
    const dadosEnviados = usuarioModel.criar.mock.calls[0][0];
    expect(dadosEnviados.senha).not.toBe("123456");
    expect(await bcrypt.compare("123456", dadosEnviados.senha)).toBe(true);
    expect(dadosEnviados.tipo).toBe("paciente");

    expect(resultado.token).toEqual(expect.any(String));
    expect(resultado.usuario.id).toBe(10);
  });
});

describe("authService.login", () => {
  beforeEach(() => jest.clearAllMocks());

  it("lança AuthError se o usuário não existir", async () => {
    usuarioModel.buscarPorEmail.mockResolvedValue(null);

    await expect(authService.login({ email: "ninguem@teste.com", senha: "123456" })).rejects.toThrow(
      AuthError
    );
  });

  it("lança AuthError se a senha estiver errada", async () => {
    const senhaHash = await bcrypt.hash("senhaCorreta", 4);
    usuarioModel.buscarPorEmail.mockResolvedValue({ id: 2, email: "a@a.com", senha: senhaHash, tipo: "paciente" });

    await expect(authService.login({ email: "a@a.com", senha: "senhaErrada" })).rejects.toThrow(AuthError);
  });

  it("retorna usuário (sem a senha) e token quando as credenciais conferem", async () => {
    const senhaHash = await bcrypt.hash("123456", 4);
    usuarioModel.buscarPorEmail.mockResolvedValue({
      id: 2,
      nome: "Paciente",
      email: "a@a.com",
      senha: senhaHash,
      tipo: "paciente",
    });

    const resultado = await authService.login({ email: "a@a.com", senha: "123456" });

    expect(resultado.usuario.senha).toBeUndefined();
    expect(resultado.token).toEqual(expect.any(String));
  });
});
