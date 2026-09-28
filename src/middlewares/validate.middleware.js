const { ZodError } = require("zod");
const { ValidationError } = require("../utils/AppError");

// Recebe um schema Zod e devolve um middleware que valida req.body,
// substituindo-o pelos dados já convertidos (ex: string -> number).
function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (erro) {
      if (erro instanceof ZodError) {
        const detalhes = erro.issues.map((i) => ({ campo: i.path.join("."), mensagem: i.message }));
        return next(new ValidationError("Dados inválidos.", detalhes));
      }
      next(erro);
    }
  };
}

module.exports = validate;
