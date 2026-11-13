<template>
  <q-page class="pa-page">
    <div class="pa-container" :class="{ 'pa-container--larga': isHistory }">

      <div v-if="!isHistory">

        <header class="pa-header">
          <h1 class="pa-title">Registrar ação</h1>
          <p class="pa-subtitle">Informe o ponto, a data e o resultado da ação</p>
        </header>

        <div class="pa-card">
          <q-form ref="formRef" @submit.prevent="enviarAcao">
            <div class="row q-col-gutter-md">

              <div class="col-12">
                <q-select
                  v-model="form.pontoId"
                  :options="pontosFiltrados"
                  :loading="carregandoPontos"
                  :rules="[obrigatorio]"
                  label="Ponto de venda"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="0"
                  lazy-rules
                  outlined
                  @filter="filtrarPontos"
                >
                  <template v-slot:no-option>
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
                  label="Adicionar novo ponto"
                  @click="toggleAddPonto"
                />
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.data"
                  :rules="[obrigatorio]"
                  label="Data da ação"
                  type="date"
                  min="2023-01-01"
                  :max="hoje"
                  stack-label
                  lazy-rules
                  outlined
                />
              </div>

              <div class="col-12 col-sm-6 col-md-4">
                <q-input
                  v-model.number="form.degustacao_tele"
                  :rules="[naoNegativo]"
                  label="Consultas"
                  type="number"
                  min="0"
                  lazy-rules
                  outlined
                />
              </div>

              <div class="col-12 col-sm-6 col-md-4">
                <q-input
                  v-model.number="form.leads"
                  :rules="[naoNegativo]"
                  label="Leads"
                  type="number"
                  min="0"
                  lazy-rules
                  outlined
                />
              </div>

              <div class="col-12 col-sm-6 col-md-4">
                <q-input
                  v-model.number="form.vendas"
                  :rules="[naoNegativo]"
                  label="Vidas"
                  type="number"
                  min="0"
                  lazy-rules
                  outlined
                />
              </div>

            </div>

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat no-caps color="grey-8" label="Limpar campos" @click="resetForm" />
              <q-btn
                unelevated
                no-caps
                color="primary"
                label="Registrar ação"
                type="submit"
                class="q-px-lg"
                :loading="enviando"
              />
            </div>
          </q-form>
        </div>

        <q-dialog v-model="addNewPonto" persistent content-class="dialog-blur">
          <q-card class="pa-dialog">
            <q-form @submit.prevent="salvarNovoPonto">
              <q-card-section>
                <div class="pa-secao-titulo">Novo ponto</div>
                <div class="pa-label">O ponto será selecionado automaticamente na ação.</div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-8">
                    <q-input v-model="novoPonto.nome" :rules="[obrigatorio]" label="Nome do ponto" lazy-rules outlined />
                  </div>
                  <div class="col-12 col-sm-4">
                    <q-input v-model="novoPonto.telefone" :rules="[obrigatorio]" label="Telefone" type="tel" lazy-rules outlined />
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
                    <q-input v-model="novoPonto.endereco" :rules="[obrigatorio]" label="Endereço" lazy-rules outlined />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input v-model="novoPonto.bairro" :rules="[obrigatorio]" label="Bairro" lazy-rules outlined />
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
                <q-btn flat no-caps color="grey-8" label="Cancelar" @click="toggleAddPonto" />
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
      </div>

      <div v-else>

        <header class="pa-header">
          <h1 class="pa-title">Histórico de ações</h1>
          <p class="pa-subtitle">Da ação mais recente para a mais antiga</p>
        </header>

        <div class="pa-card pa-filtros-historico">
          <q-input
            v-model="filtroHistorico"
            outlined
            dense
            clearable
            label="Pesquisar no histórico"
            placeholder="Ponto, bairro, cidade, tipo, endereço..."
            class="pa-busca-historico"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-input
            v-model="dataInicial"
            outlined
            dense
            clearable
            type="date"
            label="Data inicial"
            stack-label
            class="pa-data-historico"
          />
          <q-input
            v-model="dataFinal"
            outlined
            dense
            clearable
            type="date"
            label="Data final"
            stack-label
            class="pa-data-historico"
          />
          <q-btn
            v-if="filtrosHistoricoAtivos"
            flat
            no-caps
            color="primary"
            icon="filter_alt_off"
            label="Limpar filtros"
            @click="limparFiltrosHistorico"
          />
        </div>
        <div v-if="intervaloDatasInvalido" class="pa-erro-filtro" role="alert">
          A data inicial deve ser anterior ou igual à data final.
        </div>

        <div class="pa-card pa-card--tabela">

          <div class="pa-tabela-topo pa-label">
            Cor das vidas:
            <span class="pa-vendas--zero">0</span>,
            <span class="pa-vendas--baixa">de 1 a 4</span>,
            <span class="pa-vendas--boa">5 ou mais</span>
          </div>

          <q-table
            v-model:pagination="paginacao"
            :rows="acoesFiltradas"
            :columns="columns"
            :loading="carregandoAcoes || carregandoPontos"
            :rows-per-page-options="[10, 25, 50, 0]"
            rows-per-page-label="Linhas por página"
            :no-data-label="mensagemSemAcoes"
            :pagination-label="(inicio, fim, total) => `${inicio}-${fim} de ${total}`"
            table-header-class="pa-thead"
            row-key="_id"
            flat
          >

            <template v-slot:body-cell-pontoNome="props">
              <q-td :props="props">
                <div class="row items-center no-wrap q-gutter-xs">
                  <div class="pa-ponto-nome">{{ props.row.pontoNome }}</div>
                </div>
                <div class="pa-label">{{ props.row.endereco }}</div>
                <div class="pa-label">
                  <WhatsAppContact :phone="props.row.telefone" />
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-vendas="props">
              <q-td :props="props">
                <span class="pa-vendas" :class="vendasClass(props.row.vendas)">
                  {{ props.row.vendas }}
                </span>
              </q-td>
            </template>

            <template v-slot:body-cell-degustacao_tele="props">
              <q-td :props="props" class="text-center">
                {{ props.row.degustacao_tele ?? 0 }}
              </q-td>
            </template>

            <template v-slot:body-cell-acoes="props">
              <q-td :props="props">
                <EditButton
                  v-if="podeAlterarAcao(props.row)"
                  label="Editar ação"
                  @click="abrirEdicaoAcao(props.row)"
                />
                <DeleteButton
                  v-if="podeAlterarAcao(props.row)"
                  label="Excluir ação"
                  @click="confirmarExclusao(props.row._id)"
                />
              </q-td>
            </template>

          </q-table>
        </div>
      </div>
    </div>

    <q-dialog v-model="dialogEdicaoAcao" persistent>
      <q-card class="pa-dialog">
        <q-form @submit.prevent="salvarEdicaoAcao">
          <q-card-section>
            <div class="pa-secao-titulo">Editar ação</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-select
                  v-model="acaoEmEdicao.pontoId"
                  :options="pontosFiltrados"
                  :loading="carregandoPontos"
                  :rules="[obrigatorio]"
                  label="Ponto de venda"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="0"
                  lazy-rules
                  outlined
                  @filter="filtrarPontos"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">Nenhum ponto encontrado</q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="acaoEmEdicao.data"
                  :rules="[obrigatorio]"
                  label="Data da ação"
                  type="date"
                  min="2023-01-01"
                  :max="hoje"
                  stack-label
                  lazy-rules
                  outlined
                />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-input
                  v-model.number="acaoEmEdicao.leads"
                  :rules="[naoNegativo]"
                  label="Leads"
                  type="number"
                  min="0"
                  lazy-rules
                  outlined
                />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-input
                  v-model.number="acaoEmEdicao.vendas"
                  :rules="[naoNegativo]"
                  label="Vidas"
                  type="number"
                  min="0"
                  lazy-rules
                  outlined
                />
              </div>
              <div class="col-12 col-sm-6 col-md-4">
                <q-input
                  v-model.number="acaoEmEdicao.degustacao_tele"
                  :rules="[naoNegativo]"
                  label="Consultas"
                  type="number"
                  min="0"
                  lazy-rules
                  outlined
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat no-caps color="grey-8" label="Cancelar" :disable="salvandoEdicaoAcao" @click="dialogEdicaoAcao = false" />
            <q-btn unelevated no-caps color="primary" label="Salvar alterações" type="submit" :loading="salvandoEdicaoAcao" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <ConfirmDialog
      v-model="dialogExclusao"
      icon="delete_outline"
      title="Excluir ação?"
      message="Esta ação será removida do histórico e não poderá ser recuperada."
      confirm-label="Excluir"
      intent="danger"
      @confirm="executarExclusao"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue';
import ConfirmDialog from 'src/components/ConfirmDialog.vue';
import DeleteButton from 'src/components/DeleteButton.vue';
import EditButton from 'src/components/EditButton.vue';
import WhatsAppContact from 'src/components/WhatsAppContact.vue';
import { useQuasar } from 'quasar';
import { useRoute } from 'vue-router';
import { apiFetch } from 'src/services/api';
import { notificar } from 'src/services/notificacoes';
import { tiposPonto } from 'src/constants/tiposPonto';
import { listarCidades, normalizarCidade, normalizarTipoPonto } from 'src/constants/classificacaoPonto';
import { getUser, temPapel } from 'src/services/auth';

const $q = useQuasar();
const route = useRoute();
const acoes = ref([]);
const pontos = ref([]);
const erroPontos = ref(false);
const dialogExclusao = ref(false);
const acaoSelecionada = ref(null);
const dialogEdicaoAcao = ref(false);
const salvandoEdicaoAcao = ref(false);
const acaoEmEdicao = ref(criarAcaoVazia());
const usuarioAtual = getUser();
const hoje = formatarDataInput(new Date());
const filtroHistorico = ref('');
const dataInicial = ref('');
const dataFinal = ref('');
const form = ref({ pontoId: '', data: hoje, leads: 0, vendas: 0, degustacao_tele: 0 });
const formRef = ref(null);
const addNewPonto = ref(false);
const novoPonto = ref({ nome: '', telefone: '', endereco: '', bairro: '', cidade: '', tipo: '' });
const enviando = ref(false);
const salvandoPonto = ref(false);
const carregandoPontos = ref(true);
const carregandoAcoes = ref(true);
const filtroPonto = ref('');
const paginacao = ref({ rowsPerPage: 10 });
const cidadesDisponiveis = computed(() => listarCidades(pontos.value));

function avisar(tipo, message) {
  notificar($q, tipo, message);
}

function abrirEdicaoAcao(acao) {
  acaoEmEdicao.value = {
    ...acao,
    data: String(acao.data || '').match(/^\d{4}-\d{2}-\d{2}/)?.[0] || '',
    leads: acao.leads ?? '',
    vendas: acao.vendas ?? '',
    degustacao_tele: acao.degustacao_tele ?? 0,
  };
  dialogEdicaoAcao.value = true;
}

async function salvarEdicaoAcao() {
  salvandoEdicaoAcao.value = true;

  try {
    const { _id, pontoId, data, leads, vendas, degustacao_tele } = acaoEmEdicao.value;
    const payload = {
      pontoId,
      data,
      leads: Number(leads),
      vendas: Number(vendas),
      degustacao_tele: Number(degustacao_tele),
    };
    const response = await apiFetch(`/acoes/${_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(await mensagemErroResposta(response, 'Não foi possível atualizar a ação'));
    }

    const acaoAtualizada = await response.json();
    acoes.value = acoes.value.map((acao) => acao._id === _id ? acaoAtualizada : acao);
    dialogEdicaoAcao.value = false;
    avisar('sucesso', 'Ação atualizada com sucesso.');
  } catch (error) {
    console.error('Erro ao atualizar ação:', error);
    avisar('erro', error.message || 'Não foi possível atualizar a ação.');
  } finally {
    salvandoEdicaoAcao.value = false;
  }
}

const isHistory = computed(() => route.path === '/app/historico-acoes');
const podeAlterarAcao = (acao) =>
  temPapel('gestor') ||
  (temPapel('colaborador') && String(acao.usuarioId || '') === String(usuarioAtual?.id || ''));

const obrigatorio = (val) =>
  (typeof val === 'string' ? val.trim().length > 0 : val !== null && val !== undefined) || 'Campo obrigatório';
const naoNegativo = (val) =>
  (val !== '' && val !== null && val !== undefined &&
    !(typeof val === 'string' && val.trim().length === 0) &&
    Number.isFinite(Number(val)) && Number(val) >= 0) ||
  'Informe 0 ou mais';

function criarAcaoVazia() {
  return { _id: '', pontoId: '', data: '', leads: '', vendas: '', degustacao_tele: 0 };
}

async function mensagemErroResposta(response, fallback) {
  let body = null;
  try {
    body = await response.clone().json();
  } catch {
    // The API may return a non-JSON 404 for an unregistered route.
  }

  return body?.error || body?.erro || body?.message ||
    `${fallback} (HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''}).`;
}

const pontosOptions = computed(() =>
  [...pontos.value]
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    .map((ponto) => ({
      label: `${ponto.nome} — ${ponto.endereco} — ${ponto.telefone || 'Telefone não informado'}`,
      value: ponto._id,
    }))
)

const pontosFiltrados = computed(() => {
  const termo = filtroPonto.value.trim().toLowerCase();
  if (!termo) return pontosOptions.value;
  return pontosOptions.value.filter((opcao) => opcao.label.toLowerCase().includes(termo));
})

function filtrarPontos(val, update) {
  update(() => {
    filtroPonto.value = val;
  });
}

const acoesComNomes = computed(() => {
  const acoesComPonto = erroPontos.value
    ? acoes.value
    : acoes.value.filter((acao) =>
      pontos.value.some((ponto) => String(ponto._id) === String(acao.pontoId))
    );

  return [...acoesComPonto]
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .map((acao) => {
      const ponto = pontos.value.find((p) => String(p._id) === String(acao.pontoId)) || {}

      return {
        ...acao,
        pontoNome: ponto.nome || `ID: ${acao.pontoId}`,
        endereco: ponto.endereco || 'Endereço não encontrado',
        telefone: ponto.telefone || 'Telefone não informado',
        bairro: ponto.bairro || '',
        cidade: ponto.cidade || '',
        tipo: ponto.tipo || '',
      }
    })
})

const intervaloDatasInvalido = computed(() =>
  Boolean(dataInicial.value && dataFinal.value && dataInicial.value > dataFinal.value)
);
const filtrosHistoricoAtivos = computed(() =>
  Boolean(filtroHistorico.value.trim() || dataInicial.value || dataFinal.value)
);
const mensagemSemAcoes = computed(() =>
  filtrosHistoricoAtivos.value
    ? 'Nenhuma ação encontrada para esses filtros.'
    : 'Nenhuma ação registrada ainda.'
);
const acoesFiltradas = computed(() => {
  if (intervaloDatasInvalido.value) return [];

  const termo = normalizarTexto(filtroHistorico.value);

  return acoesComNomes.value.filter((acao) => {
    const data = String(acao.data || '').match(/^\d{4}-\d{2}-\d{2}/)?.[0] || '';
    if (dataInicial.value && (!data || data < dataInicial.value)) return false;
    if (dataFinal.value && (!data || data > dataFinal.value)) return false;
    if (!termo) return true;

    const textoBusca = [
      acao.pontoNome,
      acao.endereco,
      acao.telefone,
      acao.bairro,
      acao.cidade,
      acao.tipo,
      acao.data,
      acao.leads,
      acao.vendas,
      acao.degustacao_tele,
    ].map(normalizarTexto).join(' ');

    return textoBusca.includes(termo);
  });
});

watch([filtroHistorico, dataInicial, dataFinal], () => {
  paginacao.value.page = 1;
});

function normalizarTexto(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

function limparFiltrosHistorico() {
  filtroHistorico.value = '';
  dataInicial.value = '';
  dataFinal.value = '';
}

function formatDate(value) {
  if (!value) return '-';

  const dataIso = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dataIso) {
    return `${dataIso[3]}/${dataIso[2]}/${dataIso[1]}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
}

function formatarDataInput(date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

const columns = [
  {
    name: 'pontoNome',
    label: 'Ponto',
    field: 'pontoNome',
    align: 'left',
  },
  {
    name: 'data',
    label: 'Data',
    field: 'data',
    align: 'left',
    format: (valor) => formatDate(valor),
  },
  {
    name: 'leads',
    label: 'Leads',
    field: 'leads',
    align: 'center',
  },
  {
    name: 'degustacao_tele',
    label: 'Consultas',
    field: 'degustacao_tele',
    align: 'center',
  },
  {
    name: 'vendas',
    label: 'Vidas',
    field: 'vendas',
    align: 'center',
  },
  {
    name: 'acoes',
    label: '',
    field: '_id',
    align: 'right',
  },
];

function resetForm() {
  form.value = { pontoId: '', data: hoje, leads: 0, vendas: 0, degustacao_tele: 0 };
  addNewPonto.value = false;
  novoPonto.value = { nome: '', telefone: '', endereco: '', bairro: '', cidade: '', tipo: '' };
  nextTick(() => formRef.value?.resetValidation());
}

function toggleAddPonto() {
  addNewPonto.value = !addNewPonto.value;
  if (addNewPonto.value) {
    form.value.pontoId = '';
  }
}

async function salvarNovoPonto() {
  salvandoPonto.value = true;

  try {
    const response = await apiFetch('/pontos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...novoPonto.value,
        cidade: normalizarCidade(novoPonto.value.cidade),
        tipo: normalizarTipoPonto(novoPonto.value.tipo),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar o ponto');
    }

    const pontoCriado = await response.json();
    pontos.value.push(pontoCriado);
    form.value.pontoId = pontoCriado._id;
    addNewPonto.value = false;
    novoPonto.value = { nome: '', telefone: '', endereco: '', bairro: '', cidade: '', tipo: '' };
    avisar('sucesso', 'Ponto criado com sucesso.');
  } catch (error) {
    console.error(error);
    avisar('erro', error.message || 'Erro ao criar o ponto.');
  } finally {
    salvandoPonto.value = false;
  }
}

function vendasClass(vendas) {
  if (vendas === 0) {
    return 'pa-vendas--zero';
  }
  if (vendas >= 1 && vendas <= 4) {
    return 'pa-vendas--baixa';
  }
  return 'pa-vendas--boa';
}

async function carregarPontos() {
  erroPontos.value = false;

  try {
    const response = await apiFetch('/pontos');
    if (!response.ok) {
      throw new Error(await mensagemErroResposta(response, 'Falha ao carregar pontos'));
    }
    pontos.value = await response.json();
  } catch (error) {
    erroPontos.value = true;
    console.error('Erro ao carregar pontos:', error);
    avisar('erro', error.message || 'Não foi possível carregar a lista de pontos.');
  } finally {
    carregandoPontos.value = false;
  }
}

async function carregarAcoes() {
  try {
    const response = await apiFetch('/acoes');
    if (!response.ok) {
      throw new Error(await mensagemErroResposta(response, 'Falha ao carregar histórico'));
    }
    acoes.value = await response.json();
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    avisar('erro', error.message || 'Não foi possível carregar o histórico de ações.');
  } finally {
    carregandoAcoes.value = false;
  }
}
function confirmarExclusao(id) {
  acaoSelecionada.value = id;
  dialogExclusao.value = true;
}

function executarExclusao() {
  if (acaoSelecionada.value) {
    excluirAcao(acaoSelecionada.value);
    acaoSelecionada.value = null;
  }
}
async function excluirAcao(id){
    try {
        const response = await apiFetch(`/acoes/${id}`, {
        method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(await mensagemErroResposta(response, 'Não foi possível excluir a ação'));
        }
        acoes.value = acoes.value.filter((a) => a._id !== id);
        avisar('sucesso', 'Ação excluída com sucesso.');
    } catch (error) {
        console.error('Erro ao excluir ação:', error);
        avisar('erro', error.message || 'Não foi possível excluir a ação.');
    }
}

async function enviarAcao() {
  enviando.value = true;

  try {
    const payload = {
      pontoId: form.value.pontoId,
      data: form.value.data,
      leads: Number(form.value.leads),
      vendas: Number(form.value.vendas),
      degustacao_tele: Number(form.value.degustacao_tele),
    };

    const response = await apiFetch('/acoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar ação');
    }

    const novaAcao = await response.json();
    acoes.value.push(novaAcao);
    avisar('sucesso', 'Ação registrada com sucesso.');
    resetForm();
  } catch (error) {
    console.error(error);
    avisar('erro', error.message || 'Erro ao enviar ação.');
  } finally {
    enviando.value = false;
  }
}

onMounted(() => {
  carregarPontos();
  carregarAcoes();
});
</script>

<style scoped>
.pa-page,
.pa-dialog {
  --pa-navy: #0B3C5D;
  --pa-orange: #FF7A1A;
  --pa-borda: #E3E8EE;
  --pa-suave: #5F6B7A;
  --pa-bom: #2E7D32;
  --pa-alerta: #B26A00;
  --pa-ruim: #C62828;
}

.pa-page {
  background: #F4F6F9;
}

.pa-container {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 24px 48px;
}

.pa-container--larga {
  max-width: 1000px;
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
  padding: 24px;
  background: #fff;
  border: 1px solid var(--pa-borda);
  border-radius: 12px;
}

.pa-card--tabela {
  padding: 0;
  overflow: hidden;
}

.pa-filtros-historico {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.pa-busca-historico {
  flex: 1 1 320px;
}

.pa-data-historico {
  flex: 0 1 180px;
}

.pa-erro-filtro {
  margin: -8px 0 16px;
  color: var(--pa-ruim);
  font-size: 0.875rem;
}

.pa-tabela-topo {
  padding: 16px 24px;
  border-bottom: 1px solid var(--pa-borda);
}

.pa-dialog {
  width: 100%;
  max-width: 560px;
  border-radius: 12px;
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

.pa-vendas {
  font-size: 1.125rem;
  font-weight: 700;
}

.pa-vendas--zero {
  color: var(--pa-ruim);
  font-weight: 700;
}

.pa-vendas--baixa {
  color: var(--pa-alerta);
  font-weight: 700;
}

.pa-vendas--boa {
  color: var(--pa-bom);
  font-weight: 700;
}

.pa-card--tabela :deep(.pa-thead th) {
  font-weight: 700;
  font-size: 0.8125rem;
  color: var(--pa-navy);
  background: #F8FAFC;
}

@media (max-width: 700px) {
  .pa-filtros-historico {
    flex-direction: column;
  }

  .pa-busca-historico,
  .pa-data-historico {
    width: 100%;
    flex-basis: auto;
  }
}
</style>