// Cai aqui quando nenhuma rota bateu com a requisição (ex: URL errada).
function notFound(req, res) {
  res.status(404).json({
    sucesso: false,
    codigo: "ERRO_NAO_ENCONTRADO",
    mensagem: `Rota ${req.method} ${req.originalUrl} não existe.`,
  });
}

module.exports = notFound;
