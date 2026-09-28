const { z } = require("zod");

const criarMedicoSchema = z.object({
  nome: z.string().trim().min(3, "Nome deve ter ao menos 3 caracteres."),
  crm: z.string().trim().min(3, "CRM inválido."),
  especialidade: z.string().trim().min(3, "Especialidade inválida."),
  valorConsulta: z.number().positive("Valor da consulta deve ser positivo."),
});

const atualizarMedicoSchema = criarMedicoSchema.partial();

module.exports = { criarMedicoSchema, atualizarMedicoSchema };
