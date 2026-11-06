import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { getEmpresa, postEmpresa, serializarAcessoEmpresa } from '../model/modelEmpresa.js';
import {
  contarGestores,
  deleteUsuario,
  getUsuario,
  getUsuarios,
  postUsuario,
  putUsuario
} from '../model/modelUsuario.js';
import {
  emailValido,
  normalizarCnpj,
  normalizarEmail,
  papelEmpresaValido,
  verificarCnpjDuplicado,
  verificarEmailDuplicado,
  loginUsuario
} from '../regrasNegocios/regraNegociosUsuarios.js';

const saltRounds = 10;

function usuarioSeguro(usuario) {
  return {
    id: String(usuario._id),
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    empresaId: usuario.empresaId
  };
}

function erroDeDuplicidade(error) {
  return error?.code === 11000;
}

export async function registrarEmpresa(req, res) {
  if (!req.body) return res.status(400).json({ error: 'Dados da empresa obrigatórios' });
  const { nomeEmpresa, cnpj, nome, email, senha } = req.body;
  const empresaNome = String(nomeEmpresa || '').trim();
  const usuarioNome = String(nome || '').trim();
  const cnpjNormalizado = normalizarCnpj(cnpj);
  const emailNormalizado = normalizarEmail(email);

  if (!req.body || !empresaNome || !usuarioNome || cnpjNormalizado.length !== 14 ||
      !emailValido(emailNormalizado) || typeof senha !== 'string' || senha.length < 8) {
    return res.status(400).json({ error: 'Informe os dados da empresa e do gestor; a senha deve ter ao menos 8 caracteres' });
  }

  let session;
  try {
    if (await verificarCnpjDuplicado(cnpjNormalizado) || await verificarEmailDuplicado(emailNormalizado)) {
      return res.status(409).json({ error: 'CNPJ ou e-mail já cadastrado' });
    }

    session = await mongoose.startSession();
    let novoUsuario;
    await session.withTransaction(async () => {
      const empresa = await postEmpresa(
        { nome: empresaNome, cnpj: cnpjNormalizado },
        { session }
      );
      novoUsuario = await postUsuario({
        nome: usuarioNome,
        email: emailNormalizado,
        senha: await bcrypt.hash(senha, saltRounds),
        empresaId: String(empresa._id),
        papel: 'gestor'
      }, { session });
    });

    return res.status(201).json({
      message: 'Empresa e gestor criados com sucesso',
      usuario: usuarioSeguro(novoUsuario)
    });
  } catch (error) {
    if (erroDeDuplicidade(error)) {
      return res.status(409).json({ error: 'CNPJ ou e-mail já cadastrado' });
    }
    console.error('Erro ao registrar empresa:', error);
    return res.status(500).json({ error: 'Erro ao criar empresa e gestor' });
  } finally {
    if (session) await session.endSession();
  }
}

export async function login(req, res) {
  try {
    const email = normalizarEmail(req.body?.email);
    const senha = req.body?.senha;
    const usuario = await loginUsuario(email);

    if (!usuario || typeof senha !== 'string' || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    let empresa = null;
    if (usuario.papel !== 'admin') {
      if (!usuario.empresaId) {
        return res.status(401).json({ error: 'Email ou senha incorretos' });
      }
      const dadosEmpresa = await getEmpresa(usuario.empresaId);
      if (!dadosEmpresa) {
        return res.status(401).json({ error: 'Email ou senha incorretos' });
      }
      empresa = {
        id: String(dadosEmpresa._id),
        nome: dadosEmpresa.nome,
        cnpj: dadosEmpresa.cnpj
      };
    }

    const token = jwt.sign(
      { usuarioId: String(usuario._id) },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '6h' }
    );

    return res.status(200).json({
      message: 'Login realizado com sucesso',
      usuario: {
        id: String(usuario._id),
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
        empresa
      },
      token
    });
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    return res.status(500).json({ error: 'Erro ao realizar login' });
  }
}

export async function buscarUsuarios(req, res) {
  try {
    const usuarios = await getUsuarios(req.empresaId);
    return res.status(200).json(usuarios.map(usuarioSeguro));
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    return res.status(500).json({ error: 'Erro ao obter usuários' });
  }
}

export async function criarUsuario(req, res) {
  if (!req.body) return res.status(400).json({ error: 'Dados do usuário obrigatórios' });
  const nome = String(req.body.nome || '').trim();
  const email = normalizarEmail(req.body.email);
  const { senha, papel } = req.body;

  if (!nome || !emailValido(email) || typeof senha !== 'string' || senha.length < 8 ||
      !papelEmpresaValido(papel)) {
    return res.status(400).json({ error: 'Informe nome, e-mail válido, senha com ao menos 8 caracteres e papel válido' });
  }

  try {
    if (await verificarEmailDuplicado(email)) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }

    const usuario = await postUsuario({
      nome,
      email,
      senha: await bcrypt.hash(senha, saltRounds),
      empresaId: req.empresaId,
      papel
    });
    return res.status(201).json(usuarioSeguro(usuario));
  } catch (error) {
    if (erroDeDuplicidade(error)) return res.status(409).json({ error: 'E-mail já cadastrado' });
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ error: 'Erro ao criar usuário' });
  }
}

export async function atualizarUsuario(req, res) {
  if (!req.body) return res.status(400).json({ error: 'Dados do usuário obrigatórios' });
  const nome = String(req.body.nome || '').trim();
  const email = normalizarEmail(req.body.email);
  const { senha, papel } = req.body;
  if (!nome || !emailValido(email) || !papelEmpresaValido(papel) ||
      (senha !== undefined && senha !== '' && (typeof senha !== 'string' || senha.length < 8))) {
    return res.status(400).json({ error: 'Informe nome, e-mail válido, papel válido e, se desejar alterar a senha, use ao menos 8 caracteres' });
  }

  let session;
  try {
    const senhaHash = typeof senha === 'string' && senha.length > 0
      ? await bcrypt.hash(senha, saltRounds)
      : undefined;
    session = await mongoose.startSession();
    let resultado;
    await session.withTransaction(async () => {
      await serializarAcessoEmpresa(req.empresaId, session);
      const usuarioAtual = await getUsuario(req.params.id, req.empresaId, { session });
      if (!usuarioAtual) {
        resultado = { status: 404, body: { error: 'Usuário não encontrado' } };
        return;
      }

      if (email !== normalizarEmail(usuarioAtual.email)) {
        const usuarioComEmail = await verificarEmailDuplicado(email);
        if (usuarioComEmail && String(usuarioComEmail._id) !== String(usuarioAtual._id)) {
          resultado = { status: 409, body: { error: 'E-mail já cadastrado' } };
          return;
        }
      }

      if (usuarioAtual.papel === 'gestor' && papel !== 'gestor' &&
          await contarGestores(req.empresaId, { session }) <= 1) {
        resultado = { status: 409, body: { error: 'A empresa precisa manter ao menos um gestor' } };
        return;
      }

      const atualizado = await putUsuario(
        req.params.id,
        req.empresaId,
        { nome, email, papel, ...(senhaHash ? { senha: senhaHash } : {}) },
        { session }
      );
      resultado = atualizado
        ? { status: 200, body: usuarioSeguro(atualizado) }
        : { status: 404, body: { error: 'Usuário não encontrado' } };
    });
    return res.status(resultado.status).json(resultado.body);
  } catch (error) {
    if (erroDeDuplicidade(error)) return res.status(409).json({ error: 'E-mail já cadastrado' });
    console.error('Erro ao atualizar usuário:', error);
    return res.status(500).json({ error: 'Erro ao atualizar usuário' });
  } finally {
    if (session) await session.endSession();
  }
}

export async function apagarUsuario(req, res) {
  let session;
  try {
    session = await mongoose.startSession();
    let resultado;
    await session.withTransaction(async () => {
      await serializarAcessoEmpresa(req.empresaId, session);
      const usuario = await getUsuario(req.params.id, req.empresaId, { session });
      if (!usuario) {
        resultado = { status: 404, body: { error: 'Usuário não encontrado' } };
        return;
      }
      if (String(usuario._id) === req.usuario.id) {
        resultado = { status: 403, body: { error: 'Você não pode remover a própria conta' } };
        return;
      }
      if (usuario.papel === 'gestor' &&
          await contarGestores(req.empresaId, { session }) <= 1) {
        resultado = { status: 409, body: { error: 'A empresa precisa manter ao menos um gestor' } };
        return;
      }

      const removido = await deleteUsuario(req.params.id, req.empresaId, { session });
      resultado = removido
        ? { status: 200, body: { message: 'Usuário removido com sucesso' } }
        : { status: 404, body: { error: 'Usuário não encontrado' } };
    });
    return res.status(resultado.status).json(resultado.body);
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    return res.status(500).json({ error: 'Erro ao remover usuário' });
  } finally {
    if (session) await session.endSession();
  }
}
