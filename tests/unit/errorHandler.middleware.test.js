const errorHandler = require("../../src/middlewares/errorHandler.middleware");
const { ValidationError, NotFoundError } = require("../../src/utils/AppError");
const { Prisma } = require("@prisma/client");

function criarErroPrisma(code, meta) {
  return new Prisma.PrismaClientKnownRequestError("erro simulado do prisma", {
    code,
    clientVersion: "5.22.0",
    meta,
  });
}

function criarResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("errorHandler", () => {
  const req = { originalUrl: "/api/teste", method: "GET" };

  it("formata um AppError com o status code e código corretos", () => {
    const res = criarResMock();
    errorHandler(new NotFoundError("Não achei."), req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ sucesso: false, codigo: "ERRO_NAO_ENCONTRADO", mensagem: "Não achei." })
    );
  });

  it("inclui 'detalhes' quando o erro de validação os fornece", () => {
    const res = criarResMock();
    errorHandler(new ValidationError("Dados inválidos.", [{ campo: "email", mensagem: "obrigatório" }]), req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].detalhes).toEqual([{ campo: "email", mensagem: "obrigatório" }]);
  });

  it("mapeia violação de unicidade do Prisma (P2002) para 409", () => {
    const res = criarResMock();
    errorHandler(criarErroPrisma("P2002", { target: ["email"] }), req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json.mock.calls[0][0].codigo).toBe("ERRO_CONFLITO");
  });

  it("mapeia registro não encontrado do Prisma (P2025) para 404", () => {
    const res = criarResMock();
    errorHandler(criarErroPrisma("P2025"), req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json.mock.calls[0][0].codigo).toBe("ERRO_NAO_ENCONTRADO");
  });

  it("transforma qualquer erro inesperado em 500 sem vazar detalhes internos", () => {
    const res = criarResMock();
    errorHandler(new Error("algo explodiu no driver do banco"), req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    const corpo = res.json.mock.calls[0][0];
    expect(corpo).toEqual({ sucesso: false, codigo: "ERRO_INTERNO", mensagem: "Erro interno do servidor." });
    expect(JSON.stringify(corpo)).not.toContain("driver do banco");
  });
});
