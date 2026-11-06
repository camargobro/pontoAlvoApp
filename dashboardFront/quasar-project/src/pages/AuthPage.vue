<template>
  <main class="auth-page">
    <section class="auth-brand" aria-label="PontoAlvo">
      <div class="brand-inner">
        <div class="brand-mark" aria-hidden="true"><span></span></div>
        <div class="brand-name">Ponto<span>Alvo</span></div>
        <div class="brand-rule"></div>
        <p class="brand-copy">Sua operação de vendas externas, em um só lugar.</p>
        <div class="brand-foot">PONTOALVO <span>•</span> GESTÃO DE CAMPO</div>
      </div>
      <div class="brand-grid" aria-hidden="true"></div>
    </section>

    <section class="auth-main">
      <div class="auth-form-wrap">
        <div class="mobile-brand">Ponto<span>Alvo</span></div>
        <div class="auth-eyebrow">ÁREA DA EQUIPE</div>
        <Transition name="auth-copy" mode="out-in">
          <div :key="isRegister ? 'register-copy' : 'login-copy'">
            <h1>{{ isRegister ? 'Crie a conta de sua empresa' : 'Bem-vindo de volta' }}</h1>
            <p class="auth-intro">
              {{ isRegister ? 'Comece a acompanhar sua operação.' : 'Acesse sua operação de vendas.' }}
            </p>
          </div>
        </Transition>

        <q-btn-toggle
          v-model="modoSelecionado"
          class="auth-toggle"
          spread
          no-caps
          unelevated
          toggle-color="primary"
          :options="[
            { label: 'Entrar', value: 'login' },
            { label: 'Criar conta', value: 'cadastro' }
          ]"
          @update:model-value="alterarModo"
        />

        <Transition name="auth-form-transition" mode="out-in">
          <q-form
            :key="isRegister ? 'register-form' : 'login-form'"
            ref="formRef"
            class="auth-form"
            :class="{ 'auth-form--erro': erro }"
            @submit.prevent="enviarFormulario"
          >
          <q-input
            v-if="isRegister"
            v-model.trim="form.nomeEmpresa"
            label="Nome da empresa"
            autocomplete="name"
            outlined
            :rules="[obrigatorio]"
          />
          <q-input
            v-if="isRegister"
            v-model.trim="form.cnpj"
            label="CNPJ da empresa"
            maxlength="18"
            autocomplete="off"
            outlined
            :rules="[obrigatorio, validarCnpj]"
          />
          <q-input
            v-if="isRegister"
            v-model.trim="form.nome"
            label="Nome do gestor"
            autocomplete="name"
            outlined
            :rules="[obrigatorio]"
          />
          <q-input
            v-model.trim="form.email"
            label="E-mail"
            type="email"
            autocomplete="email"
            outlined
            :rules="[obrigatorio, validarEmail]"
          />
          <q-input
            v-model="form.senha"
            label="Senha"
            :type="mostrarSenha ? 'text' : 'password'"
            :autocomplete="isRegister ? 'new-password' : 'current-password'"
            outlined
            :rules="[obrigatorio, validarSenha]"
          >
            <template #append>
              <q-btn
                flat
                round
                dense
                :icon="mostrarSenha ? 'visibility_off' : 'visibility'"
                :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'"
                @click="mostrarSenha = !mostrarSenha"
              />
            </template>
          </q-input>
          <q-input
            v-if="isRegister"
            v-model="form.confirmacao"
            label="Confirme sua senha"
            :type="mostrarSenha ? 'text' : 'password'"
            autocomplete="new-password"
            outlined
            :rules="[obrigatorio, confirmarSenha]"
          />

          <Transition name="auth-error">
            <q-banner v-if="erro" class="auth-error" rounded>{{ erro }}</q-banner>
          </Transition>

          <q-btn
            class="auth-submit"
            color="primary"
            unelevated
            no-caps
            type="submit"
            :loading="enviando"
            :label="isRegister ? 'Criar minha conta' : 'Entrar na conta'"
          />
          </q-form>
        </Transition>

        <p class="auth-switch">
          {{ isRegister ? 'Já tem uma conta?' : 'Ainda não tem uma conta?' }}
          <button type="button" @click="alterarModo(isRegister ? 'login' : 'cadastro')">
            {{ isRegister ? 'Entrar' : 'Cadastre-se' }}
          </button>
        </p>
      </div>
      <footer class="auth-footer">Acesso seguro à plataforma PontoAlvo</footer>
    </section>
  </main>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { apiUrl } from 'src/services/api'
import { saveSession } from 'src/services/auth'
import { notificar } from 'src/services/notificacoes'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const isRegister = computed(() => route.path === '/cadastro')
const modoSelecionado = ref(isRegister.value ? 'cadastro' : 'login')
const mostrarSenha = ref(false)
const enviando = ref(false)
const erro = ref('')
const formRef = ref(null)
const form = reactive({ nomeEmpresa: '', cnpj: '', nome: '', email: '', senha: '', confirmacao: '' })

watch(isRegister, async (value) => {
  modoSelecionado.value = value ? 'cadastro' : 'login'
  erro.value = ''
  await nextTick()
  formRef.value?.resetValidation()
})

const obrigatorio = (value) => !!value || 'Este campo é obrigatório.'
const validarEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Informe um e-mail válido.'
const validarCnpj = (value) => String(value || '').replace(/[^a-z0-9]/gi, '').length === 14 || 'Informe um CNPJ com 14 caracteres.'
const validarSenha = (value) => !isRegister.value || value.length >= 8 || 'Use ao menos 8 caracteres.'
const confirmarSenha = (value) => value === form.senha || 'As senhas não coincidem.'

function alterarModo (modo) {
  erro.value = ''
  router.push(modo === 'cadastro' ? '/cadastro' : '/login')
}

async function enviarFormulario () {
  erro.value = ''
  enviando.value = true

  try {
    const cadastro = isRegister.value
    const endpoint = cadastro ? '/usuario/registrar' : '/usuario/login'
    const body = cadastro
      ? {
          nomeEmpresa: form.nomeEmpresa,
          cnpj: form.cnpj,
          nome: form.nome,
          email: form.email,
          senha: form.senha
        }
      : { email: form.email, senha: form.senha }
    const response = await fetch(apiUrl(endpoint), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await response.json()

    if (!response.ok) throw new Error(data.error || 'Não foi possível concluir o acesso.')

    if (cadastro) {
      form.senha = ''
      form.confirmacao = ''
      notificar($q, 'sucesso', 'Conta criada. Faça login para acessar.')
      alterarModo('login')
      return
    }

    if (
      typeof data?.token !== 'string' ||
      !data.token ||
      !data.usuario ||
      !['admin', 'gestor', 'colaborador'].includes(data.usuario.papel)
    ) {
      throw new Error('A API está desatualizada para este login. Atualize o backend e tente novamente.')
    }

    saveSession(data)
    notificar($q, 'sucesso', 'Login realizado com sucesso.')
    const destinoSolicitado = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const destino = destinoSolicitado.startsWith('/app') ? destinoSolicitado : '/app'
    await router.replace(destino)
  } catch (error) {
    erro.value = error.message || 'Não foi possível conectar ao servidor.'
  } finally {
    enviando.value = false
  }
}
</script>

<style scoped>
.auth-page {
  --navy: #0b3c5d;
  --orange: #ff7a1a;
  display: grid;
  grid-template-columns: minmax(300px, 0.82fr) minmax(440px, 1.18fr);
  min-height: 100vh;
  background: #fff;
  color: #182936;
}

.auth-brand {
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 64px clamp(36px, 7vw, 104px);
  background: var(--navy);
  color: #fff;
}

.brand-inner { position: relative; z-index: 1; max-width: 410px; }
.brand-mark { position: relative; width: 54px; height: 54px; margin-bottom: 28px; border: 2px solid #fff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); }
.brand-mark::before, .brand-mark::after, .brand-mark span { position: absolute; content: ''; border-radius: 50%; }
.brand-mark::before { inset: 9px; border: 2px solid var(--orange); }
.brand-mark::after { inset: 19px; background: #fff; }
.brand-name, .mobile-brand { font-size: 2rem; font-weight: 750; color: inherit; }
.brand-name span, .mobile-brand span { color: var(--orange); }
.brand-rule { width: 44px; height: 3px; margin: 26px 0 18px; background: var(--orange); }
.brand-copy { max-width: 290px; margin: 0; color: #d6e2e8; font-size: 1.125rem; line-height: 1.65; }
.brand-foot { margin-top: 88px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em; color: #a9c1ce; }
.brand-foot span { margin: 0 8px; color: var(--orange); }
.brand-grid { position: absolute; right: -110px; bottom: -155px; width: 390px; height: 390px; border: 1px solid rgba(255,255,255,.12); border-radius: 50%; }
.brand-grid::before, .brand-grid::after { position: absolute; content: ''; border: 1px solid rgba(255,255,255,.1); border-radius: 50%; }
.brand-grid::before { inset: 42px; }
.brand-grid::after { inset: 88px; }

.auth-main { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 56px 36px 24px; }
.auth-form-wrap { width: min(100%, 420px); }
.mobile-brand { display: none; color: var(--navy); }
.auth-eyebrow { margin-bottom: 12px; color: var(--orange); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.14em; }
h1 { margin: 0; color: var(--navy); font-size: 2rem; line-height: 1.2; font-weight: 750; }
.auth-intro { margin: 10px 0 26px; color: #647481; }
.auth-toggle { width: 100%; margin-bottom: 24px; padding: 4px; border: 1px solid #e2e8eb; border-radius: 8px; background: #f4f7f8; }
.auth-toggle :deep(.q-btn) { min-height: 42px; border-radius: 6px; }
.auth-toggle :deep(.q-btn--active) { box-shadow: 0 2px 6px rgba(11, 60, 93, .16); }
.auth-form { display: flex; flex-direction: column; gap: 4px; }
.auth-copy-enter-active, .auth-copy-leave-active,
.auth-form-transition-enter-active, .auth-form-transition-leave-active,
.auth-error-enter-active, .auth-error-leave-active { transition: opacity 180ms ease, transform 180ms ease; }
.auth-copy-enter-from, .auth-form-transition-enter-from, .auth-error-enter-from { opacity: 0; transform: translateY(8px); }
.auth-copy-leave-to, .auth-form-transition-leave-to, .auth-error-leave-to { opacity: 0; transform: translateY(-5px); }
.auth-form--erro { animation: auth-shake 360ms ease-in-out; }
@keyframes auth-shake {
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
  0%, 100% { transform: translateX(0); }
}
.auth-form :deep(.q-field--outlined .q-field__control) { border-radius: 6px; }
.auth-error { margin: 2px 0 10px; background: #fff0ed; color: #9f3022; }
.auth-submit { width: 100%; min-height: 48px; margin-top: 8px; border-radius: 6px; font-weight: 700; }
.auth-switch { margin: 22px 0 0; text-align: center; color: #647481; font-size: 0.9rem; }
.auth-switch button { border: 0; padding: 4px; background: transparent; color: var(--navy); font: inherit; font-weight: 700; cursor: pointer; }
.auth-switch button:hover { color: var(--orange); }
.auth-footer { margin-top: auto; padding-top: 32px; color: #82909a; font-size: 0.78rem; }

@media (prefers-reduced-motion: reduce) {
  .auth-copy-enter-active, .auth-copy-leave-active,
  .auth-form-transition-enter-active, .auth-form-transition-leave-active,
  .auth-error-enter-active, .auth-error-leave-active { transition: none; }
  .auth-form--erro { animation: none; }
}

@media (max-width: 760px) {
  .auth-page { grid-template-columns: 1fr; }
  .auth-brand { display: none; }
  .auth-main { justify-content: flex-start; padding: 28px 24px 20px; }
  .auth-form-wrap { width: min(100%, 440px); margin: auto; }
  .mobile-brand { display: block; margin-bottom: 38px; font-size: 1.55rem; }
  h1 { font-size: 1.75rem; }
  .auth-footer { margin: 40px auto 0; }
}
</style>