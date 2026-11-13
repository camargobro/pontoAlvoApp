<template>
  <q-page class="pa-page">
    <div class="pa-container">

      <header class="pa-header">
        <div class="row items-center justify-between q-col-gutter-md">
          <div class="col-12 col-sm">
            <h1 class="pa-title">Pontos</h1>
            <p class="pa-subtitle">Todos os pontos de venda cadastrados</p>
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn
              unelevated
              no-caps
              color="primary"
              icon="add"
              label="Criar ponto"
              @click="abrirCriacao"
            />
          </div>
        </div>
      </header>

      <q-banner v-if="erro" rounded class="bg-red-1 text-negative q-mb-lg">
        {{ erroMensagem || 'Não foi possível carregar os pontos. Tente novamente em instantes.' }}
        <template v-slot:action>
          <q-btn flat no-caps color="negative" label="Tentar novamente" @click="carregarPontos" />
        </template>
      </q-banner>

      <div class="pa-card pa-card--tabela">

        <div class="row items-center justify-between q-col-gutter-md pa-tabela-topo">
          <div class="col-12 col-sm-auto">
            <div class="pa-secao-titulo">
              {{ carregando ? 'Carregando...' : `${pontos.length} ${pontos.length === 1 ? 'ponto' : 'pontos'}` }}
            </div>
          </div>

          <div class="col-12 col-sm-5">
            <q-input
              v-model="filtro"
              label="Buscar por nome, telefone, bairro, cidade ou tipo"
              dense
              outlined
              clearable
            />
          </div>
        </div>

        <q-table
          v-model:pagination="paginacao"
          :rows="pontos"
          :columns="columns"
          :filter="filtro"
          :loading="carregando"
          :rows-per-page-options="[10, 25, 50, 0]"
          rows-per-page-label="Linhas por página"
          no-data-label="Nenhum ponto cadastrado ainda."
          no-results-label="Nenhum ponto corresponde à busca."
          :pagination-label="(inicio, fim, total) => `${inicio}-${fim} de ${total}`"
          table-header-class="pa-thead"
          row-key="_id"
          flat
        >

          <template v-slot:body-cell-nome="props">
            <q-td :props="props">
              <div class="row items-center no-wrap q-gutter-xs">
                <span class="pa-ponto-nome">{{ props.row.nome }}</span>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-tipo="props">
            <q-td :props="props">
              <span class="pa-tipo">{{ props.row.tipo }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-telefone="props">
            <q-td :props="props">
              <WhatsAppContact :phone="props.row.telefone" fallback="—" />
            </q-td>
          </template>

          <template v-slot:body-cell-acoes="props">
            <q-td :props="props" class="text-right">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="visibility"
                :aria-label="`Ver detalhes de ${props.row.nome}`"
                @click="abrirDetalhes(props.row)"
              >
                <q-tooltip>Ver detalhes e histórico</q-tooltip>
              </q-btn>
              <EditButton
                v-if="podeGerenciarPontos"
                :label="`Editar ${props.row.nome}`"
                @click="abrirEdicao(props.row)"
              />
              <DeleteButton
                v-if="podeGerenciarPontos"
                :label="`Excluir ${props.row.nome}`"
                @click="confirmarExclusao(props.row)"
              />
            </q-td>
          </template>

        </q-table>
      </div>

    </div>

    <ConfirmDialog
      v-model="dialogExclusao"
      icon="delete_outline"
      title="Excluir ponto?"
      message="O ponto e todas as ações registradas nele serão excluídos. Esta operação não pode ser desfeita."
      confirm-label="Excluir ponto"
      intent="danger"
      @confirm="excluirPonto"
    />

    <q-dialog v-model="dialogPonto" persistent>
      <q-card class="pa-dialog">
        <q-form @submit.prevent="salvarPonto">
          <q-card-section>
            <div class="pa-secao-titulo">{{ criandoPonto ? 'Criar ponto' : 'Editar ponto' }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-8">
                <q-input v-model="pontoEmEdicao.nome" :rules="[obrigatorio]" label="Nome do ponto" lazy-rules outlined />
              </div>
              <div class="col-12 col-sm-4">
                <q-input v-model="pontoEmEdicao.telefone" :rules="[obrigatorio]" label="Telefone" type="tel" lazy-rules outlined />
              </div>
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="pontoEmEdicao.tipo"
                  :options="tiposPontoDisponiveis"
                  :rules="[obrigatorio]"
                  label="Tipo"
                  lazy-rules
                  outlined
                />
              </div>
              <div class="col-12">
                <q-input v-model="pontoEmEdicao.endereco" :rules="[obrigatorio]" label="Endereço" lazy-rules outlined />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="pontoEmEdicao.bairro" :rules="[obrigatorio]" label="Bairro" lazy-rules outlined />
              </div>
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="pontoEmEdicao.cidade"
                  :options="cidadesDisponiveis"
                  :rules="[obrigatorio]"
                  label="Cidade"
                  lazy-rules
                  outlined
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="0"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat no-caps color="grey-8" label="Cancelar" :disable="salvandoPonto" @click="dialogPonto = false" />
            <q-btn
              unelevated
              no-caps
              color="primary"
              :label="criandoPonto ? 'Criar ponto' : 'Salvar alterações'"
              type="submit"
              :loading="salvandoPonto"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

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
import { computed, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import DeleteButton from '../components/DeleteButton.vue'
import EditButton from '../components/EditButton.vue'
import WhatsAppContact from '../components/WhatsAppContact.vue'
import { apiFetch } from '../services/api.js'
import { notificar } from '../services/notificacoes.js'
import { tiposPonto } from '../constants/tiposPonto.js'
import { listarCidades, normalizarCidade, normalizarTipoPonto } from '../constants/classificacaoPonto.js'
import { temPapel } from '../services/auth.js'

const $q = useQuasar()
const pontos = ref([])
const carregando = ref(true)
const erro = ref(false)
const erroMensagem = ref('')
const filtro = ref('')
const dialogExclusao = ref(false)
const pontoSelecionado = ref(null)
const dialogPonto = ref(false)
const dialogDetalhes = ref(false)
const criandoPonto = ref(false)
const salvandoPonto = ref(false)
const pontoEmEdicao = ref(criarPontoVazio())
const pontoParaDetalhes = ref(null)
const pontoDetalhado = ref(null)
const acoesDoPonto = ref([])
const carregandoDetalhes = ref(false)
const erroDetalhes = ref('')
let requisicaoDetalhes = 0
const paginacao = ref({ sortBy: 'nome', descending: false, rowsPerPage: 10 })
const podeGerenciarPontos = temPapel('gestor')

const ordenarTexto = (a, b) => String(a || '').localeCompare(String(b || ''), 'pt-BR')
const tiposPontoDisponiveis = computed(() => {
  return tiposPonto
})
const cidadesDisponiveis = computed(() => listarCidades(pontos.value))
const obrigatorio = (valor) =>
  (typeof valor === 'string' && valor.trim().length > 0) || 'Campo obrigatório'

function criarPontoVazio() {
  return { _id: '', nome: '', telefone: '', endereco: '', bairro: '', cidade: '', tipo: '' }
}

async function mensagemErroResposta(response, fallback) {
  let body = null
  try {
    body = await response.clone().json()
  } catch {
    // The API may return a non-JSON 404 for an unregistered route.
  }

  return body?.error || body?.erro || body?.message ||
    `${fallback} (HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''}).`
}

const columns = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left', sortable: true, sort: ordenarTexto },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left', sortable: true, sort: ordenarTexto, format: normalizarTipoPonto },
  { name: 'telefone', label: 'Telefone', field: 'telefone', align: 'left', format: (valor) => valor || '—' },
  { name: 'endereco', label: 'Endereço', field: 'endereco', align: 'left' },
  { name: 'bairro', label: 'Bairro', field: 'bairro', align: 'left', sortable: true, sort: ordenarTexto },
  { name: 'cidade', label: 'Cidade', field: 'cidade', align: 'left', sortable: true, sort: ordenarTexto, format: normalizarCidade },
  { name: 'acoes', label: '', field: '_id', align: 'right' }
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
  const ponto = pontoParaDetalhes.value
  if (!ponto?._id) return

  const idRequisicao = ++requisicaoDetalhes
  carregandoDetalhes.value = true
  erroDetalhes.value = ''

  try {
    const [respostaPonto, respostaAcoes] = await Promise.all([
      apiFetch(`/pontos/${encodeURIComponent(ponto._id)}`),
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

function abrirDetalhes(ponto) {
  pontoParaDetalhes.value = ponto
  pontoDetalhado.value = null
  acoesDoPonto.value = []
  dialogDetalhes.value = true
  carregarDetalhesPonto()
}

function limparDetalhes() {
  requisicaoDetalhes += 1
  carregandoDetalhes.value = false
  pontoParaDetalhes.value = null
  pontoDetalhado.value = null
  acoesDoPonto.value = []
  erroDetalhes.value = ''
}

function abrirEdicao(ponto) {
  criandoPonto.value = false
  pontoEmEdicao.value = {
    ...ponto,
    cidade: normalizarCidade(ponto.cidade),
    tipo: normalizarTipoPonto(ponto.tipo),
  }
  dialogPonto.value = true
}

function abrirCriacao() {
  criandoPonto.value = true
  pontoEmEdicao.value = criarPontoVazio()
  dialogPonto.value = true
}

async function salvarPonto() {
  salvandoPonto.value = true

  try {
    const { _id, nome, telefone, endereco, bairro } = pontoEmEdicao.value
    const cidade = normalizarCidade(pontoEmEdicao.value.cidade)
    const tipo = normalizarTipoPonto(pontoEmEdicao.value.tipo)
    const criando = criandoPonto.value
    const response = await apiFetch(criando ? '/pontos' : `/pontos/${_id}`, {
      method: criando ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, telefone, endereco, bairro, cidade, tipo }),
    })
    if (!response.ok) {
      const operacao = criando ? 'criar' : 'atualizar'
      throw new Error(await mensagemErroResposta(response, `Não foi possível ${operacao} o ponto`))
    }

    const pontoSalvo = await response.json()
    if (criando) {
      pontos.value = [...pontos.value, pontoSalvo]
      notificar($q, 'sucesso', 'Ponto criado com sucesso.')
    } else {
      pontos.value = pontos.value.map((ponto) => ponto._id === _id ? pontoSalvo : ponto)
      notificar($q, 'sucesso', 'Ponto atualizado com sucesso.')
    }
    dialogPonto.value = false
  } catch (error) {
    console.error('Erro ao salvar ponto:', error)
    notificar($q, 'erro', error.message || 'Não foi possível salvar o ponto.')
  } finally {
    salvandoPonto.value = false
  }
}

function confirmarExclusao(ponto) {
  pontoSelecionado.value = ponto
  dialogExclusao.value = true
}

async function excluirPonto() {
  const ponto = pontoSelecionado.value
  if (!ponto) return

  try {
    const response = await apiFetch(`/pontos/${ponto._id}`, { method: 'DELETE' })
    if (!response.ok) {
      throw new Error(await mensagemErroResposta(response, 'Não foi possível excluir o ponto'))
    }

    pontos.value = pontos.value.filter((item) => item._id !== ponto._id)
    notificar($q, 'sucesso', 'Ponto e ações excluídos com sucesso.')
  } catch (error) {
    console.error('Erro ao excluir ponto:', error)
    notificar($q, 'erro', error.message || 'Não foi possível excluir o ponto.')
  } finally {
    pontoSelecionado.value = null
  }
}

async function carregarPontos() {
  carregando.value = true
  erro.value = false
  erroMensagem.value = ''

  try {
    const response = await apiFetch('/pontos')
    if (!response.ok) {
      throw new Error(await mensagemErroResposta(response, 'Falha ao carregar pontos'))
    }
    pontos.value = await response.json()
  } catch (e) {
    erro.value = true
    erroMensagem.value = e.message || 'Não foi possível carregar os pontos.'
    console.error('Erro ao carregar pontos:', e)
  } finally {
    carregando.value = false
  }
}

onMounted(() => {
  carregarPontos()
})
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

.pa-card--tabela {
  overflow: hidden;
}

.pa-dialog {
  width: 100%;
  max-width: 560px;
  border-radius: 12px;
}

.pa-dialog--detalhes {
  max-width: 880px;
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
  margin: 0;
  padding: 16px 24px;
  border-bottom: 1px solid var(--pa-borda);
}

.pa-secao-titulo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--pa-navy);
}

.pa-ponto-nome {
  font-weight: 700;
  color: var(--pa-navy);
}

.pa-tipo {
  display: inline-block;
  padding: 2px 10px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--pa-navy);
  background: rgba(11, 60, 93, 0.08);
  border-radius: 999px;
}

.pa-card--tabela :deep(.pa-thead th) {
  font-weight: 700;
  font-size: 0.8125rem;
  color: var(--pa-navy);
  background: #F8FAFC;
}
</style>