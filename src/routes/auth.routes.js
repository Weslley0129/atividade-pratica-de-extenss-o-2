const { Router } = require("express");
const controller = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const autenticar = require("../middlewares/auth.middleware");
const { registroSchema, loginSchema } = require("../validations/auth.validation");

const router = Router();

/**
 * @openapi
 * /auth/registro:
 *   post:
 *     tags: [Autenticação]
 *     summary: Cria um novo paciente
 *     description: Cadastra um paciente novo (tipo "paciente" fixo — contas admin são criadas via seed). A senha é armazenada com hash bcrypt.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, email, senha]
 *             properties:
 *               nome: { type: string, example: "Weslley Santos" }
 *               email: { type: string, format: email, example: "novo.paciente@cliquesaude.com" }
 *               senha: { type: string, format: password, minLength: 6, example: "123456" }
 *     responses:
 *       201:
 *         description: Paciente criado com sucesso — retorna o usuário e um token JWT já autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso: { type: boolean, example: true }
 *                 dados:
 *                   type: object
 *                   properties:
 *                     usuario: { $ref: '#/components/schemas/Usuario' }
 *                     token: { type: string, example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
 *       400:
 *         description: Dados inválidos (nome curto, e-mail inválido, senha curta).
 *         $ref: '#/components/responses/ErroValidacao'
 *       409:
 *         description: Já existe um usuário com esse e-mail.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErroResposta' }
 */
router.post("/registro", validate(registroSchema), controller.registrar);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Autenticação]
 *     summary: Autentica um usuário
 *     description: Valida e-mail/senha e retorna um token JWT válido por JWT_EXPIRES_IN (padrão da API).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, senha]
 *             properties:
 *               email: { type: string, format: email, example: "paciente@cliquesaude.com" }
 *               senha: { type: string, format: password, example: "123456" }
 *     responses:
 *       200:
 *         description: Login efetuado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso: { type: boolean, example: true }
 *                 dados:
 *                   type: object
 *                   properties:
 *                     usuario: { $ref: '#/components/schemas/Usuario' }
 *                     token: { type: string, example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       401:
 *         description: E-mail ou senha incorretos.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErroResposta' }
 */
router.post("/login", validate(loginSchema), controller.login);

/**
 * @openapi
 * /auth/perfil:
 *   get:
 *     tags: [Autenticação]
 *     summary: Dados do usuário logado
 *     description: Retorna o usuário correspondente ao token JWT enviado.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Usuário autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso: { type: boolean, example: true }
 *                 dados: { $ref: '#/components/schemas/Usuario' }
 *       401:
 *         $ref: '#/components/responses/NaoAutenticado'
 */
router.get("/perfil", autenticar, controller.perfil);

module.exports = router;
