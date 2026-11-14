import mongoose from 'mongoose';

const agendamentosSchema = new mongoose.Schema({
  empresaId: { type: String, required: true },
  calendario: { type: Number, enum: [1, 2, 3], required: true },
  data: { type: Date, required: true },
  hora: { type: String, required: true },
  pontoId: { type: String, required: true },
  responsavel: { type: String, required: true },
  contato: { type: String, required: true }
});

export const Agendamentos = mongoose.model('Agendamentos', agendamentosSchema);

export async function postAgendamento(agendamento) {
  const novoAgendamento = new Agendamentos(agendamento);
  return await novoAgendamento.save();
}

export async function getAgendamentos(empresaId) {
  if (!empresaId) throw new Error('empresaId obrigatório');
  return await Agendamentos.find({ empresaId });
}

export async function getAgendamentoById(agendamentoId, empresaId) {
  if (!empresaId) throw new Error('empresaId obrigatório');
  return await Agendamentos.findOne({ _id: agendamentoId, empresaId });
}

export async function putAgendamento(agendamentoId, empresaId, dados) {
  if (!empresaId) throw new Error('empresaId obrigatório');
  const { calendario, data, hora, pontoId, responsavel, contato } = dados;

  return await Agendamentos.findOneAndUpdate(
    { _id: agendamentoId, empresaId },
    { calendario, data, hora, pontoId, responsavel, contato },
    { returnDocument: 'after', runValidators: true }
  );
}

export async function deleteAgendamento(agendamentoId, empresaId) {
  if (!empresaId) throw new Error('empresaId obrigatório');
  return await Agendamentos.findOneAndDelete({ _id: agendamentoId, empresaId });
}