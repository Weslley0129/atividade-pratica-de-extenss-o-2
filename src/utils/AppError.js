// Erro de aplicação: toda vez que um controller/service sabe exatamente
// o que deu errado (validação, autenticação, recurso inexistente...),
// lança um destes em vez de um Error genérico. O middleware de erros
// (src/middlewares/errorHandler.js) sabe formatar a resposta a partir daqui.
class AppError extends Error {
  constructor(message, statusCode, codigo) {
    super(message);
    this.statusCode = statusCode;
    this.codigo = codigo;
    this.operacional = true; // erro esperado, não um bug
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, detalhes) {
    super(message, 400, "ERRO_VALIDACAO");
    this.detalhes = detalhes;
  }
}

class AuthError extends AppError {
  constructor(message = "Não autenticado.") {
    super(message, 401, "ERRO_AUTENTICACAO");
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Sem permissão para essa ação.") {
    super(message, 403, "ERRO_PERMISSAO");
  }
}

class NotFoundError extends AppError {
  constructor(message = "Recurso não encontrado.") {
    super(message, 404, "ERRO_NAO_ENCONTRADO");
  }
}

class ConflictError extends AppError {
  constructor(message = "Conflito com o estado atual do recurso.") {
    super(message, 409, "ERRO_CONFLITO");
  }
}

module.exports = { AppError, ValidationError, AuthError, ForbiddenError, NotFoundError, ConflictError };
