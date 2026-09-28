const { ehFimDeSemana } = require("../../src/utils/data");

describe("ehFimDeSemana", () => {
  it("retorna true para um sábado", () => {
    expect(ehFimDeSemana("2026-10-03")).toBe(true); // sábado
  });

  it("retorna true para um domingo", () => {
    expect(ehFimDeSemana("2026-10-04")).toBe(true); // domingo
  });

  it("retorna false para um dia de semana", () => {
    expect(ehFimDeSemana("2026-10-05")).toBe(false); // segunda
    expect(ehFimDeSemana("2026-10-07")).toBe(false); // quarta
    expect(ehFimDeSemana("2026-10-09")).toBe(false); // sexta
  });
});
