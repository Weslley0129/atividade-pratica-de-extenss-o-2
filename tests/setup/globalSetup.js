const { execSync } = require("child_process");

// Roda uma vez antes de toda a suíte: aplica as migrations no banco de
// teste (o mesmo arquivo .db configurado em DATABASE_URL pelo script "test").
module.exports = async () => {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
};
