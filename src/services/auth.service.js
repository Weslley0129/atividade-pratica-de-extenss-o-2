const bcrypt = require("bcryptjs");
const usuarioModel = require("../models/usuario.model");
const { gerarToken } = require("../utils/jwt");
const { ConflictError, AuthError } = require("../utils/AppError");

const SALT_ROUNDS = 10;

async function registrar({ nome, email, senha }) {
  const existente = await usuarioModel.buscarPorEmail(email);
  if (existente) {
    throw new ConflictError("Já existe uma conta com esse e-mail.");
  }

  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
  const usuario = await usuarioModel.criar({ nome, email, senha: senhaHash, tipo: "paciente" });

  const token = gerarToken({ id: usuario.id, tipo: usuario.tipo });
  return { usuario, token };
}

async function login({ email, senha }) {
  const usuario = await usuarioModel.buscarPorEmail(email);
  if (!usuario) {
    throw new AuthError("E-mail ou senha inválidos.");
  }

  const senhaConfere = await bcrypt.compare(senha, usuario.senha);
  if (!senhaConfere) {
    throw new AuthError("E-mail ou senha inválidos.");
  }

  const token = gerarToken({ id: usuario.id, tipo: usuario.tipo });
  const { senha: _senha, ...usuarioSemSenha } = usuario;
  return { usuario: usuarioSemSenha, token };
}

async function buscarPerfil(id) {
  const usuario = await usuarioModel.buscarPorId(id);
  if (!usuario) {
    throw new AuthError("Usuário não encontrado.");
  }
  return usuario;
}

module.exports = { registrar, login, buscarPerfil };
