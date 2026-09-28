// Função pura (sem I/O), fácil de testar isoladamente: recebe uma data
// "AAAA-MM-DD" e diz se cai em sábado ou domingo.
function ehFimDeSemana(dataISO) {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  const diaSemana = new Date(ano, mes - 1, dia).getDay();
  return diaSemana === 0 || diaSemana === 6;
}

module.exports = { ehFimDeSemana };
