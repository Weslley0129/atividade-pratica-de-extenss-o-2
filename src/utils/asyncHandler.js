// Evita repetir try/catch em cada controller assíncrono: qualquer rejeição
// da Promise é encaminhada automaticamente para o errorHandler via next().
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = asyncHandler;
