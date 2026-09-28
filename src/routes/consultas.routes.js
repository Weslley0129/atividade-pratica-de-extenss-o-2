const { Router } = require("express");
const controller = require("../controllers/consultas.controller");
const validate = require("../middlewares/validate.middleware");
const autenticar = require("../middlewares/auth.middleware");
const exigirAdmin = require("../middlewares/admin.middleware");
const { criarConsultaSchema, atualizarConsultaSchema } = require("../validations/consulta.validation");

const router = Router();

// Todas as rotas de consulta exigem login
router.use(autenticar);

/**
 * @openapi
 * /consultas/minhas:
 *   get:
 *     tags: [Consultas]
 *     summary: Consultas do paciente logado
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de consultas do paciente autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso: { type: boolean, example: true }
 *                 dados: { type: array, items: { $ref: '#/components/schemas/Consulta' } }
 *       401:
 *         $ref: '#/components/responses/NaoAutenticado'
 */
router.get("/minhas", controller.minhas);

/**
 * @openapi
 * /consultas:
 *   get:
 *     tags: [Consultas]
 *     summary: Lista todas as consultas (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema: { type: string, enum: [Agendado, Realizado, Cancelado] }
 *         example: Agendado
 *     responses:
 *       200:
 *         description: Lista de todas as consultas do sistema.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso: { type: boolean, example: true }
 *                 dados: { type: array, items: { $ref: '#/components/schemas/Consulta' } }
 *       401:
 *         $ref: '#/components/responses/NaoAutenticado'
 *       403:
 *         $ref: '#/components/responses/NaoAutorizado'
 */
router.get("/", exigirAdmin, controller.listarTodas);

/**
 * @openapi
 * /consultas:
 *   post:
 *     tags: [Consultas]
 *     summary: Agenda uma consulta
 *     description: Verifica se a data não é fim de semana, se o médico atende naquele dia/horário e se o horário já não está ocupado por outra consulta "Agendado".
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [medicoId, data, hora]
 *             properties:
 *               medicoId: { type: integer, example: 1 }
 *               data: { type: string, example: "2026-10-12", description: "Formato AAAA-MM-DD" }
 *               hora: { type: string, example: "08:00", description: "Formato HH:MM" }
 *               observacoes: { type: string, example: "Retorno", nullable: true }
 *     responses:
 *       201:
 *         description: Consulta agendada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso: { type: boolean, example: true }
 *                 dados: { $ref: '#/components/schemas/Consulta' }
 *       400:
 *         description: Dados inválidos, fim de semana ou médico não atende nesse dia/horário.
 *         $ref: '#/components/responses/ErroValidacao'
 *       401:
 *         $ref: '#/components/responses/NaoAutenticado'
 *       409:
 *         description: Horário já ocupado por outra consulta agendada.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErroResposta' }
 */
router.post("/", validate(criarConsultaSchema), controller.agendar);

/**
 * @openapi
 * /consultas/{id}:
 *   put:
 *     tags: [Consultas]
 *     summary: Atualiza status/observações de uma consulta
 *     description: O paciente só pode cancelar a própria consulta; o admin pode alterar para qualquer status.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [Agendado, Realizado, Cancelado], example: "Cancelado" }
 *               observacoes: { type: string, example: "Paciente remarcou." }
 *     responses:
 *       200:
 *         description: Consulta atualizada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso: { type: boolean, example: true }
 *                 dados: { $ref: '#/components/schemas/Consulta' }
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       401:
 *         $ref: '#/components/responses/NaoAutenticado'
 *       403:
 *         description: Paciente tentando alterar consulta de outro paciente, ou definir status que só o admin pode.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErroResposta' }
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 */
router.put("/:id", validate(atualizarConsultaSchema), controller.atualizar);

/**
 * @openapi
 * /consultas/{id}:
 *   delete:
 *     tags: [Consultas]
 *     summary: Exclui uma consulta definitivamente (admin)
 *     description: Diferente de cancelar (PUT com status "Cancelado"), este endpoint apaga o registro do banco — uso restrito a admin.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 5
 *     responses:
 *       200:
 *         description: Consulta excluída.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso: { type: boolean, example: true }
 *                 dados: { type: object, properties: { id: { type: integer, example: 5 } } }
 *       401:
 *         $ref: '#/components/responses/NaoAutenticado'
 *       403:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 */
router.delete("/:id", exigirAdmin, controller.remover);

module.exports = router;
