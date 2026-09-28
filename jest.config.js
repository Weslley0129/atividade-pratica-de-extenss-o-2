module.exports = {
  testEnvironment: "node",
  globalSetup: "<rootDir>/tests/setup/globalSetup.js",
  setupFilesAfterEnv: ["<rootDir>/tests/setup/jestSetup.js"],
  testPathIgnorePatterns: ["/node_modules/"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js", // ponto de entrada: sobe o processo, não faz sentido "testar"
    "!src/config/prismaClient.js", // só instancia o client, sem lógica própria
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  },
  coverageReporters: ["text", "text-summary", "lcov", "html"],
};
