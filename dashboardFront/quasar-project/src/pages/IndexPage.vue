<template>
  <div class="pa-page">
    <div class="pa-container">

      <header class="pa-header">
        <h1 class="pa-title">Dashboard de Vendas Externas</h1>
        <p class="pa-subtitle">Média de vendas por visita em cada local</p>
      </header>

      <q-banner v-if="erro" rounded class="bg-red-1 text-negative q-mb-lg">
        {{ erroMensagem || 'Não foi possível carregar os dados. Tente novamente em instantes.' }}
        <template v-slot:action>
          <q-btn flat color="negative" label="Tentar novamente" @click="buscarDados" />
        </template>
      </q-banner>

      <div class="row q-col-gutter-md q-mb-lg">
        <div v-for="item in resumo" :key="item.label" class="col-12 col-sm-6 col-md-3">
          <div class="pa-card">
            <div class="pa-label">{{ item.label }}</div>
            <div class="pa-numero">
              <q-skeleton v-if="carregando" type="text" width="96px" height="34px" />
              <span v-else>{{ item.valor }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mb-lg">
        <div v-for="d in destaques" :key="d.chave" class="col-12 col-md-6">
          <div class="pa-card pa-destaque" :class="`pa-destaque--${d.chave}`">

            <div class="pa-destaque-titulo">{{ d.titulo }}</div>

            <div class="row items-start justify-between no-wrap q-col-gutter-md">
              <div class="col">
                <template v-if="carregando">
                  <q-skeleton type="text" width="68%" height="22px" />
                  <q-skeleton type="text" width="90%" />
                  <q-skeleton type="text" width="52%" />
                </template>
                <template v-else>
                  <div class="pa-ponto-nome">{{ d.ponto.nome || 'Sem dados' }}</div>
                  <div class="pa-label">{{ d.ponto.endereco || 'Endereço não informado' }}</div>
                  <div class="pa-label">
                    <WhatsAppContact :phone="d.ponto.telefone" />
                  </div>
                </template>
              </div>

              <div class="col-auto text-right">
                <q-skeleton v-if="carregando" type="text" width="72px" height="36px" />
                <template v-else>
                  <div class="pa-media">{{ formatarDecimal(d.ponto.mediaVendas) }}</div>
                  <div class="pa-label">vendas/visita</div>
                </template>
              </div>
            </div>

            <div class="row pa-stats">
              <div class="col-6 col-sm-3">
                <div class="pa-label">Visitas</div>
                <q-skeleton v-if="carregando" type="text" width="36px" height="24px" />
                <div v-else class="pa-stat">{{ formatarInteiro(d.ponto.totalVisitas) }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="pa-label">Vendas</div>
                <q-skeleton v-if="carregando" type="text" width="36px" height="24px" />
                <div v-else class="pa-stat">{{ formatarInteiro(d.ponto.totalVendas) }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="pa-label">Leads</div>
                <q-skeleton v-if="carregando" type="text" width="36px" height="24px" />
                <div v-else class="pa-stat">{{ formatarInteiro(d.ponto.totalLeads) }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="pa-label">Telemedicina</div>
                <q-skeleton v-if="carregando" type="text" width="36px" height="24px" />
                <div v-else class="pa-stat">{{ formatarInteiro(d.ponto.totalTelemedicina) }}</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div class="pa-card pa-card--tabela">

        <div class="row items-center justify-between pa-tabela-topo">
          <div>
            <div class="pa-secao-titulo">Ranking de performance</div>
            <div class="pa-label">Ordenado pela média de vendas por visita</div>
          </div>
          <q-btn
            v-if="podeExportar"
            outline
            color="primary"
            label="Exportar planilha"
            no-caps
            :loading="exportando"
            :disable="carregando"
            @click="baixarRanking"
          />
        </div>

        <div v-if="carregando" class="pa-ranking-skeleton" aria-label="Carregando ranking" aria-busy="true">
          <div class="pa-ranking-skeleton__row pa-ranking-skeleton__row--head">
            <q-skeleton type="text" width="22px" />
            <q-skeleton type="text" width="52px" />
            <q-skeleton type="text" width="52px" />
            <q-skeleton type="text" width="90px" />
            <q-skeleton type="text" width="82px" />
          </div>
          <div v-for="linha in 5" :key="linha" class="pa-ranking-skeleton__row">
            <q-skeleton type="text" width="22px" />
            <div class="pa-ranking-skeleton__point">
              <q-skeleton type="text" width="52%" />
              <q-skeleton type="text" width="72%" />
            </div>
            <q-skeleton type="text" width="32px" />
            <q-skeleton type="text" width="112px" height="12px" />
            <q-skeleton type="text" width="44px" />
          </div>
        </div>

        <q-table
          v-else
          v-model:pagination="pagination"
          :rows="ranking"
          :columns="columns"
          :rows-per-page-options="[10, 25, 50, 0]"
          rows-per-page-label="Linhas por página"
          no-data-label="Nenhum ponto encontrado"
          :pagination-label="(inicio, fim, total) => `${inicio}-${fim} de ${total}`"
          table-header-class="pa-thead"
          row-key="nome"
          flat
        >

          <template v-slot:body-cell-pos="props">
            <q-td :props="props" :class="['pa-pos', { 'pa-pos--top': props.row.pos <= 3 }]">
              {{ props.row.pos }}
            </q-td>
          </template>

          <template v-slot:body-cell-nome="props">
            <q-td :props="props">
              <div class="pa-ponto-nome">{{ props.row.nome }}</div>
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
                  <div
                    class="pa-barra-fill"
                    :style="{ width: larguraBarra(props.row.mediaVendas) }"
                  ></div>
                </div>
                <span class="pa-barra-valor">{{ formatarDecimal(props.row.mediaVendas) }}</span>
              </div>
            </q-td>
          </template>

        </q-table>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { apiFetch } from 'src/services/api'
import WhatsAppContact from 'src/components/WhatsAppContact.vue'
import { notificar } from 'src/services/notificacoes'
import { useQuasar } from 'quasar'
import { temPapel } from 'src/services/auth'

const $q = useQuasar()
const totalVendas = ref(0)
const totalAcoes = ref(0)
const totalLeads = ref(0)
const totalTelemedicina = ref(0)

const ranking = ref([])

const melhorVendas = ref({})
const piorPonto = ref({})

const carregando = ref(true)
const erro = ref(false)
const erroMensagem = ref('')
const exportando = ref(false)
const podeExportar = temPapel('gestor')

const pagination = ref({ rowsPerPage: 10 })
let contagemFrame = null

function formatarInteiro(valor) {
  return Number(valor || 0).toLocaleString('pt-BR')
}

function formatarDecimal(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const resumo = computed(() => [
  { label: 'Total de ações', valor: formatarInteiro(totalAcoes.value) },
  { label: 'Total de vendas', valor: formatarInteiro(totalVendas.value) },
  { label: 'Total de leads', valor: formatarInteiro(totalLeads.value) },
  { label: 'Total de telemedicina', valor: formatarInteiro(totalTelemedicina.value) }
])

const destaques = computed(() => [
  { chave: 'melhor', titulo: 'Melhor ponto', ponto: melhorVendas.value },
  { chave: 'pior', titulo: 'Pior ponto', ponto: piorPonto.value }
])

const maiorMedia = computed(() =>
  Math.max(0, ...ranking.value.map(item => item.mediaVendas))
)

function larguraBarra(valor) {
  if (!maiorMedia.value) return '0%'
  return `${(valor / maiorMedia.value) * 100}%`
}

function animarTotais(data) {
  const alvos = {
    acoes: Number(data.totalAcoes || 0),
    vendas: Number(data.totalVendas || 0),
    leads: Number(data.totalLeads || 0),
    telemedicina: Number(data.totalTelemedicina || 0)
  }

  if (contagemFrame !== null) cancelAnimationFrame(contagemFrame)

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    totalAcoes.value = alvos.acoes
    totalVendas.value = alvos.vendas
    totalLeads.value = alvos.leads
    totalTelemedicina.value = alvos.telemedicina
    return
  }

  const iniciais = {
    acoes: totalAcoes.value,
    vendas: totalVendas.value,
    leads: totalLeads.value,
    telemedicina: totalTelemedicina.value
  }
  const inicio = performance.now()
  const duracao = 760

  function atualizarContagem(agora) {
    const progresso = Math.min((agora - inicio) / duracao, 1)
    const suavizado = 1 - (1 - progresso) ** 3

    totalAcoes.value = Math.round(iniciais.acoes + (alvos.acoes - iniciais.acoes) * suavizado)
    totalVendas.value = Math.round(iniciais.vendas + (alvos.vendas - iniciais.vendas) * suavizado)
    totalLeads.value = Math.round(iniciais.leads + (alvos.leads - iniciais.leads) * suavizado)
    totalTelemedicina.value = Math.round(iniciais.telemedicina + (alvos.telemedicina - iniciais.telemedicina) * suavizado)

    if (progresso < 1) {
      contagemFrame = requestAnimationFrame(atualizarContagem)
    } else {
      contagemFrame = null
    }
  }

  contagemFrame = requestAnimationFrame(atualizarContagem)
}

const columns = [
  {
    name: 'pos',
    label: '#',
    field: 'pos',
    align: 'left'
  },
  {
    name: 'nome',
    label: 'Ponto',
    field: 'nome',
    align: 'left'
  },
  {
    name: 'visitas',
    label: 'Visitas',
    field: 'visitas',
    align: 'center',
    format: valor => formatarInteiro(valor)
  },
  {
    name: 'mediaVendas',
    label: 'Média vendas',
    field: 'mediaVendas',
    align: 'left'
  },
  {
    name: 'mediaLeads',
    label: 'Média leads',
    field: 'mediaLeads',
    align: 'center',
    format: valor => formatarDecimal(valor)
  },
  {
    name: 'mediaTelemedicina',
    label: 'Média telemedicina',
    field: 'mediaTelemedicina',
    align: 'center',
    format: valor => formatarDecimal(valor)
  }
]

async function buscarDados() {
  carregando.value = true
  erro.value = false
  erroMensagem.value = ''

  try {

    const responseDashboard = await apiFetch('/dashboard')

    const responseRanking = await apiFetch('/dashboard/ranking')

    if (!responseDashboard.ok) {
      throw new Error(await mensagemErroResposta(responseDashboard, 'Erro ao buscar dados do dashboard'))
    }

    const dataDashboard = await responseDashboard.json()

    animarTotais(dataDashboard)

    if (responseRanking.ok) {

      const dataRanking = await responseRanking.json()

      ranking.value = dataRanking.ordenado.map((item, index) => ({
        pos: index + 1,

        nome: item.nome,

        endereco: item.endereco || 'Endereço não informado',
        telefone: item.telefone || 'Telefone não informado',

        visitas: item.totalVisitas,

        mediaVendas: Math.round(item.mediaVendas * 100) / 100,

        mediaLeads: Math.round(item.mediaLeads * 100) / 100,
        mediaTelemedicina: Math.round(Number(item.mediaTelemedicina || 0) * 100) / 100
      }))

      melhorVendas.value = dataRanking.melhorVendas || {}

      piorPonto.value = dataRanking.piorPonto || {}
    } else {
      erro.value = true
      erroMensagem.value = await mensagemErroResposta(responseRanking, 'Não foi possível carregar o ranking')
    }

  } catch (e) {
    erro.value = true
    erroMensagem.value = e.message || 'Não foi possível carregar os dados.'
    console.error('Erro ao carregar o dashboard:', e)
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

onMounted(() => {
  buscarDados()
})

onBeforeUnmount(() => {
  if (contagemFrame !== null) cancelAnimationFrame(contagemFrame)
})

async function baixarRanking() {
  exportando.value = true
  try {
    const resp = await apiFetch('/dashboard/ranking/xlsx')
    if (!resp.ok) {
      let mensagem = `Não foi possível exportar o ranking (HTTP ${resp.status}).`
      try {
        const body = await resp.json()
        mensagem = body.error || body.erro || mensagem
      } catch {
        // Keep the HTTP status when the server does not return JSON.
      }
      throw new Error(mensagem)
    }

    const blob = await resp.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = 'ranking.xlsx'
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(blobUrl)
    notificar($q, 'sucesso', 'Ranking exportado com sucesso.')
  } catch (e) {
    console.error('Erro ao baixar ranking XLSX:', e)
    notificar($q, 'erro', e.message || 'Não foi possível exportar o ranking.')
  } finally {
    exportando.value = false
  }
}
</script>

<style scoped>
.pa-page {
  --pa-navy: #0B3C5D;
  --pa-orange: #FF7A1A;
  --pa-bom: #2E7D32;
  --pa-ruim: #C62828;
  --pa-borda: #E3E8EE;
  --pa-suave: #5F6B7A;

  min-height: 100vh;
  width: 100%;
  background: #F4F6F9;
}

.pa-container {
  max-width: 1280px;
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
  height: 100%;
  padding: 20px 24px;
  background: #fff;
  border: 1px solid var(--pa-borda);
  border-radius: 12px;
}

.pa-card--tabela {
  padding: 0;
  overflow: hidden;
}

.pa-label {
  font-size: 0.8125rem;
  color: var(--pa-suave);
}

.pa-numero {
  margin-top: 4px;
  font-size: 2rem;
  line-height: 1.2;
  font-weight: 700;
  color: var(--pa-navy);
}

.pa-destaque {
  border-left: 4px solid var(--pa-cor);
}

.pa-destaque--melhor {
  --pa-cor: var(--pa-bom);
}

.pa-destaque--pior {
  --pa-cor: var(--pa-ruim);
}

.pa-destaque-titulo {
  margin-bottom: 12px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--pa-cor);
}

.pa-ponto-nome {
  font-size: 1.125rem;
  line-height: 1.3;
  font-weight: 700;
  color: var(--pa-navy);
}

.pa-media {
  font-size: 2rem;
  line-height: 1.1;
  font-weight: 700;
  color: var(--pa-cor);
}

.pa-stats {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--pa-borda);
}

.pa-stat {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--pa-navy);
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
  transform-origin: left;
  animation: pa-barra-entrada 700ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

@keyframes pa-barra-entrada {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.pa-ranking-skeleton {
  padding: 0 24px 8px;
}

.pa-ranking-skeleton__row {
  display: grid;
  grid-template-columns: 32px minmax(160px, 2fr) minmax(60px, 0.8fr) minmax(110px, 1.3fr) minmax(70px, 1fr);
  align-items: center;
  gap: 16px;
  min-height: 58px;
  border-top: 1px solid var(--pa-borda);
}

.pa-ranking-skeleton__row--head {
  min-height: 44px;
  border-top: 0;
}

.pa-ranking-skeleton__point {
  display: grid;
  gap: 3px;
}

@media (max-width: 700px) {
  .pa-ranking-skeleton__row {
    grid-template-columns: 24px minmax(110px, 1fr) 44px minmax(90px, 1fr);
  }

  .pa-ranking-skeleton__row > :last-child {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pa-barra-fill {
    animation: none;
  }
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