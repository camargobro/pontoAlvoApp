import mongoose from 'mongoose';
import { Acoes } from './modelAcao.js';

const pontosSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  telefone: { type: String, required: true },
  endereco: { type: String, required: true },
  bairro: { type: String, required: true },
  cidade: { type: String, required: true },
  tipo: { type: String, required: true },
  empresaId: { type: String, required: true},
});

export const Pontos = mongoose.model('Pontos', pontosSchema);

export async function postPonto(ponto) {
  const novoPonto = new Pontos(ponto);
  return await novoPonto.save();
}

export async function getPontos(empresaId) {
  if (!empresaId) throw new Error('empresaId obrigatório');
  return await Pontos.find( {empresaId});
}

export async function deletePonto(id, empresaId) {
  if (!empresaId) throw new Error('empresaId obrigatório');
  const session = await mongoose.startSession();
  let pontoRemovido = null;

  try {
    await session.withTransaction(async () => {
      pontoRemovido = await Pontos.findOneAndDelete(
        { _id: id, empresaId },
        { session }
      );

      if (!pontoRemovido) return;

      await Acoes.deleteMany(
        { pontoId: String(pontoRemovido._id), empresaId },
        { session }
      );
    });

    return pontoRemovido;
  } finally {
    await session.endSession();
  }
}

export async function putPonto(id, empresaId, dados) {
  if (!empresaId) throw new Error('empresaId obrigatório');
  const { nome, telefone, endereco, bairro, cidade, tipo } = dados;

  return await Pontos.findOneAndUpdate(
    { _id: id, empresaId },
    { nome, telefone, endereco, bairro, cidade, tipo },
    { returnDocument: 'after', runValidators: true }
  );
}
