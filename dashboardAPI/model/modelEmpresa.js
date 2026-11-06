import mongoose from 'mongoose';

const empresaSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  cnpj: { type: String, required: true, unique: true, trim: true, uppercase: true }
});

export const Empresa = mongoose.model('Empresa', empresaSchema);

export async function postEmpresa(empresa, options = {}) {
  const novaEmpresa = new Empresa(empresa);
  return await novaEmpresa.save(options);
}

export async function getEmpresas() {
  return await Empresa.find().lean();
}

export async function getEmpresa(id) {
  return await Empresa.findById(id).lean();
}

// Serializa mudanças de gestores da mesma empresa entre transações concorrentes.
export async function serializarAcessoEmpresa(id, session) {
  return await Empresa.updateOne({ _id: id }, { $inc: { __v: 1 } }, { session });
}
