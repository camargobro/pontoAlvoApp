<template>
  <q-page class="pa-page">
    <div class="pa-container">
      <header class="pa-header">
        <div class="row items-center justify-between q-col-gutter-md">
          <div class="col">
            <h1 class="pa-title">Calendários</h1>
            <p class="pa-subtitle">Visualize e organize os agendamentos por calendário</p>
          </div>
          <div class="col-auto">
            <q-btn
              unelevated
              no-caps
              color="primary"
              icon="add"
              label="Adicionar agendamento"
              :disable="carregandoDados"
              @click="abrirCriacao"
            />
          </div>
        </div>
      </header>

      <q-banner v-if="erro" rounded class="bg-red-1 text-negative q-mb-lg">
        {{ erro }}
        <template #action>
          <q-btn flat no-caps color="negative" label="Tentar novamente" @click="carregarDados" />
        </template>
      </q-banner>

      <section class="pa-card q-mb-md" aria-label="Selecionar calendário">
        <q-tabs
          v-model="calendarioSelecionado"
          align="left"
          active-color="primary"
          indicator-color="secondary"
          no-caps
          inline-label
        >
          <q-tab
            v-for="calendario in calendarios"
            :key="calendario.value"
            :name="calendario.value"
            :label="calendario.label"
            :icon="calendario.icon"
          />
        </q-tabs>
      </section>

      <section class="pa-card pa-calendario-card">
        <div class="pa-calendario-resumo">
          <div>
            <div class="pa-secao-titulo">{{ calendarioAtual.label }}</div>
            <div class="pa-calendario-contagem">
              {{ agendamentosDoCalendario.length }}
              {{ agendamentosDoCalendario.length === 1 ? 'agendamento' : 'agendamentos' }}
            </div>
          </div>
          <div class="pa-navegacao-mes" aria-label="Navegar entre meses">
            <q-btn
              flat
              round
              dense
              icon="chevron_left"
              aria-label="Mês anterior"
              @click="navegarMes(-1)"
            />
            <strong>{{ mesAtualLabel }}</strong>
            <q-btn
              flat
              round
              dense
              icon="chevron_right"
              aria-label="Próximo mês"
              @click="navegarMes(1)"
            />
          </div>
          <q-btn flat no-caps color="primary" icon="today" label="Hoje" @click="dataVisivel = hoje" />
        </div>

        <div class="pa-calendario-scroll">
          <QCalendarMonth
            v-model="dataVisivel"
            :dark="$q.dark.isActive"
            locale="pt-BR"
            :weekdays="diasSemana"
            bordered
            :day-min-height="112"
            class="pa-qcalendar"
          >
            <template #day="{ scope }">
              <div v-if="agendamentosNaData(scope.timestamp.date).length" class="pa-eventos-dia">
                <q-btn
                  v-for="agendamento in agendamentosNaData(scope.timestamp.date)"
                  :key="agendamento._id"
                  flat
                  dense
                  no-caps
                  class="pa-evento"
                  @click="abrirDetalhes(agendamento)"
                >
                  <span class="pa-evento-texto">
                    {{ agendamento.hora }} · {{ nomePonto(agendamento.pontoId) }}
                  </span>
                  <q-tooltip>
                    {{ agendamento.responsavel }} — {{ agendamento.contato }}
                  </q-tooltip>
                </q-btn>
              </div>
            </template>
          </QCalendarMonth>
        </div>
      </section>
    </div>

    <q-dialog v-model="dialogCriacao" persistent>
      <q-card class="pa-dialog">
        <q-form @submit.prevent="salvarAgendamento">
          <q-card-section>
            <div class="pa-secao-titulo">
              {{ agendamentoEditando ? 'Editar agendamento' : 'Adicionar agendamento' }}
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-select
                  v-model="form.calendario"
                  :options="calendarios"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  :rules="[calendarioObrigatorio]"
                  label="Calendário"
                  lazy-rules
                  outlined
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.data"
                  :rules="[obrigatorio]"
                  label="Data"
                  type="date"
                  stack-label
                  lazy-rules
                  outlined
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.horaInicio"
                  :rules="[obrigatorio]"
                  label="Das"
                  type="time"
                  stack-label
                  lazy-rules
                  outlined
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.horaFim"
                  :rules="[obrigatorio]"
                  label="Às"
                  type="time"
                  stack-label
                  lazy-rules
                  outlined
                />
              </div>
              <div class="col-12">
                <q-select
                  v-model="form.pontoId"
                  :options="pontosFiltrados"
                  :loading="carregandoDados"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="0"
                  :rules="[obrigatorio]"
                  label="Ponto de venda"
                  lazy-rules
                  outlined
                  @filter="filtrarPontos"
                >
                  <template #no-option>
                    <q-item>
                      <q-item-section class="text-grey">Nenhum ponto encontrado</q-item-section>
                    </q-item>
                  </template>
                </q-select>
                <q-btn
                  flat
                  dense
                  no-caps
                  color="primary"
                  icon="add_location_alt"
                  label="Criar ponto"
                  :disable="salvandoPonto"
                  @click="abrirCriacaoPonto"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.responsavel"
                  :rules="[obrigatorio]"
                  label="Responsável"
                  lazy-rules
                  outlined
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.contato"
                  :rules="[obrigatorio]"
                  label="Contato"
                  lazy-rules
                  outlined
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn
              flat
              no-caps
              color="grey-8"
              label="Cancelar"
              :disable="salvando"
              @click="dialogCriacao = false"
            />
            <q-btn
              unelevated
              no-caps
              color="primary"
              :label="agendamentoEditando ? 'Salvar alterações' : 'Salvar agendamento'"
              type="submit"
              :loading="salvando"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogCriacaoPonto" persistent>
      <q-card class="pa-dialog">
        <q-form @submit.prevent="salvarPonto">
          <q-card-section>
            <div class="pa-secao-titulo">Criar ponto</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-8">
                <q-input
                  v-model="novoPonto.nome"
                  :rules="[obrigatorio]"
                  label="Nome do ponto"
                  lazy-rules
                  outlined
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="novoPonto.telefone"
                  :rules="[obrigatorio]"
                  label="Telefone"
                  type="tel"
                  lazy-rules
                  outlined
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="novoPonto.tipo"
                  :options="tiposPonto"
                  :rules="[obrigatorio]"
                  label="Tipo"
                  lazy-rules
                  outlined
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="novoPonto.endereco"
                  :rules="[obrigatorio]"
                  label="Endereço"
                  lazy-rules
                  outlined
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="novoPonto.bairro"
                  :rules="[obrigatorio]"
                  label="Bairro"
                  lazy-rules
                  outlined
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="novoPonto.cidade"
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
            <q-btn
              flat
              no-caps
              color="grey-8"
              label="Cancelar"
              :disable="salvandoPonto"
              @click="dialogCriacaoPonto = false"
            />
            <q-btn
              unelevated
              no-caps
              color="primary"
              label="Salvar ponto"
              type="submit"
              :loading="salvandoPonto"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogDetalhes">
      <q-card v-if="agendamentoSelecionado" class="pa-dialog">
        <q-card-section class="row items-center q-pb-sm">
          <div class="pa-secao-titulo">Detalhes do agendamento</div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="close" aria-label="Fechar detalhes" />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="pa-detalhe">
            <span>Calendário</span>
            <strong>Calendário {{ agendamentoSelecionado.calendario }}</strong>
          </div>
          <div class="pa-detalhe">
            <span>Data e horário</span>
            <strong>{{ dataLegivel(agendamentoSelecionado.data) }} às {{ agendamentoSelecionado.hora }}</strong>
          </div>
          <div class="pa-detalhe">
            <span>Ponto de venda</span>
            <strong>{{ nomePonto(agendamentoSelecionado.pontoId) }}</strong>
          </div>
          <div class="pa-detalhe">
            <span>Endereço do ponto</span>
            <strong>{{ enderecoPonto(agendamentoSelecionado.pontoId) }}</strong>
          </div>
          <div class="pa-detalhe">
            <span>Responsável</span>
            <strong>{{ agendamentoSelecionado.responsavel }}</strong>
          </div>
          <div class="pa-detalhe">
            <span>Contato</span>
            <strong>{{ agendamentoSelecionado.contato }}</strong>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            no-caps
            color="negative"
            icon="delete_outline"
            label="Excluir agendamento"
            @click="confirmarExclusao"
          />
          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="edit"
            label="Editar agendamento"
            @click="abrirEdicao"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <ConfirmDialog
      v-model="dialogExclusao"
      icon="delete_outline"
      title="Excluir agendamento?"
      message="Esta ação não pode ser desfeita."
      confirm-label="Excluir agendamento"
      intent="danger"
      @confirm="excluirAgendamento"
    />
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import ConfirmDialog from 'src/components/ConfirmDialog.vue'
import { QCalendarMonth } from '@quasar/quasar-ui-qcalendar/QCalendarMonth'
import '@quasar/quasar-ui-qcalendar/QCalendarMonth.css'
import { tiposPonto } from 'src/constants/tiposPonto'
import { listarCidades, normalizarCidade, normalizarTipoPonto } from 'src/constants/classificacaoPonto'
import { apiFetch } from 'src/services/api'
import { notificar } from 'src/services/notificacoes'

const $q = useQuasar()
const calendarios = [
  { label: 'Calendário 1', value: 1, icon: 'event' },
  { label: 'Calendário 2', value: 2, icon: 'event' },
  { label: 'Calendário 3', value: 3, icon: 'event' },
]
const hoje = dataAtual()
const diasSemana = [1, 2, 3, 4, 5, 6, 0]
const calendarioSelecionado = ref(1)
const dataVisivel = ref(hoje)
const agendamentos = ref([])
const pontos = ref([])
const carregandoDados = ref(true)
const salvando = ref(false)
const salvandoPonto = ref(false)
const erro = ref('')
const dialogCriacao = ref(false)
const dialogCriacaoPonto = ref(false)
const dialogDetalhes = ref(false)
const dialogExclusao = ref(false)
const agendamentoSelecionado = ref(null)
const agendamentoEditando = ref(null)
const filtroPonto = ref('')
const pontosFiltrados = ref([])
const form = ref(criarFormulario())
const novoPonto = ref(criarPontoVazio())

const calendarioAtual = computed(() =>
  calendarios.find((calendario) => calendario.value === calendarioSelecionado.value) || calendarios[0],
)
const mesAtualLabel = computed(() => {
  const [ano, mes] = dataVisivel.value.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(ano, mes - 1, 1))
})
const agendamentosDoCalendario = computed(() =>
  agendamentos.value
    .filter((agendamento) => Number(agendamento.calendario) === calendarioSelecionado.value)
    .sort((a, b) => String(a.hora).localeCompare(String(b.hora))),
)
const cidadesDisponiveis = computed(() => listarCidades(pontos.value))
const obrigatorio = (valor) =>
  (typeof valor === 'string' && valor.trim().length > 0) || 'Campo obrigatório'
const calendarioObrigatorio = (valor) =>
  [1, 2, 3].includes(Number(valor)) || 'Selecione um calendário válido'

function dataAtual() {
  const data = new Date()
  return formatarData(data)
}

function formatarData(data) {
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${data.getFullYear()}-${mes}-${dia}`
}

function navegarMes(direcao) {
  const [ano, mes] = dataVisivel.value.split('-').map(Number)
  dataVisivel.value = formatarData(new Date(ano, mes - 1 + direcao, 1))
}

function criarFormulario() {
  return {
    calendario: calendarioSelecionado.value,
    data: dataAtual(),
    horaInicio: '',
    horaFim: '',
    pontoId: '',
    responsavel: '',
    contato: '',
  }
}

function criarPontoVazio() {
  return { nome: '', telefone: '', endereco: '', bairro: '', cidade: '', tipo: '' }
}

function dataDoAgendamento(valor) {
  return String(valor || '').match(/^\d{4}-\d{2}-\d{2}/)?.[0] || ''
}

function dataLegivel(valor) {
  const data = dataDoAgendamento(valor)
  if (!data) return '—'
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function agendamentosNaData(data) {
  return agendamentosDoCalendario.value
    .filter((agendamento) => dataDoAgendamento(agendamento.data) === data)
    .sort((a, b) => String(a.hora).localeCompare(String(b.hora)))
}

function nomePonto(pontoId) {
  return pontos.value.find((ponto) => String(ponto._id) === String(pontoId))?.nome || 'Ponto não encontrado'
}

function enderecoPonto(pontoId) {
  return pontos.value.find((ponto) => String(ponto._id) === String(pontoId))?.endereco || 'Endereço não encontrado'
}

function opcoesPonto() {
  return pontos.value.map((ponto) => ({
    label: `${ponto.nome} — ${ponto.endereco || 'Endereço não informado'}`,
    value: ponto._id,
  }))
}

function abrirCriacao() {
  agendamentoEditando.value = null
  form.value = { ...criarFormulario(), calendario: calendarioSelecionado.value }
  filtroPonto.value = ''
  pontosFiltrados.value = opcoesPonto()
  dialogCriacao.value = true
}

function abrirDetalhes(agendamento) {
  agendamentoSelecionado.value = agendamento
  dialogDetalhes.value = true
}

function abrirEdicao() {
  const agendamento = agendamentoSelecionado.value
  if (!agendamento) return

  const horario = String(agendamento.hora || '').match(/^\s*(\d{2}:\d{2})(?:\s+às\s+(\d{2}:\d{2}))?\s*$/i)
  agendamentoEditando.value = agendamento
  form.value = {
    calendario: Number(agendamento.calendario),
    data: dataDoAgendamento(agendamento.data),
    horaInicio: horario?.[1] || '',
    horaFim: horario?.[2] || '',
    pontoId: String(agendamento.pontoId || ''),
    responsavel: agendamento.responsavel || '',
    contato: agendamento.contato || '',
  }
  filtroPonto.value = ''
  pontosFiltrados.value = opcoesPonto()
  dialogDetalhes.value = false
  dialogCriacao.value = true
}

function abrirCriacaoPonto() {
  novoPonto.value = criarPontoVazio()
  dialogCriacaoPonto.value = true
}

function confirmarExclusao() {
  dialogExclusao.value = true
}

function filtrarPontos(valor, atualizar) {
  atualizar(() => {
    filtroPonto.value = valor
    const termo = valor.trim().toLocaleLowerCase('pt-BR')
    pontosFiltrados.value = opcoesPonto()
      .filter((opcao) => opcao.label.toLocaleLowerCase('pt-BR').includes(termo))
  })
}

async function mensagemErroResposta(response, fallback) {
  let corpo = null
  try {
    corpo = await response.clone().json()
  } catch {
    return `${fallback} (HTTP ${response.status}).`
  }
  return corpo?.error || corpo?.erro || corpo?.message || `${fallback} (HTTP ${response.status}).`
}

async function carregarDados() {
  carregandoDados.value = true
  erro.value = ''

  try {
    const [respostaAgendamentos, respostaPontos] = await Promise.all([
      apiFetch('/agendamentos'),
      apiFetch('/pontos'),
    ])
    if (!respostaAgendamentos.ok) {
      throw new Error(await mensagemErroResposta(respostaAgendamentos, 'Não foi possível carregar os agendamentos'))
    }
    if (!respostaPontos.ok) {
      throw new Error(await mensagemErroResposta(respostaPontos, 'Não foi possível carregar os pontos'))
    }

    agendamentos.value = await respostaAgendamentos.json()
    pontos.value = await respostaPontos.json()
  } catch (error) {
    erro.value = error.message || 'Não foi possível carregar os dados. Tente novamente.'
  } finally {
    carregandoDados.value = false
  }
}

async function salvarAgendamento() {
  salvando.value = true
  try {
    const editando = agendamentoEditando.value
    const resposta = await apiFetch(editando ? `/agendamentos/${encodeURIComponent(editando._id)}` : '/agendamentos', {
      method: editando ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        calendario: Number(form.value.calendario),
        data: form.value.data,
        hora: `${form.value.horaInicio} às ${form.value.horaFim}`,
        pontoId: form.value.pontoId,
        responsavel: form.value.responsavel,
        contato: form.value.contato,
      }),
    })
    if (!resposta.ok) {
      throw new Error(await mensagemErroResposta(resposta, 'Não foi possível salvar o agendamento'))
    }

    calendarioSelecionado.value = Number(form.value.calendario)
    dataVisivel.value = form.value.data
    dialogCriacao.value = false
    dialogDetalhes.value = false
    agendamentoSelecionado.value = null
    agendamentoEditando.value = null
    notificar($q, 'sucesso', editando ? 'Agendamento atualizado com sucesso.' : 'Agendamento criado com sucesso.')
    await carregarDados()
  } catch (error) {
    notificar($q, 'erro', error.message || 'Não foi possível salvar o agendamento.')
  } finally {
    salvando.value = false
  }
}

async function excluirAgendamento() {
  const agendamento = agendamentoSelecionado.value
  if (!agendamento) return

  try {
    const resposta = await apiFetch(`/agendamentos/${encodeURIComponent(agendamento._id)}`, {
      method: 'DELETE',
    })
    if (!resposta.ok) {
      throw new Error(await mensagemErroResposta(resposta, 'Não foi possível excluir o agendamento'))
    }

    agendamentos.value = agendamentos.value.filter((item) => item._id !== agendamento._id)
    dialogDetalhes.value = false
    agendamentoSelecionado.value = null
    notificar($q, 'sucesso', 'Agendamento excluído com sucesso.')
  } catch (error) {
    notificar($q, 'erro', error.message || 'Não foi possível excluir o agendamento.')
  }
}

async function salvarPonto() {
  salvandoPonto.value = true
  try {
    const resposta = await apiFetch('/pontos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: novoPonto.value.nome.trim(),
        telefone: novoPonto.value.telefone.trim(),
        endereco: novoPonto.value.endereco.trim(),
        bairro: novoPonto.value.bairro.trim(),
        cidade: normalizarCidade(novoPonto.value.cidade),
        tipo: normalizarTipoPonto(novoPonto.value.tipo),
      }),
    })
    if (!resposta.ok) {
      throw new Error(await mensagemErroResposta(resposta, 'Não foi possível criar o ponto'))
    }

    const pontoCriado = await resposta.json()
    pontos.value = [...pontos.value, pontoCriado]
    pontosFiltrados.value = opcoesPonto()
    form.value.pontoId = String(pontoCriado._id)
    dialogCriacaoPonto.value = false
    notificar($q, 'sucesso', 'Ponto criado e selecionado no agendamento.')
  } catch (error) {
    notificar($q, 'erro', error.message || 'Não foi possível criar o ponto.')
  } finally {
    salvandoPonto.value = false
  }
}

onMounted(carregarDados)
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
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px 48px;
}

.pa-header {
  margin-bottom: 28px;
}

.pa-title {
  margin: 0;
  color: var(--pa-navy);
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
}

.pa-title::after {
  display: block;
  width: 48px;
  height: 4px;
  margin-top: 12px;
  border-radius: 2px;
  background: var(--pa-orange);
  content: '';
}

.pa-subtitle {
  margin: 12px 0 0;
  color: var(--pa-suave);
}

.pa-card {
  overflow: hidden;
  border: 1px solid var(--pa-borda);
  border-radius: 12px;
  background: #fff;
}

.pa-calendario-card {
  padding: 20px;
}

.pa-calendario-resumo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.pa-secao-titulo {
  color: var(--pa-navy);
  font-size: 1.05rem;
  font-weight: 700;
}

.pa-calendario-contagem {
  margin-top: 4px;
  color: var(--pa-suave);
  font-size: 0.875rem;
}

.pa-calendario-scroll {
  overflow-x: auto;
}

.pa-qcalendar {
  min-width: 720px;
  --calendar-border: #E3E8EE;
  --calendar-color: #22303C;
  --calendar-background: #fff;
  --calendar-dark-border: #354252;
  --calendar-dark-color: #E7EDF4;
  --calendar-dark-background: #1B2532;
}

.pa-eventos-dia {
  display: flex;
  max-height: 76px;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  padding: 2px 4px 4px;
}

.pa-evento {
  min-height: 22px;
  justify-content: flex-start;
  overflow: hidden;
  border-radius: 4px;
  background: rgba(11, 60, 93, 0.09);
  color: var(--pa-navy);
  font-size: 0.72rem;
  line-height: 1.2;
  text-align: left;
}

.pa-evento :deep(.q-btn__content) {
  width: 100%;
  justify-content: flex-start;
  overflow: hidden;
}

.pa-evento-texto {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pa-dialog {
  width: 100%;
  max-width: 620px;
  border-radius: 12px;
}

.pa-detalhe {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 0;
  border-bottom: 1px solid var(--pa-borda);
}

.pa-detalhe:last-child {
  border-bottom: 0;
}

.pa-detalhe span {
  color: var(--pa-suave);
  font-size: 0.8125rem;
}

@media (max-width: 600px) {
  .pa-container {
    padding: 24px 16px 36px;
  }

  .pa-header .col-auto {
    width: 100%;
  }

  .pa-header .q-btn {
    width: 100%;
  }

  .pa-calendario-card {
    padding: 12px;
  }

  .pa-qcalendar {
    min-width: 640px;
  }
}
</style>
