<template>
  <q-page class="pa-page">
    <div class="pa-container">
      <header class="pa-header row items-center justify-between q-col-gutter-md">
        <div class="col">
          <h1 class="pa-title">Usuários</h1>
          <p class="pa-subtitle">Gerencie os acessos da sua empresa</p>
        </div>
        <div class="col-auto">
          <q-btn unelevated no-caps color="primary" icon="person_add" label="Adicionar usuário" @click="abrirCriacao" />
        </div>
      </header>

      <q-banner v-if="erroCarregamento" rounded class="bg-red-1 text-negative q-mb-lg">
        {{ erroCarregamento }}
        <template v-slot:action>
          <q-btn flat no-caps color="negative" label="Tentar novamente" @click="carregarUsuarios" />
        </template>
      </q-banner>

      <div class="pa-card pa-card--tabela">
        <q-table
          v-model:pagination="paginacao"
          :rows="usuarios"
          :columns="columns"
          :loading="carregando"
          :rows-per-page-options="[10, 25, 50, 0]"
          rows-per-page-label="Linhas por página"
          no-data-label="Nenhum usuário cadastrado."
          :pagination-label="(inicio, fim, total) => `${inicio}-${fim} de ${total}`"
          table-header-class="pa-thead"
          row-key="id"
          flat
        >
          <template v-slot:body-cell-papel="props">
            <q-td :props="props">
              <span class="pa-papel">{{ rotuloPapel(props.row.papel) }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-acoes="props">
            <q-td :props="props" class="text-right">
              <EditButton :label="`Editar ${props.row.nome}`" @click="abrirEdicao(props.row)" />
              <DeleteButton
                v-if="props.row.id !== usuarioAtual?.id"
                :label="`Excluir ${props.row.nome}`"
                @click="confirmarExclusao(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <q-dialog v-model="dialogUsuario" persistent>
      <q-card class="pa-dialog">
        <q-form ref="formRef" @submit.prevent="salvarUsuario">
          <q-card-section>
            <div class="pa-secao-titulo">{{ editando ? 'Editar perfil do usuário' : 'Adicionar usuário' }}</div>
            <div class="pa-label">
              {{ editando ? 'Deixe a senha em branco para mantê-la como está.' : 'Defina uma senha inicial para este usuário.' }}
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input v-model.trim="form.nome" :rules="[obrigatorio]" label="Nome" lazy-rules outlined />
            <q-input
              v-model.trim="form.email"
              :rules="[obrigatorio, emailValido]"
              label="E-mail"
              type="email"
              autocomplete="email"
              lazy-rules
              outlined
            />
            <q-input
              v-model="form.senha"
              :rules="editando ? [senhaOpcionalValida] : [obrigatorio, senhaValida]"
              :label="editando ? 'Nova senha (opcional)' : 'Senha provisória'"
              type="password"
              autocomplete="new-password"
              lazy-rules
              outlined
            />
            <q-select
              v-model="form.papel"
              :options="papeis"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :rules="[obrigatorio]"
              label="Cargo"
              lazy-rules
              outlined
            />
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat no-caps color="grey-8" label="Cancelar" :disable="salvando" @click="dialogUsuario = false" />
            <q-btn unelevated no-caps color="primary" :label="editando ? 'Salvar alterações' : 'Criar usuário'" type="submit" :loading="salvando" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <ConfirmDialog
      v-model="dialogExclusao"
      icon="delete_outline"
      title="Excluir usuário?"
      :message="`O acesso de ${usuarioSelecionado?.nome || 'este usuário'} será removido.`"
      confirm-label="Excluir usuário"
      intent="danger"
      @confirm="excluirUsuario"
    />
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import ConfirmDialog from 'src/components/ConfirmDialog.vue'
import DeleteButton from 'src/components/DeleteButton.vue'
import EditButton from 'src/components/EditButton.vue'
import { apiFetch } from 'src/services/api'
import { notificar } from 'src/services/notificacoes'
import { getUser } from 'src/services/auth'

const $q = useQuasar()
const usuarios = ref([])
const carregando = ref(true)
const salvando = ref(false)
const erroCarregamento = ref('')
const dialogUsuario = ref(false)
const dialogExclusao = ref(false)
const usuarioSelecionado = ref(null)
const usuarioAtual = getUser()
const editando = ref(false)
const formRef = ref(null)
const form = ref(formularioVazio())
const paginacao = ref({ rowsPerPage: 10 })
const papeis = [
  { label: 'Gestor', value: 'gestor' },
  { label: 'Colaborador', value: 'colaborador' }
]
const obrigatorio = (valor) =>
  (typeof valor === 'string' && valor.trim().length > 0) || 'Campo obrigatório'
const emailValido = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor) || 'Informe um e-mail válido'
const senhaValida = (valor) => valor.length >= 8 || 'Use ao menos 8 caracteres'
const senhaOpcionalValida = (valor) => !valor || senhaValida(valor)

const columns = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left', sortable: true },
  { name: 'email', label: 'E-mail', field: 'email', align: 'left' },
  { name: 'papel', label: 'Cargo', field: 'papel', align: 'left' },
  { name: 'acoes', label: '', field: 'id', align: 'right' }
]

function formularioVazio() {
  return { id: '', nome: '', email: '', senha: '', papel: 'colaborador' }
}

function rotuloPapel(papel) {
  return papel === 'gestor' ? 'Gestor' : 'Colaborador'
}

async function erroResposta(response, fallback) {
  try {
    const body = await response.json()
    return body.error || fallback
  } catch {
    return `${fallback} (HTTP ${response.status}).`
  }
}

async function carregarUsuarios() {
  carregando.value = true
  erroCarregamento.value = ''

  try {
    const response = await apiFetch('/usuario')
    if (!response.ok) throw new Error(await erroResposta(response, 'Não foi possível carregar os usuários'))
    usuarios.value = await response.json()
  } catch (error) {
    erroCarregamento.value = error.message || 'Não foi possível carregar os usuários'
    console.error('Erro ao carregar usuários:', error)
  } finally {
    carregando.value = false
  }
}

function abrirCriacao() {
  editando.value = false
  form.value = formularioVazio()
  dialogUsuario.value = true
}

function abrirEdicao(usuario) {
  editando.value = true
  form.value = { ...formularioVazio(), ...usuario }
  dialogUsuario.value = true
}

async function salvarUsuario() {
  salvando.value = true

  try {
    const payload = {
      nome: form.value.nome,
      email: form.value.email,
      papel: form.value.papel
    }
    if (!editando.value || form.value.senha) payload.senha = form.value.senha
    const response = await apiFetch(editando.value ? `/usuario/${form.value.id}` : '/usuario', {
      method: editando.value ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!response.ok) throw new Error(await erroResposta(response, 'Não foi possível salvar o usuário'))

    const salvo = await response.json()
    if (editando.value) {
      usuarios.value = usuarios.value.map((usuario) => usuario.id === salvo.id ? salvo : usuario)
    } else {
      usuarios.value = [...usuarios.value, salvo]
    }
    dialogUsuario.value = false
    notificar($q, 'sucesso', editando.value ? 'Usuário atualizado.' : 'Usuário criado.')
  } catch (error) {
    console.error('Erro ao salvar usuário:', error)
    notificar($q, 'erro', error.message || 'Não foi possível salvar o usuário')
  } finally {
    salvando.value = false
  }
}

function confirmarExclusao(usuario) {
  usuarioSelecionado.value = usuario
  dialogExclusao.value = true
}

async function excluirUsuario() {
  const usuario = usuarioSelecionado.value
  if (!usuario) return

  try {
    const response = await apiFetch(`/usuario/${usuario.id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error(await erroResposta(response, 'Não foi possível excluir o usuário'))
    usuarios.value = usuarios.value.filter((item) => item.id !== usuario.id)
    notificar($q, 'sucesso', 'Usuário excluído.')
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    notificar($q, 'erro', error.message || 'Não foi possível excluir o usuário')
  } finally {
    usuarioSelecionado.value = null
  }
}

onMounted(carregarUsuarios)
</script>

<style scoped>
.pa-page {
  --pa-navy: #0B3C5D;
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
  color: var(--pa-navy);
}

.pa-title::after {
  content: '';
  display: block;
  width: 48px;
  height: 4px;
  margin-top: 12px;
  border-radius: 2px;
  background: #FF7A1A;
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

.pa-secao-titulo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--pa-navy);
}

.pa-label {
  font-size: 0.8125rem;
  color: var(--pa-suave);
}

.pa-papel {
  display: inline-block;
  padding: 2px 10px;
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
