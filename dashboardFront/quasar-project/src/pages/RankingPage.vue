<template>
  <q-page class="pa-page">
    <div class="pa-container">
      <header class="pa-header">
        <h1 class="pa-title">Ranking de performance</h1>
        <p class="pa-subtitle">Pontos ordenados pela média de vidas por visita</p>
      </header>

      <q-banner v-if="erro" rounded class="bg-red-1 text-negative q-mb-lg">
        {{ erroMensagem || 'Não foi possível carregar o ranking. Tente novamente.' }}
        <template v-slot:action>
          <q-btn flat no-caps color="negative" label="Tentar novamente" @click="carregarRanking" />
        </template>
      </q-banner>

      <div class="pa-card pa-card--filtros">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <q-select
              v-model="cidadeSelecionada"
              :options="cidades"
              label="Filtrar por cidade"
              clearable
              dense
              outlined
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-select
              v-model="tipoSelecionado"
              :options="tipos"
              label="Filtrar por tipo"
              clearable
              dense
              outlined
            />
          </div>
        </div>
      </div>

      <div class="pa-card pa-card--tabela">
        <div class="pa-tabela-topo row items-center justify-between q-col-gutter-md">
          <div class="col">
            <div class="pa-secao-titulo">Desempenho dos pontos</div>
            <div class="pa-label">
              {{ carregando ? 'Carregando...' : `${rankingFiltrado.length} ${rankingFiltrado.length === 1 ? 'ponto' : 'pontos'}` }}
            </div>
          </div>
          <div v-if="podeExportar" class="col-auto">
            <q-btn
              outline
              color="primary"
              label="Exportar planilha"
              no-caps
              icon="download"
              :loading="exportando"
              :disable="carregando"
              @click="baixarRanking"
            />
          </div>
        </div>

        <q-table
          v-model:pagination="pagination"
          :rows="rankingFiltrado"
          :columns="columns"
          :loading="carregando"
          :rows-per-page-options="[10, 25, 50, 0]"
          rows-per-page-label="Linhas por página"
          no-data-label="Nenhum ponto encontrado para esses filtros."
          :pagination-label="(inicio, fim, total) => `${inicio}-${fim} de ${total}`"
          table-header-class="pa-thead"
          row-key="pontoId"
          flat
        >
          <template v-slot:body-cell-pos="props">
            <q-td :props="props" :class="['pa-pos', { 'pa-pos--top': props.row.pos <= 3 }]">
              {{ props.row.pos }}
            </q-td>
          </template>

          <template v-slot:body-cell-nome="props">
            <q-td :props="props">
              <div class="row items-center no-wrap q-gutter-xs">
                <div class="pa-ponto-nome">{{ props.row.nome }}</div>
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  color="primary"
                  icon="visibility"
                  :aria-label="`Ver detalhes de ${props.row.nome}`"
                  @click="abrirDetalhesPonto(props.row)"
                >
                  <q-tooltip>Ver detalhes e histórico</q-tooltip>
                </q-btn>
              </div>
              <div class="pa-label">{{ props.row.endereco }}</div>
              <div class="pa-label">
                <WhatsAppContact :phone="props.row.telefone" />
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-mediaVendas="props">
            <q-td :props="props">
              <div class="pa-barra-wrap">
                <div class="pa-barra">
                  <div class="pa-barra-fill" :style="{ width: larguraBarra(props.row.mediaVendas) }"></div>
                </div>
                <span class="pa-barra-valor">{{ formatarDecimal(props.row.mediaVendas) }}</span>
              </div>
            </q-td>
          </template>
        </q-table>
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
import { computed, onMounted, ref } from 'vue'
import { apiFetch } from 'src/services/api'
import { tiposPonto } from 'src/constants/tiposPonto'
import { chaveCidade, listarCidades, normalizarCidade, normalizarTipoPonto } from 'src/constants/classificacaoPonto'
import { notificar } from 'src/services/notificacoes'
import { useQuasar } from 'quasar'
import WhatsAppContact from 'src/components/WhatsAppContact.vue'
import { temPapel } from 'src/services/auth'

const $q = useQuasar()
const ranking = ref([])
const carregando = ref(true)
const exportando = ref(false)
const erro = ref(false)
const erroMensagem = ref('')
const cidadeSelecionada = ref(null)
const tipoSelecionado = ref(null)
const pagination = ref({ rowsPerPage: 10 })
const podeExportar = temPapel('gestor')
const dialogDetalhes = ref(false)
const pontoSelecionadoDetalhes = ref(null)
const pontoDetalhado = ref(null)
const acoesDoPonto = ref([])
const carregandoDetalhes = ref(false)
const erroDetalhes = ref('')
let requisicaoDetalhes = 0

const cidades = computed(() => listarCidades(ranking.value))
const tipos = tiposPonto

const rankingFiltrado = computed(() => {
  const filtrado = ranking.value.filter((ponto) =>
    (!cidadeSelecionada.value || chaveCidade(ponto.cidade) === chaveCidade(cidadeSelecionada.value)) &&
    (!tipoSelecionado.value || normalizarTipoPonto(ponto.tipo) === tipoSelecionado.value)
  )

  return filtrado.map((ponto, index) => ({ ...ponto, pos: index + 1 }))
})

const maiorMedia = computed(() =>
  Math.max(0, ...rankingFiltrado.value.map((ponto) => ponto.mediaVendas))
)

const columns = [
  { name: 'pos', label: '#', field: 'pos', align: 'left' },
  { name: 'nome', label: 'Ponto', field: 'nome', align: 'left' },
  { name: 'cidade', label: 'Cidade', field: 'cidade', align: 'left' },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left' },
  { name: 'visitas', label: 'Visitas', field: 'visitas', align: 'center' },
  { name: 'mediaVendas', label: 'Média de vidas', field: 'mediaVendas', align: 'left' },
  { name: 'mediaLeads', label: 'Média leads', field: 'mediaLeads', align: 'center', format: formatarDecimal },
  { name: 'mediaTelemedicina', label: 'Média de consultas', field: 'mediaTelemedicina', align: 'center', format: formatarDecimal },
]

const totalVidasPonto = computed(() =>
  acoesDoPonto.value.reduce((total, acao) => total + (Number(acao.vendas) || 0), 0)
)
const mediaVidasPonto = computed(() => {
  if (!acoesDoPonto.value.length) return '0'
  return (totalVidasPonto.value / acoesDoPonto.value.length).toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
  })
})
const colunasHistoricoPonto = [
  {
    name: 'data',
    label: 'Data',
    field: 'data',
    align: 'left',
    sortable: true,
    format: formatarDataHistorico,
  },
  { name: 'leads', label: 'Leads', field: 'leads', align: 'center' },
  { name: 'consultas', label: 'Consultas', field: 'degustacao_tele', align: 'center' },
  { name: 'vidas', label: 'Vidas', field: 'vendas', align: 'center' },
]

function formatarDataHistorico(value) {
  const data = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  return data ? `${data[3]}/${data[2]}/${data[1]}` : value || '—'
}

async function carregarDetalhesPonto() {
  const ponto = pontoSelecionadoDetalhes.value
  if (!ponto?.pontoId) return

  const idRequisicao = ++requisicaoDetalhes
  carregandoDetalhes.value = true
  erroDetalhes.value = ''

  try {
    const [respostaPonto, respostaAcoes] = await Promise.all([
      apiFetch(`/pontos/${encodeURIComponent(ponto.pontoId)}`),
      apiFetch('/acoes'),
    ])
    if (!respostaPonto.ok) {
      throw new Error(await mensagemErroResposta(respostaPonto, 'Não foi possível carregar o ponto'))
    }
    if (!respostaAcoes.ok) {
      throw new Error(await mensagemErroResposta(respostaAcoes, 'Não foi possível carregar o histórico'))
    }

    const [dadosPonto, todasAcoes] = await Promise.all([
      respostaPonto.json(),
      respostaAcoes.json(),
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

function formatarDecimal(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function larguraBarra(valor) {
  if (!maiorMedia.value) return '0%'
  return `${(valor / maiorMedia.value) * 100}%`
}

async function carregarRanking() {
  carregando.value = true
  erro.value = false
  erroMensagem.value = ''

  try {
    const response = await apiFetch('/dashboard/ranking')
    if (!response.ok) throw new Error(await mensagemErroResposta(response, 'Falha ao carregar o ranking'))

    const data = await response.json()
    ranking.value = (data.ordenado || []).map((ponto, index) => ({
      pontoId: ponto.pontoId,
      pos: index + 1,
      nome: ponto.nome,
      endereco: ponto.endereco || 'Endereço não informado',
      telefone: ponto.telefone || 'Telefone não informado',
      cidade: normalizarCidade(ponto.cidade),
      bairro: ponto.bairro || '',
      tipo: normalizarTipoPonto(ponto.tipo),
      visitas: ponto.totalVisitas,
      mediaVendas: Math.round(ponto.mediaVendas * 100) / 100,
      mediaLeads: Math.round(ponto.mediaLeads * 100) / 100,
      mediaTelemedicina: Math.round(Number(ponto.mediaTelemedicina || 0) * 100) / 100,
    }))
  } catch (error) {
    erro.value = true
    erroMensagem.value = error.message || 'Não foi possível carregar o ranking.'
    console.error('Erro ao carregar ranking:', error)
  } finally {
    carregando.value = false
  }
}

async function mensagemErroResposta(response, fallback) {
  try {
    const body = await response.clone().json()
    return body.error || body.erro || fallback
  } catch {
    return `${fallback} (HTTP ${response.status}).`
  }
}

async function baixarRanking() {
  exportando.value = true

  try {
    const parametros = new URLSearchParams()
    if (cidadeSelecionada.value) parametros.set('cidade', cidadeSelecionada.value)
    if (tipoSelecionado.value) parametros.set('tipo', tipoSelecionado.value)

    const query = parametros.toString()
    const response = await apiFetch(`/dashboard/ranking/xlsx${query ? `?${query}` : ''}`)
    if (!response.ok) {
      let mensagem = 'Não foi possível exportar o ranking.'
      try {
        const body = await response.json()
        mensagem = body.error || body.erro || mensagem
      } catch {
        mensagem = `Não foi possível exportar o ranking (HTTP ${response.status}).`
      }
      throw new Error(mensagem)
    }

    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = 'ranking.xlsx'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(blobUrl)
    notificar($q, 'sucesso', 'Ranking exportado com sucesso.')
  } catch (error) {
    console.error('Erro ao exportar ranking:', error)
    notificar($q, 'erro', error.message || 'Não foi possível exportar o ranking.')
  } finally {
    exportando.value = false
  }
}

onMounted(carregarRanking)
</script>

<style scoped>
.pa-page {
  --pa-navy: #0B3C5D;
  --pa-orange: #FF7A1A;
  --pa-borda: #E3E8EE;
  --pa-suave: #5F6B7A;

  background: #F4F6F9;
}

.pa-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 48px;
}

.pa-header {
  margin-bottom: 28px;
}

.pa-title {
  margin: 0;
  font-size: 1.75rem;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--pa-navy);
}

.pa-title::after {
  content: '';
  display: block;
  width: 48px;
  height: 4px;
  margin-top: 12px;
  border-radius: 2px;
  background: var(--pa-orange);
}

.pa-subtitle {
  margin: 12px 0 0;
  color: var(--pa-suave);
}

.pa-card {
  background: #fff;
  border: 1px solid var(--pa-borda);
  border-radius: 12px;
}

.pa-card--filtros {
  padding: 20px 24px;
  margin-bottom: 20px;
}

.pa-card--tabela {
  overflow: hidden;
}

.pa-dialog {
  width: 100%;
  max-width: 880px;
  border-radius: 12px;
}

.pa-detalhe-nome {
  font-size: 1.25rem;
}

.pa-detalhe-metadados {
  margin-top: 4px;
  color: var(--pa-suave);
}

.pa-resumo-card {
  height: 100%;
  padding: 16px;
  background: #F8FAFC;
  border: 1px solid var(--pa-borda);
  border-radius: 10px;
  text-align: center;
}

.pa-resumo-valor {
  color: var(--pa-navy);
  font-size: 1.5rem;
  font-weight: 700;
}

.pa-resumo-label {
  margin-top: 4px;
  color: var(--pa-suave);
  font-size: 0.875rem;
}

.pa-tabela-topo {
  padding: 20px 24px;
  border-bottom: 1px solid var(--pa-borda);
}

.pa-secao-titulo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--pa-navy);
}

.pa-label {
  font-size: 0.8125rem;
  color: var(--pa-suave);
}

.pa-ponto-nome {
  font-size: 1rem;
  font-weight: 700;
  color: var(--pa-navy);
}

.pa-pos {
  width: 56px;
  font-weight: 700;
  color: var(--pa-suave);
}

.pa-pos--top {
  color: var(--pa-navy);
}

.pa-barra-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 180px;
}

.pa-barra {
  flex: 1;
  height: 8px;
  background: #EEF1F5;
  border-radius: 4px;
  overflow: hidden;
}

.pa-barra-fill {
  height: 100%;
  background: var(--pa-orange);
  border-radius: 4px;
}

.pa-barra-valor {
  min-width: 48px;
  text-align: right;
  font-weight: 700;
  color: var(--pa-navy);
}

.pa-card--tabela :deep(.pa-thead th) {
  font-weight: 700;
  font-size: 0.8125rem;
  color: var(--pa-navy);
  background: #F8FAFC;
}
</style>
