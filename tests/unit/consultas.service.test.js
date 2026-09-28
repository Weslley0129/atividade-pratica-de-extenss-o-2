jest.mock("../../src/models/consulta.model");
jest.mock("../../src/models/medico.model");

const consultaModel = require("../../src/models/consulta.model");
const medicoModel = require("../../src/models/medico.model");
const consultasService = require("../../src/services/consultas.service");
const { medicoExemplo, consultaExemplo } = require("../fixtures/dados");
const { ValidationError, ConflictError, NotFoundError, ForbiddenError } = require("../../src/utils/AppError");

beforeEach(() => jest.clearAllMocks());

describe("consultasService.agendar", () => {
  it("lança NotFoundError se o médico não existir", async () => {
    medicoModel.buscarPorId.mockResolvedValue(null);

    await expect(
      consultasService.agendar(2, { medicoId: 99, data: "2026-10-05", hora: "08:00" })
    ).rejects.toThrow(NotFoundError);
  });

  it("lança ValidationError em fim de semana (sábado)", async () => {
    medicoModel.buscarPorId.mockResolvedValue(medicoExemplo);

    await expect(
      consultasService.agendar(2, { medicoId: 1, data: "2026-10-03", hora: "08:00" })
    ).rejects.toThrow(ValidationError);

    expect(consultaModel.buscarConflito).not.toHaveBeenCalled();
  });

  it("lança ConflictError se o horário já estiver ocupado", async () => {
    medicoModel.buscarPorId.mockResolvedValue(medicoExemplo);
    consultaModel.buscarConflito.mockResolvedValue(consultaExemplo);

    await expect(
      consultasService.agendar(2, { medicoId: 1, data: "2026-10-05", hora: "09:00" })
    ).rejects.toThrow(ConflictError);

    expect(consultaModel.criar).not.toHaveBeenCalled();
  });

  it("cria a consulta quando data, médico e horário são válidos", async () => {
    medicoModel.buscarPorId.mockResolvedValue(medicoExemplo);
    consultaModel.buscarConflito.mockResolvedValue(null);
    consultaModel.criar.mockResolvedValue({ id: 5, status: "Agendado" });

    const resultado = await consultasService.agendar(2, {
      medicoId: 1,
      data: "2026-10-05",
      hora: "08:00",
      observacoes: "Retorno",
    });

    expect(consultaModel.criar).toHaveBeenCalledWith({
      pacienteId: 2,
      medicoId: 1,
      data: "2026-10-05",
      hora: "08:00",
      observacoes: "Retorno",
    });
    expect(resultado.id).toBe(5);
  });
});

describe("consultasService.atualizar", () => {
  const usuarioDono = { id: 2, tipo: "paciente" };
  const usuarioOutroPaciente = { id: 999, tipo: "paciente" };
  const usuarioAdmin = { id: 1, tipo: "admin" };

  it("lança NotFoundError se a consulta não existir", async () => {
    consultaModel.buscarPorId.mockResolvedValue(null);
    await expect(consultasService.atualizar(1, usuarioDono, {})).rejects.toThrow(NotFoundError);
  });

  it("lança ForbiddenError se o usuário não for dono nem admin", async () => {
    consultaModel.buscarPorId.mockResolvedValue(consultaExemplo);
    await expect(consultasService.atualizar(1, usuarioOutroPaciente, { status: "Cancelado" })).rejects.toThrow(
      ForbiddenError
    );
  });

  it("lança ForbiddenError se um paciente tentar marcar como Realizado", async () => {
    consultaModel.buscarPorId.mockResolvedValue(consultaExemplo);
    await expect(consultasService.atualizar(1, usuarioDono, { status: "Realizado" })).rejects.toThrow(
      ForbiddenError
    );
  });

  it("permite que o próprio paciente cancele a consulta", async () => {
    consultaModel.buscarPorId.mockResolvedValue(consultaExemplo);
    consultaModel.atualizar.mockResolvedValue({ ...consultaExemplo, status: "Cancelado" });

    const resultado = await consultasService.atualizar(1, usuarioDono, { status: "Cancelado" });
    expect(resultado.status).toBe("Cancelado");
  });

  it("lança ConflictError se a consulta já estiver cancelada", async () => {
    consultaModel.buscarPorId.mockResolvedValue({ ...consultaExemplo, status: "Cancelado" });
    await expect(consultasService.atualizar(1, usuarioAdmin, { status: "Realizado" })).rejects.toThrow(
      ConflictError
    );
  });

  it("permite que o admin marque como Realizado", async () => {
    consultaModel.buscarPorId.mockResolvedValue(consultaExemplo);
    consultaModel.atualizar.mockResolvedValue({ ...consultaExemplo, status: "Realizado" });

    const resultado = await consultasService.atualizar(1, usuarioAdmin, { status: "Realizado" });
    expect(resultado.status).toBe("Realizado");
  });
});

describe("consultasService.remover", () => {
  it("lança ForbiddenError se quem chama não for admin", async () => {
    await expect(consultasService.remover(1, { id: 2, tipo: "paciente" })).rejects.toThrow(ForbiddenError);
    expect(consultaModel.remover).not.toHaveBeenCalled();
  });

  it("lança NotFoundError se a consulta não existir", async () => {
    consultaModel.buscarPorId.mockResolvedValue(null);
    await expect(consultasService.remover(1, { id: 1, tipo: "admin" })).rejects.toThrow(NotFoundError);
  });

  it("remove quando o chamador é admin e a consulta existe", async () => {
    consultaModel.buscarPorId.mockResolvedValue(consultaExemplo);
    consultaModel.remover.mockResolvedValue(undefined);

    await consultasService.remover(1, { id: 1, tipo: "admin" });
    expect(consultaModel.remover).toHaveBeenCalledWith(1);
  });
});
