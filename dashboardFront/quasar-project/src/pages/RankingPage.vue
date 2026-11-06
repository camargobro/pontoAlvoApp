<template>
  <q-page class="pa-page">
    <div class="pa-container">
      <header class="pa-header">
        <h1 class="pa-title">Ranking de performance</h1>
        <p class="pa-subtitle">Pontos ordenados pela média de vendas por visita</p>
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
                  <div class="pa-barra-fill" :style="{ width: larguraBarra(props.row.mediaVendas) }"></div>
                </div>
                <span class="pa-barra-valor">{{ formatarDecimal(props.row.mediaVendas) }}</span>
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { apiFetch } from 'src/services/api'
import { tiposPonto } from 'src/constants/tiposPonto'
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

const cidades = computed(() =>
  [...new Set(ranking.value.map((ponto) => ponto.cidade).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
)

const tipos = computed(() => {
  const tiposExistentes = ranking.value.map((ponto) => ponto.tipo).filter(Boolean)
  return [...new Set([...tiposPonto, ...tiposExistentes])]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
})

const rankingFiltrado = computed(() => {
  const filtrado = ranking.value.filter((ponto) =>
    (!cidadeSelecionada.value || ponto.cidade === cidadeSelecionada.value) &&
    (!tipoSelecionado.value || ponto.tipo === tipoSelecionado.value)
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
  { name: 'mediaVendas', label: 'Média vendas', field: 'mediaVendas', align: 'left' },
  { name: 'mediaLeads', label: 'Média leads', field: 'mediaLeads', align: 'center', format: formatarDecimal },
  { name: 'mediaTelemedicina', label: 'Média telemedicina', field: 'mediaTelemedicina', align: 'center', format: formatarDecimal },
]

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
      cidade: ponto.cidade || '',
      tipo: ponto.tipo || '',
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
