<template>
  <q-page class="pa-page">
    <div class="pa-container">
      <header class="pa-header">
        <h1 class="pa-title">Minha senha</h1>
        <p class="pa-subtitle">Atualize a senha de acesso à sua conta</p>
      </header>

      <div class="pa-card">
        <q-form @submit.prevent="alterarSenha">
          <q-input
            v-model="senhaAtual"
            label="Senha atual"
            type="password"
            autocomplete="current-password"
            :rules="[obrigatorio]"
            lazy-rules
            outlined
          />
          <q-input
            v-model="novaSenha"
            label="Nova senha"
            type="password"
            autocomplete="new-password"
            :rules="[obrigatorio, senhaValida]"
            lazy-rules
            outlined
          />
          <q-input
            v-model="confirmacao"
            label="Confirme a nova senha"
            type="password"
            autocomplete="new-password"
            :rules="[obrigatorio, confirmarSenha]"
            lazy-rules
            outlined
          />
          <div class="row justify-end">
            <q-btn unelevated no-caps color="primary" label="Alterar senha" type="submit" :loading="salvando" />
          </div>
        </q-form>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { apiFetch } from 'src/services/api'
import { notificar } from 'src/services/notificacoes'

const $q = useQuasar()
const senhaAtual = ref('')
const novaSenha = ref('')
const confirmacao = ref('')
const salvando = ref(false)

const obrigatorio = (valor) => !!valor || 'Campo obrigatório'
const senhaValida = (valor) => valor.length >= 8 || 'Use ao menos 8 caracteres'
const confirmarSenha = (valor) => valor === novaSenha.value || 'As senhas não coincidem'

async function erroResposta(response, fallback) {
  try {
    const body = await response.json()
    return body.error || fallback
  } catch {
    return `${fallback} (HTTP ${response.status}).`
  }
}

async function alterarSenha() {
  salvando.value = true

  try {
    const response = await apiFetch('/usuario/minha-senha', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senhaAtual: senhaAtual.value, novaSenha: novaSenha.value })
    })
    if (!response.ok) throw new Error(await erroResposta(response, 'Não foi possível alterar a senha'))

    senhaAtual.value = ''
    novaSenha.value = ''
    confirmacao.value = ''
    notificar($q, 'sucesso', 'Senha alterada com sucesso.')
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    notificar($q, 'erro', error.message || 'Não foi possível alterar a senha')
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.pa-page {
  --pa-navy: #0B3C5D;
  --pa-borda: #E3E8EE;
  --pa-suave: #5F6B7A;
  background: #F4F6F9;
}

.pa-container {
  max-width: 760px;
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
  padding: 24px;
  background: #fff;
  border: 1px solid var(--pa-borda);
  border-radius: 12px;
}
</style>
