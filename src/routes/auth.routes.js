const { Router } = require("express");
const controller = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const autenticar = require("../middlewares/auth.middleware");
const { registroSchema, loginSchema } = require("../validations/auth.validation");

const router = Router();

router.post("/registro", validate(registroSchema), controller.registrar);
router.post("/login", validate(loginSchema), controller.login);
router.get("/perfil", autenticar, controller.perfil);

module.exports = router;
