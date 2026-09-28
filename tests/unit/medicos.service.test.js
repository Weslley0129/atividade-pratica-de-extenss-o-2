jest.mock("../../src/models/medico.model");
const medicoModel = require("../../src/models/medico.model");
const medicosService = require("../../src/services/medicos.service");
const { medicoExemplo } = require("../fixtures/dados");
const { NotFoundError, ConflictError } = require("../../src/utils/AppError");

beforeEach(() => jest.clearAllMocks());

describe("medicosService.buscarPorId", () => {
  it("lança NotFoundError quando o médico não existe", async () => {
    medicoModel.buscarPorId.mockResolvedValue(null);
    await expect(medicosService.buscarPorId(999)).rejects.toThrow(NotFoundError);
  });

  it("retorna o médico quando ele existe", async () => {
    medicoModel.buscarPorId.mockResolvedValue(medicoExemplo);
    const resultado = await medicosService.buscarPorId(1);
    expect(resultado).toEqual(medicoExemplo);
  });
});

describe("medicosService.criar", () => {
  it("lança ConflictError se já existir médico com o mesmo CRM", async () => {
    medicoModel.buscarPorCrm.mockResolvedValue(medicoExemplo);
    await expect(medicosService.criar({ crm: medicoExemplo.crm })).rejects.toThrow(ConflictError);
    expect(medicoModel.criar).not.toHaveBeenCalled();
  });

  it("cria o médico quando o CRM é novo", async () => {
    medicoModel.buscarPorCrm.mockResolvedValue(null);
    medicoModel.criar.mockResolvedValue({ ...medicoExemplo, crm: "CRM-NOVO", id: 9 });

    const resultado = await medicosService.criar({ ...medicoExemplo, crm: "CRM-NOVO" });
    expect(resultado.id).toBe(9);
  });
});

describe("medicosService.atualizar / remover", () => {
  it("atualizar lança NotFoundError se o médico não existir", async () => {
    medicoModel.buscarPorId.mockResolvedValue(null);
    await expect(medicosService.atualizar(999, { nome: "X" })).rejects.toThrow(NotFoundError);
  });

  it("remover lança NotFoundError se o médico não existir", async () => {
    medicoModel.buscarPorId.mockResolvedValue(null);
    await expect(medicosService.remover(999)).rejects.toThrow(NotFoundError);
  });

  it("remover chama o model quando o médico existe", async () => {
    medicoModel.buscarPorId.mockResolvedValue(medicoExemplo);
    medicoModel.remover.mockResolvedValue(undefined);

    await medicosService.remover(1);
    expect(medicoModel.remover).toHaveBeenCalledWith(1);
  });
});
