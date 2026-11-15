<template>
  <q-page class="pa-page">
    <div class="pa-container">
      <header class="pa-header">
        <div>
          <h1 class="pa-title">Mapa de pontos</h1>
          <p class="pa-subtitle">Visualize os pontos registrados e filtre por cidade.</p>
        </div>
      </header>

      <div class="pa-card pa-filtros">
        <div class="pa-filtros-cabecalho">
          <div>
            <h2 class="pa-filtros-titulo">Filtrar por cidade</h2>
            <p class="pa-filtros-ajuda">Selecione uma ou mais cidades para atualizar o mapa.</p>
          </div>
          <q-btn
            flat
            dense
            no-caps
            color="primary"
            :label="todasSelecionadas ? 'Limpar seleção' : 'Selecionar todas'"
            @click="alternarTodasCidades"
          />
        </div>
        <div class="pa-cidades">
          <q-btn
            v-for="cidade in cidades"
            :key="cidade"
            unelevated
            no-caps
            :color="cidadesSelecionadas.includes(cidade) ? 'primary' : 'grey-2'"
            :text-color="cidadesSelecionadas.includes(cidade) ? 'white' : 'grey-9'"
            :icon="cidadesSelecionadas.includes(cidade) ? 'check_circle' : 'radio_button_unchecked'"
            class="pa-cidade-opcao"
            :aria-pressed="cidadesSelecionadas.includes(cidade)"
            @click="alternarCidade(cidade)"
          >
            {{ cidade }}
          </q-btn>
        </div>
        <p class="pa-filtros-resumo">
          {{ resumoSelecao }}
        </p>
      </div>

      <q-banner v-if="erro" rounded class="bg-red-1 text-negative q-mb-md">
        {{ erro }}
        <template #action>
          <q-btn flat no-caps color="negative" label="Tentar novamente" @click="carregarMapa" />
        </template>
      </q-banner>

      <div class="pa-card pa-mapa-card">
        <div class="pa-mapa-cabecalho">
          <div>
            <h2 class="pa-mapa-titulo">Todos os pontos</h2>
            <p class="pa-mapa-descricao">
              {{ carregando ? 'Carregando pontos...' : 'Cada marcador representa um ponto; o calor mostra o volume de visitas.' }}
            </p>
          </div>
          <q-spinner v-if="carregando" color="primary" size="24px" aria-label="Carregando mapa" />
        </div>

        <div ref="mapaElemento" class="pa-mapa" role="application" aria-label="Mapa com todos os pontos selecionados" />

        <div class="pa-legenda" aria-label="Legenda dos marcadores">
          <span class="pa-legenda-item"><i class="pa-legenda-cor pa-legenda-cor--sem-visitas" /> Sem visitas</span>
          <span class="pa-legenda-item"><i class="pa-legenda-cor pa-legenda-cor--poucas" /> Poucas visitas</span>
          <span class="pa-legenda-item"><i class="pa-legenda-cor pa-legenda-cor--muitas" /> Mais visitas</span>
        </div>

        <p v-if="!carregando && !erro && pontosVisiveis.length === 0" class="pa-vazio">
          Não há pontos com coordenadas nas cidades selecionadas.
        </p>
      </div>
    </div>

    <q-dialog v-model="dialogDetalhes" @hide="limparDetalhes">
      <q-card class="pa-dialog pa-dialog--detalhes">
        <q-card-section class="row items-center q-pb-sm">
          <div class="pa-secao-titulo">Detalhes do ponto</div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="close" aria-label="Fechar detalhes" />
        </q-card-section>

        <q-inner-loading :showing="carregandoDetalhes">
          <q-spinner size="40px" color="primary" />
          <div class="q-mt-sm">Carregando dados do ponto e histórico...</div>
        </q-inner-loading>

        <q-banner v-if="erroDetalhes" rounded class="bg-red-1 text-negative q-mx-md q-mb-md">
          {{ erroDetalhes }}
          <template #action>
            <q-btn flat no-caps color="negative" label="Tentar novamente" @click="carregarDetalhesPonto" />
          </template>
        </q-banner>

        <template v-if="pontoDetalhado && !carregandoDetalhes">
          <q-card-section class="q-pt-none">
            <div class="pa-ponto-nome pa-detalhe-nome">{{ pontoDetalhado.nome }}</div>
            <div class="pa-detalhe-metadados">
              {{ normalizarTipoPonto(pontoDetalhado.tipo) }} · {{ pontoDetalhado.endereco }}
            </div>
            <div class="pa-detalhe-metadados">
              {{ [pontoDetalhado.bairro, normalizarCidade(pontoDetalhado.cidade)].filter(Boolean).join(', ') }}
              <span v-if="pontoDetalhado.telefone"> · {{ pontoDetalhado.telefone }}</span>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-4">
                <div class="pa-resumo-card">
                  <div class="pa-resumo-valor">{{ totalVidasPonto }}</div>
                  <div class="pa-resumo-label">Vidas no total</div>
                </div>
              </div>
              <div class="col-12 col-sm-4">
                <div class="pa-resumo-card">
                  <div class="pa-resumo-valor">{{ mediaVidasPonto }}</div>
                  <div class="pa-resumo-label">Média de vidas por ação</div>
                </div>
              </div>
              <div class="col-12 col-sm-4">
                <div class="pa-resumo-card">
                  <div class="pa-resumo-valor">{{ acoesDoPonto.length }}</div>
                  <div class="pa-resumo-label">Ações registradas</div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="pa-secao-titulo q-mb-sm">Histórico deste ponto</div>
            <q-table
              :rows="acoesDoPonto"
              :columns="colunasHistoricoPonto"
              row-key="_id"
              :rows-per-page-options="[5, 10, 0]"
              rows-per-page-label="Ações por página"
              no-data-label="Este ponto ainda não tem ações registradas."
              :pagination-label="(inicio, fim, total) => `${inicio}-${fim} de ${total}`"
              flat
              bordered
            />
          </q-card-section>
        </template>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import { HeatLayer } from 'leaflet.heat'
import 'leaflet/dist/leaflet.css'
import { apiFetch } from 'src/services/api'
import { cidadesMapa, chaveCidade, normalizarCidade, normalizarTipoPonto } from 'src/constants/classificacaoPonto'

const cidades = cidadesMapa

const cidadesSelecionadas = ref([...cidades])
const mapaElemento = ref(null)
const pontos = ref([])
const carregando = ref(false)
const erro = ref('')
const dialogDetalhes = ref(false)
const pontoSelecionadoDetalhes = ref(null)
const pontoDetalhado = ref(null)
const acoesDoPonto = ref([])
const carregandoDetalhes = ref(false)
const erroDetalhes = ref('')
let mapa = null
let camadaCalor = null
let marcadores = null
let requisicaoDetalhes = 0

const todasSelecionadas = computed(() => cidadesSelecionadas.value.length === cidades.length)
const resumoSelecao = computed(() => {
  const quantidade = cidadesSelecionadas.value.length
  if (quantidade === 0) return 'Nenhuma cidade selecionada'
  if (todasSelecionadas.value) return 'Exibindo todas as cidades'
  return `${quantidade} ${quantidade === 1 ? 'cidade selecionada' : 'cidades selecionadas'}`
})

const pontosVisiveis = computed(() => {
  const cidadesAlvo = new Set(cidadesSelecionadas.value.map(chaveCidade))
  return pontos.value.filter((ponto) =>
    Number.isFinite(ponto.lat) &&
    Number.isFinite(ponto.lng) &&
    cidadesAlvo.has(chaveCidade(ponto.cidade))
  )
})

const totalVidasPonto = computed(() =>
  acoesDoPonto.value.reduce((total, acao) => total + (Number(acao.vendas) || 0), 0)
)
const mediaVidasPonto = computed(() => {
  if (!acoesDoPonto.value.length) return '0'
  return (totalVidasPonto.value / acoesDoPonto.value.length).toLocaleString('pt-BR', {
    maximumFractionDigits: 1
  })
})
const colunasHistoricoPonto = [
  {
    name: 'data',
    label: 'Data',
    field: 'data',
    align: 'left',
    sortable: true,
    format: formatarDataHistorico
  },
  { name: 'leads', label: 'Leads', field: 'leads', align: 'center' },
  { name: 'consultas', label: 'Consultas', field: 'degustacao_tele', align: 'center' },
  { name: 'vidas', label: 'Vidas', field: 'vendas', align: 'center' }
]

function formatarDataHistorico(value) {
  const data = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  return data ? `${data[3]}/${data[2]}/${data[1]}` : value || '—'
}

async function mensagemErroResposta(response, fallback) {
  let body = null
  try {
    body = await response.clone().json()
  } catch {
    // A API pode responder com texto ou sem conteúdo.
  }

  return body?.error || body?.erro || body?.message ||
    `${fallback} (HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''}).`
}

async function carregarDetalhesPonto() {
  const ponto = pontoSelecionadoDetalhes.value
  if (!ponto?.id) return

  const idRequisicao = ++requisicaoDetalhes
  carregandoDetalhes.value = true
  erroDetalhes.value = ''

  try {
    const [respostaPonto, respostaAcoes] = await Promise.all([
      apiFetch(`/pontos/${encodeURIComponent(ponto.id)}`),
      apiFetch('/acoes')
    ])
    if (!respostaPonto.ok) {
      throw new Error(await mensagemErroResposta(respostaPonto, 'Não foi possível carregar o ponto'))
    }
    if (!respostaAcoes.ok) {
      throw new Error(await mensagemErroResposta(respostaAcoes, 'Não foi possível carregar o histórico'))
    }

    const [dadosPonto, todasAcoes] = await Promise.all([
      respostaPonto.json(),
      respostaAcoes.json()
    ])
    if (idRequisicao !== requisicaoDetalhes) return

    pontoDetalhado.value = dadosPonto
    acoesDoPonto.value = todasAcoes
      .filter((acao) => String(acao.pontoId) === String(dadosPonto._id))
      .sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')))
  } catch (error) {
    if (idRequisicao !== requisicaoDetalhes) return
    erroDetalhes.value = error.message || 'Não foi possível carregar os detalhes do ponto.'
    console.error('Erro ao carregar detalhes do ponto:', error)
  } finally {
    if (idRequisicao === requisicaoDetalhes) carregandoDetalhes.value = false
  }
}

function abrirDetalhesPonto(ponto) {
  pontoSelecionadoDetalhes.value = ponto
  pontoDetalhado.value = null
  acoesDoPonto.value = []
  dialogDetalhes.value = true
  carregarDetalhesPonto()
}

function limparDetalhes() {
  requisicaoDetalhes += 1
  carregandoDetalhes.value = false
  pontoSelecionadoDetalhes.value = null
  pontoDetalhado.value = null
  acoesDoPonto.value = []
  erroDetalhes.value = ''
}

function alternarCidade(cidade) {
  if (cidadesSelecionadas.value.includes(cidade)) {
    cidadesSelecionadas.value = cidadesSelecionadas.value.filter((item) => item !== cidade)
    return
  }

  cidadesSelecionadas.value = [...cidadesSelecionadas.value, cidade]
}

function alternarTodasCidades() {
  cidadesSelecionadas.value = todasSelecionadas.value ? [] : [...cidades]
}

function atualizarCamadas() {
  if (!mapa) return

  if (camadaCalor) {
    mapa.removeLayer(camadaCalor)
    camadaCalor = null
  }
  marcadores?.clearLayers()

  const pontosComVisitas = pontosVisiveis.value.filter((ponto) => ponto.visitas > 0)
  const maiorVisita = pontosComVisitas.length
    ? Math.max(...pontosComVisitas.map((ponto) => ponto.visitas))
    : 0

  if (pontosComVisitas.length) {
    const intensidades = pontosComVisitas.map((ponto) => [ponto.lat, ponto.lng, ponto.visitas])
    camadaCalor = new HeatLayer(intensidades, {
      radius: 46,
      blur: 18,
      minOpacity: 0.55,
      max: maiorVisita,
      gradient: {
        0.1: '#fff200',
        0.3: '#ff8c00',
        0.55: '#ff1f00',
        0.75: '#a8002a',
        1: '#31002f'
      }
    }).addTo(mapa)
  }

  for (const ponto of pontosVisiveis.value) {
    const proporcaoVisitas = maiorVisita ? ponto.visitas / maiorVisita : 0
    const cor = ponto.visitas === 0
      ? '#64748B'
      : proporcaoVisitas >= 0.7
        ? '#B91C1C'
        : proporcaoVisitas >= 0.35
          ? '#EA580C'
          : '#F59E0B'
    const marcador = L.circleMarker([ponto.lat, ponto.lng], {
      radius: 6 + Math.round(proporcaoVisitas * 5),
      color: '#FFFFFF',
      weight: 2,
      fillColor: cor,
      fillOpacity: 0.95
    })
    marcador.bindTooltip(
      `<strong>${escaparHtml(ponto.nome)}</strong><br>${ponto.visitas} ${ponto.visitas === 1 ? 'visita' : 'visitas'}`,
      { direction: 'top', offset: [0, -6] }
    )
    marcador.on('click', () => abrirDetalhesPonto(ponto))
    marcador.addTo(marcadores)
  }

  if (pontosVisiveis.value.length === 1) {
    const [ponto] = pontosVisiveis.value
    mapa.setView([ponto.lat, ponto.lng], 14)
  } else if (pontosVisiveis.value.length > 1) {
    mapa.fitBounds(
      L.latLngBounds(pontosVisiveis.value.map((ponto) => [ponto.lat, ponto.lng])),
      { padding: [36, 36], maxZoom: 13 }
    )
  } else {
    mapa.setView([-29.95, -51.15], 10)
  }
}

function escaparHtml(valor) {
  return String(valor).replace(/[&<>"']/g, (caractere) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[caractere])
}

async function carregarMapa() {
  carregando.value = true
  erro.value = ''

  try {
    const [respostaPontos, respostaAcoes] = await Promise.all([
      apiFetch('/pontos'),
      apiFetch('/acoes')
    ])

    async function lerLista(response, recurso) {
      if (!response.ok) {
        let mensagem = `Não foi possível carregar ${recurso} (HTTP ${response.status}).`
        try {
          const body = await response.json()
          if (body.error) mensagem = body.error
        } catch {
          // Mantém a mensagem HTTP quando a resposta não contém JSON.
        }
        throw new Error(mensagem)
      }

      const dados = await response.json()
      if (!Array.isArray(dados)) throw new Error(`A resposta de ${recurso} está em formato inválido.`)
      return dados
    }

    const [dadosPontos, dadosAcoes] = await Promise.all([
      lerLista(respostaPontos, 'pontos cadastrados'),
      lerLista(respostaAcoes, 'ações')
    ])

    const visitasPorPonto = new Map()
    for (const acao of dadosAcoes) {
      const pontoId = String(acao.pontoId)
      visitasPorPonto.set(pontoId, (visitasPorPonto.get(pontoId) || 0) + 1)
    }

    pontos.value = dadosPontos
      .map((ponto) => ({
        id: String(ponto._id),
        nome: ponto.nome,
        cidade: ponto.cidade,
        lat: ponto.lat == null ? Number.NaN : Number(ponto.lat),
        lng: ponto.lng == null ? Number.NaN : Number(ponto.lng),
        visitas: visitasPorPonto.get(String(ponto._id)) || 0
      }))
  } catch (errorCarregamento) {
    erro.value = errorCarregamento.message || 'Não foi possível carregar o mapa.'
    console.error('Erro ao carregar mapa de calor:', errorCarregamento)
  } finally {
    carregando.value = false
    await nextTick()
    atualizarCamadas()
    mapa?.invalidateSize()
  }
}

watch(cidadesSelecionadas, atualizarCamadas)

onMounted(async () => {
  mapa = L.map(mapaElemento.value, { scrollWheelZoom: false }).setView([-30.0346, -51.2177], 12)
  marcadores = L.layerGroup().addTo(mapa)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(mapa)

  await carregarMapa()
})

onBeforeUnmount(() => {
  mapa?.remove()
  mapa = null
  camadaCalor = null
})
</script>

<style scoped>
.pa-page {
  --pa-navy: #0B3C5D;
  --pa-borda: #E3E8EE;
  --pa-suave: #5F6B7A;
  min-height: 100%;
  background: #F4F6F9;
}

.pa-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px 48px;
}

.pa-header {
  margin-bottom: 24px;
}

.pa-title {
  margin: 0;
  color: var(--pa-navy);
  font-size: 1.75rem;
  font-weight: 700;
}

.pa-title::after {
  display: block;
  width: 48px;
  height: 4px;
  margin-top: 12px;
  border-radius: 2px;
  background: #FF7A1A;
  content: '';
}

.pa-subtitle {
  margin: 12px 0 0;
  color: var(--pa-suave);
}

.pa-card {
  border: 1px solid var(--pa-borda);
  border-radius: 12px;
  background: #fff;
}

.pa-filtros {
  padding: 20px;
  margin-bottom: 20px;
}

.pa-filtros-cabecalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.pa-filtros-titulo {
  margin: 0;
  color: var(--pa-navy);
  font-size: 1rem;
  font-weight: 700;
}

.pa-filtros-ajuda,
.pa-filtros-resumo {
  margin: 4px 0 0;
  color: var(--pa-suave);
  font-size: 0.8125rem;
}

.pa-cidades {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.pa-cidade-opcao {
  justify-content: flex-start;
  min-height: 44px;
  border: 1px solid var(--pa-borda);
  border-radius: 8px;
}

.pa-cidade-opcao :deep(.q-btn__content) {
  justify-content: flex-start;
  width: 100%;
}

.pa-mapa-descricao {
  color: var(--pa-suave);
  font-size: 0.8125rem;
}

.pa-mapa-card {
  padding: 20px;
  overflow: hidden;
}

.pa-mapa-cabecalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.pa-mapa-titulo {
  margin: 0;
  color: var(--pa-navy);
  font-size: 1.125rem;
  font-weight: 700;
}

.pa-mapa-descricao {
  margin: 4px 0 0;
}

.pa-mapa {
  width: 100%;
  height: min(68vh, 680px);
  min-height: 360px;
  border-radius: 8px;
  background: #E8EDF2;
  z-index: 0;
}

.pa-mapa :deep(.leaflet-tile-pane) {
  filter: grayscale(1) brightness(1.08);
}

.pa-legenda {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 14px;
  color: var(--pa-suave);
  font-size: 0.75rem;
}

.pa-legenda-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.pa-legenda-cor {
  width: 12px;
  height: 12px;
  border: 1px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.2);
}

.pa-legenda-cor--sem-visitas {
  background: #64748B;
}

.pa-legenda-cor--poucas {
  background: #F59E0B;
}

.pa-legenda-cor--muitas {
  background: #B91C1C;
}

.pa-vazio {
  margin: 16px 0 0;
  color: var(--pa-suave);
  text-align: center;
}

.pa-dialog--detalhes {
  --pa-navy: #0B3C5D;
  --pa-borda: #E3E8EE;
}

.pa-detalhe-nome {
  color: var(--pa-navy);
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
  text-align: left;
}

.pa-dialog--detalhes .pa-resumo-card {
  height: 100%;
  padding: 16px;
  border: 1px solid var(--pa-borda);
  border-radius: 10px;
  background: #F8FAFC;
  text-align: center;
}

.pa-dialog--detalhes .pa-resumo-valor {
  color: var(--pa-navy);
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
}

@media (max-width: 700px) {
  .pa-container {
    padding: 24px 16px 32px;
  }

  .pa-filtros {
    padding: 16px;
  }

  .pa-cidades {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pa-mapa-card {
    padding: 14px;
  }

  .pa-mapa {
    height: 58vh;
    min-height: 320px;
  }
}

@media (max-width: 420px) {
  .pa-filtros-cabecalho {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .pa-cidades {
    grid-template-columns: 1fr;
  }
}
</style>
