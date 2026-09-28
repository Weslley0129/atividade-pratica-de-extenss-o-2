const { z } = require("zod");

const registroSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres."),
  email: z.string().trim().email("E-mail inválido."),
  senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres."),
});

const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido."),
  senha: z.string().min(1, "Senha é obrigatória."),
});

module.exports = { registroSchema, loginSchema };
