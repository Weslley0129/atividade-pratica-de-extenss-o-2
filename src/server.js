require("dotenv").config();
const app = require("./app");
const { logInfo } = require("./utils/logger");

const PORTA = process.env.PORT || 3333;

app.listen(PORTA, () => {
  logInfo(`Clique Saúde API rodando em http://localhost:${PORTA}/api`);
});
