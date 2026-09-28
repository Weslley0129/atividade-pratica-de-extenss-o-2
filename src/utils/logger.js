const fs = require("fs");
const path = require("path");

const PASTA_LOGS = path.join(__dirname, "..", "..", "logs");
const ARQUIVO_ERROS = path.join(PASTA_LOGS, "erros.log");

if (!fs.existsSync(PASTA_LOGS)) {
  fs.mkdirSync(PASTA_LOGS, { recursive: true });
}

function logInfo(mensagem) {
  console.log(`[INFO] ${new Date().toISOString()} — ${mensagem}`);
}

// Toda exceção não tratada (erros de programação, falhas do Prisma, etc.)
// passa por aqui: fica no console E gravada em arquivo, para auditoria.
function logError(erro, contexto = {}) {
  const linha = `[ERROR] ${new Date().toISOString()} — ${erro.message}\n${JSON.stringify(
    contexto
  )}\n${erro.stack}\n\n`;
  console.error(linha);
  try {
    fs.appendFileSync(ARQUIVO_ERROS, linha);
  } catch {
    // se nem o log der pra escrever, não derruba a aplicação por isso
  }
}

module.exports = { logInfo, logError };
