import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import { postUsuario, Usuario } from '../model/modelUsuario.js';

function emailCaseInsensitive(email) {
  const escapado = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escapado}$`, 'i');
}

async function criarAdmin() {
  const nome = String(process.env.ADMIN_NOME || '').trim();
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const senha = process.env.ADMIN_SENHA || '';

  if (!process.env.MONGO_URI) throw new Error('MONGO_URI não configurada.');
  if (!nome || !email || senha.length < 8) {
    throw new Error('Configure ADMIN_NOME, ADMIN_EMAIL e ADMIN_SENHA (mínimo 8 caracteres).');
  }

  await mongoose.connect(process.env.MONGO_URI);
  const existente = await Usuario.findOne({ email: emailCaseInsensitive(email) });
  if (existente) throw new Error('Já existe um usuário com esse e-mail.');

  await postUsuario({
    nome,
    email,
    senha: await bcrypt.hash(senha, 10),
    papel: 'admin'
  });
  console.log('Administrador criado com sucesso.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  criarAdmin()
    .catch((error) => {
      console.error('Erro ao criar administrador:', error.message);
      process.exitCode = 1;
    })
    .finally(async () => {
      await mongoose.disconnect();
    });
}
