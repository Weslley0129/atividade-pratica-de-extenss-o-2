const { Router } = require("express");
const controller = require("../controllers/medicos.controller");
const validate = require("../middlewares/validate.middleware");
const autenticar = require("../middlewares/auth.middleware");
const exigirAdmin = require("../middlewares/admin.middleware");
const { criarMedicoSchema, atualizarMedicoSchema } = require("../validations/medico.validation");

const router = Router();

// Público
router.get("/", controller.listar);
router.get("/especialidades", controller.listarEspecialidades);
router.get("/:id", controller.buscarPorId);
router.get("/:id/horarios", controller.horarios);

// Somente admin
router.post("/", autenticar, exigirAdmin, validate(criarMedicoSchema), controller.criar);
router.put("/:id", autenticar, exigirAdmin, validate(atualizarMedicoSchema), controller.atualizar);
router.delete("/:id", autenticar, exigirAdmin, controller.remover);

module.exports = router;
