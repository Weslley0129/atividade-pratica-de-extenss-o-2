const { z } = require("zod");

const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;
const REGEX_HORA = /^\d{2}:\d{2}$/;

const criarConsultaSchema = z.object({
  medicoId: z.number().int().positive("medicoId inválido."),
  data: z.string().regex(REGEX_DATA, "Data deve estar no formato AAAA-MM-DD."),
  hora: z.string().regex(REGEX_HORA, "Hora deve estar no formato HH:MM."),
  observacoes: z.string().trim().max(500).optional(),
});

const atualizarConsultaSchema = z.object({
  status: z.enum(["Agendado", "Realizado", "Cancelado"]).optional(),
  observacoes: z.string().trim().max(500).optional(),
});

module.exports = { criarConsultaSchema, atualizarConsultaSchema };
