import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  senha: { type: String, required: true },
  empresaId: { type: String },
  papel: { type: String, enum: ['admin', 'gestor', 'colaborador'], required: true }
});

export const Usuario = mongoose.model('Usuario', usuarioSchema);

export async function postUsuario(usuario, options = {}) {
  const novoUsuario = new Usuario(usuario);
  return await novoUsuario.save(options);
}

export async function getUsuarios(empresaId) {
  if (!empresaId) throw new Error('empresaId obrigatório');
  return await Usuario.find({ empresaId }).select('-senha');
}

export async function getUsuario(id, empresaId, options = {}) {
  if (!empresaId) throw new Error('empresaId obrigatório');
  return await Usuario.findOne({ _id: id, empresaId }).session(options.session || null);
}

export async function getUsuarioPorId(id) {
  return await Usuario.findOne({ _id: id });
}

export async function putUsuario(id, empresaId, dados, options = {}) {
  if (!empresaId) throw new Error('empresaId obrigatório');
  return await Usuario.findOneAndUpdate(
    { _id: id, empresaId },
    dados,
    { returnDocument: 'after', runValidators: true, session: options.session }
  );
}

export async function putSenha(id, senha) {
  return await Usuario.findOneAndUpdate(
    { _id: id },
    { senha },
    { returnDocument: 'after', runValidators: true }
  );
}

export async function deleteUsuario(id, empresaId, options = {}) {
  if (!empresaId) throw new Error('empresaId obrigatório');
  return await Usuario.findOneAndDelete(
    { _id: id, empresaId },
    { session: options.session }
  );
}

export async function contarGestores(empresaId, options = {}) {
  if (!empresaId) throw new Error('empresaId obrigatório');
  return await Usuario.countDocuments({ empresaId, papel: 'gestor' })
    .session(options.session || null);
}

export async function contarUsuarios(empresaId) {
  if (!empresaId) throw new Error('empresaId obrigatório');
  return await Usuario.countDocuments({ empresaId });
}
