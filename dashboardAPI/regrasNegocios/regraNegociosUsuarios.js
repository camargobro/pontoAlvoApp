import { Empresa } from '../model/modelEmpresa.js';
import { Usuario } from '../model/modelUsuario.js';

const papeisEmpresa = ['gestor', 'colaborador'];

function emailCaseInsensitive(email) {
  const escapado = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escapado}$`, 'i');
}

export function normalizarEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function normalizarCnpj(cnpj) {
  return String(cnpj || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
}

export function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function papelEmpresaValido(papel) {
  return papeisEmpresa.includes(papel);
}

export async function verificarEmailDuplicado(email) {
  return Usuario.findOne({ email: emailCaseInsensitive(normalizarEmail(email)) });
}

export async function verificarCnpjDuplicado(cnpj) {
  return Empresa.findOne({ cnpj: normalizarCnpj(cnpj) });
}

export async function loginUsuario(email) {
  const emailNormalizado = normalizarEmail(email);
  if (!emailNormalizado) return null;

  return Usuario.findOne({ email: emailCaseInsensitive(emailNormalizado) });
}
