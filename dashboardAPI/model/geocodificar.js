const URL_BASE = 'https://nominatim.openstreetmap.org/search';
const INTERVALO_MINIMO_MS = 1100;
const MAX_TENTATIVAS = 3;

const pausa = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let filaRequisicoes = Promise.resolve();
let proximaRequisicao = 0;

function atrasoRetry(res, tentativa) {
  const retryAfter = res.headers.get('Retry-After');
  if (retryAfter) {
    const segundos = Number(retryAfter);
    if (Number.isFinite(segundos)) return Math.max(0, segundos * 1000);

    const dataRetry = Date.parse(retryAfter);
    if (Number.isFinite(dataRetry)) return Math.max(0, dataRetry - Date.now());
  }

  return 2000 * (2 ** tentativa);
}

function orientacaoRetry(res) {
  const retryAfter = res.headers.get('Retry-After');
  if (!retryAfter) {
    return 'O servidor não informou quando liberar novas consultas; aguarde antes de tentar novamente.';
  }

  const segundos = Number(retryAfter);
  if (Number.isFinite(segundos)) {
    const minutos = Math.ceil(segundos / 60);
    return `Aguarde pelo menos ${minutos} minuto(s) (Retry-After: ${retryAfter}).`;
  }

  const dataRetry = Date.parse(retryAfter);
  if (Number.isFinite(dataRetry)) {
    return `Tente novamente após ${new Date(dataRetry).toLocaleString('pt-BR')} (Retry-After: ${retryAfter}).`;
  }

  return `Aguarde o prazo indicado pelo servidor (Retry-After: ${retryAfter}).`;
}

function mensagemLimite(consulta, res) {
  const retryAfter = res.headers.get('Retry-After');
  const erro = new Error(
    `Nominatim limitou as consultas (HTTP 429) para: ${consulta}. ${orientacaoRetry(res)} ` +
    'O lote foi interrompido para evitar novas requisições durante a limitação.'
  );
  erro.status = res.status;
  erro.retryAfter = retryAfter;
  return erro;
}

async function buscarNaFila(consulta) {
  const requisicao = filaRequisicoes.then(async () => {
    const contato = process.env.GEOCODING_EMAIL?.trim();
    const params = new URLSearchParams({
      q: consulta,
      format: 'json',
      limit: '1',
      countrycodes: 'br'
    });

    if (contato) params.set('email', contato);

    for (let tentativa = 0; tentativa < MAX_TENTATIVAS; tentativa += 1) {
      await pausa(Math.max(0, proximaRequisicao - Date.now()));

      const res = await fetch(`${URL_BASE}?${params}`, {
        headers: {
          'User-Agent': contato ? `PontoAlvo/1.0 (${contato})` : 'PontoAlvo/1.0'
        }
      });
      proximaRequisicao = Date.now() + INTERVALO_MINIMO_MS;

      if (res.status === 429) {
        await res.arrayBuffer();
        throw mensagemLimite(consulta, res);
      }

      if (res.status === 503 && tentativa < MAX_TENTATIVAS - 1) {
        proximaRequisicao = Math.max(
          proximaRequisicao,
          Date.now() + atrasoRetry(res, tentativa)
        );
        await res.arrayBuffer();
        continue;
      }

      if (!res.ok) {
        await res.arrayBuffer();
        const erro = new Error(`Nominatim respondeu HTTP ${res.status} para: ${consulta}`);
        erro.status = res.status;
        throw erro;
      }

      const dados = await res.json();
      if (!dados.length) {
        console.info('Nominatim sem resultado para:', consulta);
        return null;
      }

      const lat = Number(dados[0].lat);
      const lng = Number(dados[0].lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error(`Nominatim retornou coordenadas inválidas para: ${consulta}`);
      }

      return { lat, lng };
    }

    return null;
  });

  filaRequisicoes = requisicao.then(() => undefined, () => undefined);
  return requisicao;
}

export async function geocodificar({ endereco, bairro, cidade }) {
  const completo = await buscarNaFila(`${endereco}, ${bairro}, ${cidade}, Brasil`);
  if (completo) return completo;
  return buscarNaFila(`${bairro}, ${cidade}, Brasil`);
}
