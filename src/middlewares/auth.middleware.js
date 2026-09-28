const { verificarToken } = require("../utils/jwt");
const { AuthError } = require("../utils/AppError");

// Protege rotas sensíveis: exige um header "Authorization: Bearer <token>"
// válido. Em caso de sucesso, anexa req.usuario = { id, tipo } vindo do token.
function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
    return next(new AuthError("Token não informado."));
  }

  const token = cabecalho.split(" ")[1];

  try {
    const payload = verificarToken(token);
    req.usuario = payload;
    next();
  } catch {
    next(new AuthError("Token inválido ou expirado."));
  }
}

module.exports = autenticar;
