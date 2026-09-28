const { Router } = require("express");
const controller = require("../controllers/medicos.controller");
const validate = require("../middlewares/validate.middleware");
const autenticar = require("../middlewares/auth.middleware");
const exigirAdmin = require("../middlewares/admin.middleware");
const { criarMedicoSchema, atualizarMedicoSchema } = require("../validations/medico.validation");

const router = Router();

/**
 * @openapi
 * /medicos:
 *   get:
 *     tags: [Médicos]
 *     summary: Lista médicos
 *     description: Lista todos os médicos cadastrados, com filtro opcional por especialidade.
 *     parameters:
 *       - in: query
 *         name: especialidade
 *         schema: { type: string }
 *         required: false
 *         example: Cardiologia
 *         description: Filtra os médicos por especialidade exata.
 *     responses:
 *       200:
 *         description: Lista de médicos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso: { type: boolean, example: true }
 *                 dados: { type: array, items: { $ref: '#/components/schemas/Medico' } }
 */
router.get("/", controller.listar);

/**
 * @openapi
 * /medicos/especialidades:
 *   get:
 *     tags: [Médicos]
 *     summary: Lista as especialidades cadastradas
 *     description: Retorna a lista de especialidades únicas entre os médicos cadastrados, usada para popular filtros no front-end.
 *     responses:
 *       200:
 *         description: Lista de especialidades.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso: { type: boolean, example: true }
 *                 dados: { type: array, items: { type: string }, example: ["Cardiologia", "Pediatria", "Dermatologia"] }
 */
router.get("/especialidades", controller.listarEspecialidades);

/**
 * @openapi
 * /medicos/{id}:
 *   get:
 *     tags: [Médicos]
 *     summary: Detalhe de um médico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Médico encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso: { type: boolean, example: true }
 *                 dados: { $ref: '#/components/schemas/Medico' }
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 */
router.get("/:id", controller.buscarPorId);

/**
 * @openapi
 * /medicos/{id}/horarios:
 *   get:
 *     tags: [Médicos]
 *     summary: Horários fixos de um médico
 *     description: Lista a agenda fixa semanal do médico (dia da semana + horário), usada para saber quando ele atende antes de checar disponibilidade numa data específica.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Horários fixos do médico.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso: { type: boolean, example: true }
 *                 dados: { type: array, items: { $ref: '#/components/schemas/HorarioDisponivel' } }
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 */
router.get("/:id/horarios", controller.horarios);

/**
 * @openapi
 * /medicos:
 *   post:
 *     tags: [Médicos]
 *     summary: Cadastra um médico (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, crm, especialidade, valorConsulta]
 *             properties:
 *               nome: { type: string, example: "Dra. Carla Nunes" }
 *               crm: { type: string, example: "CRM-SP 10234" }
 *               especialidade: { type: string, example: "Cardiologia" }
 *               valorConsulta: { type: number, example: 250 }
 *     responses:
 *       201:
 *         description: Médico criado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso: { type: boolean, example: true }
 *                 dados: { $ref: '#/components/schemas/Medico' }
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       401:
 *         $ref: '#/components/responses/NaoAutenticado'
 *       403:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       409:
 *         description: Já existe um médico com esse CRM.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErroResposta' }
 */
router.post("/", autenticar, exigirAdmin, validate(criarMedicoSchema), controller.criar);

/**
 * @openapi
 * /medicos/{id}:
 *   put:
 *     tags: [Médicos]
 *     summary: Atualiza um médico (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Todos os campos são opcionais — envie apenas os que quer alterar.
 *             properties:
 *               nome: { type: string }
 *               crm: { type: string }
 *               especialidade: { type: string }
 *               valorConsulta: { type: number }
 *     responses:
 *       200:
 *         description: Médico atualizado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso: { type: boolean, example: true }
 *                 dados: { $ref: '#/components/schemas/Medico' }
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       401:
 *         $ref: '#/components/responses/NaoAutenticado'
 *       403:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 */
router.put("/:id", autenticar, exigirAdmin, validate(atualizarMedicoSchema), controller.atualizar);

/**
 * @openapi
 * /medicos/{id}:
 *   delete:
 *     tags: [Médicos]
 *     summary: Remove um médico (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 6
 *     responses:
 *       200:
 *         description: Médico removido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso: { type: boolean, example: true }
 *                 dados: { type: object, properties: { id: { type: integer, example: 6 } } }
 *       401:
 *         $ref: '#/components/responses/NaoAutenticado'
 *       403:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 */
router.delete("/:id", autenticar, exigirAdmin, controller.remover);

module.exports = router;
