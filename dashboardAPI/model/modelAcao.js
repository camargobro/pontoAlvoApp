import mongoose from 'mongoose';

const acoesSchema = new mongoose.Schema({
  pontoId: { type: String, required: true },
  data: { type: Date, required: true },
  leads: { type: Number, required: true },
  vendas: { type: Number, required: true },
  degustacao_tele: { type: Number, required: true },
  empresaId: { type: String, required: true},
  usuarioId: { type: String }
});



export const Acoes = mongoose.model('Acoes', acoesSchema);

export async function postAcoes(acao) {
  const novaAcao = new Acoes(acao)
  return await novaAcao.save();
}

export async function getAcoes(empresaId) {
  if (!empresaId) throw new Error('empresaId obrigatório');
  return await Acoes.find({empresaId});
}

export async function getAcao(id, empresaId) {
    if (!empresaId) throw new Error('empresaId obrigatório');
    return await Acoes.findOne({ _id: id, empresaId });
}

export async function deleteAcao(id, empresaId) {
    if (!empresaId) throw new Error('empresaId obrigatório');
    return await Acoes.findOneAndDelete({ _id: id, empresaId });
}

export async function putAcao(id, empresaId, dados) {
  if (!empresaId) throw new Error('empresaId obrigatório');
  const { pontoId, data, leads, vendas, degustacao_tele } = dados;

  return await Acoes.findOneAndUpdate(
    { _id: id, empresaId },
    { pontoId, data, leads, vendas, degustacao_tele },
    { returnDocument: 'after', runValidators: true }
  );
}