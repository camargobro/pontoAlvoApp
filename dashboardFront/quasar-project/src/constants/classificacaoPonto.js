import { tiposPonto } from './tiposPonto.js'

export const cidadesMapa = [
  'Porto Alegre',
  'Alvorada',
  'Viamão',
  'Canoas',
  'São Leopoldo',
  'Cachoeirinha',
]

const aliasesTiposPonto = new Map([
  ['farmacias', 'Farmácia'],
  ['locais publicos', 'Local Público'],
  ['supermercados', 'Supermercado'],
  ['clinicas', 'Clínica'],
  ['postos de gasolina', 'Posto de Gasolina'],
  ['sipats', 'SIPAT'],
])

function normalizarChave(valor) {
  return String(valor ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/\s+/g, ' ')
}

export function chaveCidade(valor) {
  const cidade = String(valor ?? '')
    .split(',')[0]
    .trim()
    .replace(/\s*-\s*(rs|rio grande do sul)$/i, '')
  const chave = normalizarChave(cidade)
  return chave === 'poa' || chave === 'p. alegre' ? 'porto alegre' : chave
}

export function normalizarCidade(valor) {
  const texto = String(valor ?? '')
    .split(',')[0]
    .trim()
    .replace(/\s*-\s*(rs|rio grande do sul)$/i, '')
    .replace(/\s+/g, ' ')
  const chave = chaveCidade(texto)
  const cidadeConhecida = cidadesMapa.find((cidade) => chaveCidade(cidade) === chave)
  return cidadeConhecida || texto
}

export function normalizarTipoPonto(valor) {
  const chave = normalizarChave(valor)
  const tipoPlural = aliasesTiposPonto.get(chave)
  if (tipoPlural) return tipoPlural

  const tipoConhecido = tiposPonto.find((tipo) => normalizarChave(tipo) === chave)
  return tipoConhecido || (chave ? 'OUTROS' : '')
}

export function listarCidades(pontos = []) {
  const cidades = new Map()
  for (const cidade of [...cidadesMapa, ...pontos.map((ponto) => ponto.cidade)]) {
    const canonica = normalizarCidade(cidade)
    const chave = chaveCidade(canonica)
    if (chave && !cidades.has(chave)) cidades.set(chave, canonica)
  }
  return [...cidades.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}
