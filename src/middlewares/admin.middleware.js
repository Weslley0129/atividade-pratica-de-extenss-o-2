const { ForbiddenError } = require("../utils/AppError");

// Usado depois de "autenticar": exige que o usuário logado seja admin.
function exigirAdmin(req, res, next) {
  if (req.usuario?.tipo !== "admin") {
    return next(new ForbiddenError("Apenas administradores podem realizar essa ação."));
  }
  next();
}

module.exports = exigirAdmin;
