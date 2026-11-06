import mongoose from 'mongoose';
import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import { Empresa } from '../model/modelEmpresa.js';
import { Usuario } from '../model/modelUsuario.js';

function normalizarCnpj(cnpj) {
  return String(cnpj || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
}

function normalizarEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function migrarEmpresas() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI não configurada.');

  mongoose.set('autoIndex', false);
  await mongoose.connect(process.env.MONGO_URI);

  const usuariosCollection = mongoose.connection.collection(Usuario.collection.collectionName);
  const empresasCollection = mongoose.connection.collection(Empresa.collection.collectionName);
  const usuarios = await usuariosCollection.find({}).toArray();
  const empresas = await empresasCollection.find({}).toArray();
  const emails = new Set();
  const cnpjsNovos = new Set();
  const cnpjsEmpresas = new Map();

  for (const empresa of empresas) {
    const cnpj = normalizarCnpj(empresa.cnpj);
    if (cnpj.length !== 14) {
      throw new Error(`A empresa ${empresa._id} não possui CNPJ válido.`);
    }
    const empresaComMesmoCnpj = cnpjsEmpresas.get(cnpj);
    if (empresaComMesmoCnpj && String(empresaComMesmoCnpj._id) !== String(empresa._id)) {
      throw new Error('Há CNPJs duplicados na coleção de empresas. Corrija os registros antes da migração.');
    }
    cnpjsEmpresas.set(cnpj, empresa);
  }

  for (const usuario of usuarios) {
    const email = normalizarEmail(usuario.email);
    if (!email) throw new Error(`Usuário ${usuario._id} não possui e-mail válido.`);
    if (emails.has(email)) {
      throw new Error('Há e-mails duplicados após normalização. Corrija os registros antes da migração.');
    }
    emails.add(email);

    if (!usuario.papel) {
      const cnpj = normalizarCnpj(usuario.cnpj);
      if (!usuario.nome || cnpj.length !== 14) {
        throw new Error(`Dados de empresa inválidos no usuário ${usuario._id}.`);
      }
      if (cnpjsNovos.has(cnpj)) {
        throw new Error('Há CNPJs duplicados entre usuários antigos. Corrija os registros antes da migração.');
      }
      cnpjsNovos.add(cnpj);

      const empresaComCnpj = cnpjsEmpresas.get(cnpj);
      if (empresaComCnpj && String(empresaComCnpj._id) !== String(usuario._id)) {
        throw new Error('Há CNPJs que já pertencem a outra empresa. Corrija os registros antes da migração.');
      }
    }
  }

  let migrados = 0;
  for (const usuario of usuarios) {
    const email = normalizarEmail(usuario.email);
    if (!usuario.papel) {
      const cnpj = normalizarCnpj(usuario.cnpj);
      const empresaExistente = await empresasCollection.findOne({ _id: usuario._id });
      if (empresaExistente && empresaExistente.cnpj !== cnpj) {
        throw new Error(`A empresa do usuário ${usuario._id} já existe com outro CNPJ.`);
      }

      await empresasCollection.updateOne(
        { _id: usuario._id },
        { $setOnInsert: { nome: usuario.nome, cnpj } },
        { upsert: true }
      );

      const resultado = await usuariosCollection.updateOne(
        { _id: usuario._id, $or: [{ papel: { $exists: false } }, { papel: null }, { papel: '' }] },
        {
          $set: { email, empresaId: String(usuario._id), papel: 'gestor' },
          $unset: { cnpj: '' }
        }
      );
      migrados += resultado.modifiedCount;
    } else if (email !== usuario.email) {
      await usuariosCollection.updateOne({ _id: usuario._id }, { $set: { email } });
    }
  }

  await usuariosCollection.createIndex({ email: 1 }, { unique: true });
  await empresasCollection.createIndex({ cnpj: 1 }, { unique: true });
  console.log(`Migração concluída. Usuários migrados: ${migrados}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  migrarEmpresas()
    .catch((error) => {
      console.error('Erro ao migrar empresas:', error.message);
      process.exitCode = 1;
    })
    .finally(async () => {
      await mongoose.disconnect();
    });
}
