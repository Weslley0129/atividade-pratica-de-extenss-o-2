const { Router } = require("express");
const controller = require("../controllers/consultas.controller");
const validate = require("../middlewares/validate.middleware");
const autenticar = require("../middlewares/auth.middleware");
const exigirAdmin = require("../middlewares/admin.middleware");
const { criarConsultaSchema, atualizarConsultaSchema } = require("../validations/consulta.validation");

const router = Router();

// Todas as rotas de consulta exigem login
router.use(autenticar);

router.get("/minhas", controller.minhas);
router.get("/", exigirAdmin, controller.listarTodas);
router.post("/", validate(criarConsultaSchema), controller.agendar);
router.put("/:id", validate(atualizarConsultaSchema), controller.atualizar);
router.delete("/:id", exigirAdmin, controller.remover);

module.exports = router;
