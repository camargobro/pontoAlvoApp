import mongoose from 'mongoose';
import { Acoes } from './modelAcao.js';
import { geocodificar } from './geocodificar.js';

const pontosSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  telefone: { type: String, required: true },
  endereco: { type: String, required: true },
  bairro: { type: String, required: true },
  cidade: { type: String, required: true },
  tipo: { type: String, required: true },
  empresaId: { type: String, required: true },
  lat: { type: Number },
  lng: { type: Number }
});

export const Pontos = mongoose.model('Pontos', pontosSchema);

async function obterCoordenadas(ponto) {
  try {
    return await geocodificar(ponto);
  } catch (error) {
    console.error('Erro ao geocodificar ponto:', error.message);
    return null;
  }
}

export async function postPonto(ponto) {
  const coords = await obterCoordenadas(ponto);
  const novoPonto = new Pontos({ ...ponto, ...coords });
  return await novoPonto.save();
}

export async function getPontos(empresaId) {
  if (!empresaId) throw new Error('empresaId obrigatório');
  return await Pontos.find({ empresaId });
}
export async function getPontoById(pontoId, empresaId) {
  if (!empresaId) throw new Error('empresaId obrigatório');
  return await Pontos.findOne({ _id: pontoId, empresaId });
}

export async function getMapaCalor(empresaId) {
  if (!empresaId) throw new Error('empresaId obrigatório');

  const [pontos, contagens] = await Promise.all([
    Pontos.find({ empresaId, lat: { $ne: null }, lng: { $ne: null } }, 'nome cidade lat lng'),
    Acoes.aggregate([
      { $match: { empresaId } },
      { $group: { _id: '$pontoId', total: { $sum: 1 } } }
    ])
  ]);

  const totais = new Map(contagens.map((c) => [c._id, c.total]));

  return pontos
    .map((p) => ({
      nome: p.nome,
      cidade: p.cidade,
      lat: p.lat,
      lng: p.lng,
      visitas: totais.get(String(p._id)) || 0
    }))
    .filter((p) => p.visitas > 0);
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
  const pontoAtual = await Pontos.findOne({ _id: id, empresaId });
  if (!pontoAtual) return null;

  const enderecoAnterior = [pontoAtual.endereco, pontoAtual.bairro, pontoAtual.cidade]
    .map((valor) => valor.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR'))
    .join('|');
  const enderecoNovo = [endereco, bairro, cidade]
    .map((valor) => valor.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR'))
    .join('|');
  const coordenadasExistentes = Number.isFinite(pontoAtual.lat) && Number.isFinite(pontoAtual.lng)
    ? { lat: pontoAtual.lat, lng: pontoAtual.lng }
    : null;
  const coords = enderecoAnterior === enderecoNovo && coordenadasExistentes
    ? coordenadasExistentes
    : await obterCoordenadas({ endereco, bairro, cidade });

  return await Pontos.findOneAndUpdate(
    { _id: id, empresaId },
    { nome, telefone, endereco, bairro, cidade, tipo, ...(coords || { lat: null, lng: null }) },
    { returnDocument: 'after', runValidators: true }
  );
}