const { Router } = require("express");
const authRoutes = require("./auth.routes");
const medicosRoutes = require("./medicos.routes");
const consultasRoutes = require("./consultas.routes");

const router = Router();

router.get("/", (req, res) => {
  res.json({ sucesso: true, mensagem: "Clique Saúde API — v1", saudavel: true });
});

router.use("/auth", authRoutes);
router.use("/medicos", medicosRoutes);
router.use("/consultas", consultasRoutes);

module.exports = router;
