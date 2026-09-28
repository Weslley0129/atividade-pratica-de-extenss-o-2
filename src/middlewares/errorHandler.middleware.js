const { AppError } = require("../utils/AppError");
const { logError } = require("../utils/logger");
const { Prisma } = require("@prisma/client");

// Middleware global de erros — precisa ser o ÚLTIMO "app.use" registrado.
// Qualquer erro passado para next(erro) em qualquer rota/controller/service
// cai aqui, e toda resposta de erro da API sai neste único formato:
//   { sucesso: false, codigo, mensagem, detalhes? }
function errorHandler(erro, req, res, next) { // eslint-disable-line no-unused-vars
  // 1) Erros esperados da aplicação (validação, auth, not found...)
  if (erro instanceof AppError) {
    return res.status(erro.statusCode).json({
      sucesso: false,
      codigo: erro.codigo,
      mensagem: erro.message,
      ...(erro.detalhes ? { detalhes: erro.detalhes } : {}),
    });
  }

  // 2) Erros conhecidos do Prisma (ex: violação de unique constraint)
  if (erro instanceof Prisma.PrismaClientKnownRequestError) {
    if (erro.code === "P2002") {
      return res.status(409).json({
        sucesso: false,
        codigo: "ERRO_CONFLITO",
        mensagem: `Já existe um registro com esse valor único (${erro.meta?.target}).`,
      });
    }
    if (erro.code === "P2025") {
      return res.status(404).json({
        sucesso: false,
        codigo: "ERRO_NAO_ENCONTRADO",
        mensagem: "Registro não encontrado.",
      });
    }
  }

  // 3) Qualquer outra exceção inesperada: loga para auditoria e nunca
  //    vaza detalhes internos (stack trace, mensagem do driver) ao cliente.
  logError(erro, { rota: req.originalUrl, metodo: req.method });

  return res.status(500).json({
    sucesso: false,
    codigo: "ERRO_INTERNO",
    mensagem: "Erro interno do servidor.",
  });
}

module.exports = errorHandler;
