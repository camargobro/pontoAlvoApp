<template>
  <q-layout view="lHh Lpr lFf" class="pa-layout">

    <q-header
      v-if="$q.screen.lt.md"
      bordered
      :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-primary'"
    >
      <q-toolbar>
        <q-btn flat round dense icon="menu" aria-label="Abrir menu" @click="drawer = !drawer" />
        <div class="pa-marca q-ml-sm">Ponto<span>Alvo</span></div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      side="left"
      show-if-above
      bordered
      :width="256"
      :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white'"
    >
      <div class="pa-drawer">

        <div class="pa-logo">
          <svg viewBox="0 0 640 160" role="img" aria-label="PontoAlvo" xmlns="http://www.w3.org/2000/svg">
            <path d="M70 150C70 150 20 100 20 70A50 50 0 1 1 120 70C120 100 70 150 70 150Z" fill="#0B3C5D" />
            <circle cx="70" cy="70" r="28" fill="#FFFFFF" />
            <circle cx="70" cy="70" r="18" fill="#FF7A1A" />
            <circle cx="70" cy="70" r="8" fill="#FFFFFF" />
            <text x="145" y="98" font-family="Poppins, 'Segoe UI', Roboto, Arial, sans-serif" font-size="68"
              font-weight="700" letter-spacing="-1">
              <tspan fill="#0B3C5D">Ponto</tspan>
              <tspan fill="#FF7A1A">Alvo</tspan>
            </text>
          </svg>
        </div>

        <q-list class="pa-menu" :style="{
          '--pa-indicator-offset': `${Math.max(activeMenuIndex, 0) * 48}px`,
          '--pa-indicator-opacity': activeMenuIndex < 0 ? 0 : 1
        }">
          <q-item v-for="item in menu" :key="item.path" clickable :active="isActive(item.path)"
            active-class="pa-nav-ativo" class="pa-nav" @click="go(item.path)">
            <q-item-section avatar>
              <q-icon :name="item.icon" size="20px" />
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
        </q-list>

        <div class="pa-conta">
          <div class="pa-conta-nome">{{ usuario?.nome || 'Conta conectada' }}</div>
          <div class="pa-conta-cnpj">{{ usuario?.empresa?.nome || 'Administrador' }}</div>
          <div v-if="usuario?.empresa?.cnpj" class="pa-conta-cnpj">CNPJ: {{ usuario.empresa.cnpj }}</div>
          <q-btn flat round :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'" @click="alternarTema" />
          <q-item clickable class="pa-nav pa-sair" @click="sair">
            <q-item-section>
              <div class="pa-sair-conteudo">
                <q-icon name="logout" size="18px" />
                <span>Sair</span>
              </div>
            </q-item-section>
          </q-item>
        </div>

      </div>
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component, route }">
        <Transition name="pa-route" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </router-view>
    </q-page-container>

    <ConfirmDialog v-model="dialogSair" icon="logout" title="Sair da conta" message="Você realmente deseja sair?"
      confirm-label="Sair" intent="danger" @confirm="confirmarSaida" />

  </q-layout>
</template>

<script setup>
import { computed, ref } from 'vue'
import ConfirmDialog from 'src/components/ConfirmDialog.vue'
import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import { clearSession, getUser, temPapel } from 'src/services/auth'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

$q.dark.set(localStorage.getItem('tema-escuro') === 'true')

const drawer = ref(false)
const dialogSair = ref(false)
const usuario = getUser()

const menu = computed(() => {
  const itens = temPapel('gestor', 'colaborador')
    ? [
      { label: 'Home', path: '/app', icon: 'home' },
      { label: 'Registrar ação', path: '/app/criar-acao', icon: 'add_location_alt' },
      { label: 'Histórico de ações', path: '/app/historico-acoes', icon: 'history' }, 
      { label: 'Ranking', path: '/app/ranking', icon: 'leaderboard' },
      { label: 'Pontos', path: '/app/pontos', icon: 'place' },
      { label: 'Calendários', path: '/app/calendarios', icon: 'calendar_month' },
      { label: 'Mapas', path: '/app/mapas', icon: 'map' }
    ]
    : []

  if (temPapel('gestor')) itens.push({ label: 'Usuários', path: '/app/usuarios', icon: 'people' })
  return itens
})
const activeMenuIndex = computed(() => menu.value.findIndex((item) => route.path === item.path))
function alternarTema() {
  $q.dark.toggle()
  localStorage.setItem('tema-escuro', $q.dark.isActive)
}
function go(path) {
  if (route.path !== path) {
    router.push(path)
  }
  if ($q.screen.lt.md) {
    drawer.value = false
  }
}

function isActive(path) {
  return route.path === path
}

function sair() {
  dialogSair.value = true
}

function confirmarSaida() {
  clearSession()
  $q.dark.set(false)
  router.replace('/login')
}
</script>

<style scoped>
.pa-layout {
  --pa-navy: #0B3C5D;
  --pa-orange: #FF7A1A;
  --pa-suave: #5F6B7A;
}

.pa-marca {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--pa-navy);
}

.pa-marca span {
  color: var(--pa-orange);
}

.pa-drawer {
  display: flex;
  height: 100%;
  flex-direction: column;
  padding: 28px 16px;
  box-sizing: border-box;
}

.pa-logo {
  padding: 0 8px 28px;
  margin-bottom: 20px;
  border-bottom: 1px solid #E3E8EE;
}

.pa-logo svg {
  display: block;
  width: 100%;
  height: auto;
}

.pa-menu {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pa-menu::before {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  width: 4px;
  height: 44px;
  border-radius: 0 4px 4px 0;
  background: var(--pa-orange);
  content: '';
  opacity: var(--pa-indicator-opacity);
  pointer-events: none;
  transform: translateY(var(--pa-indicator-offset));
  transition: transform 280ms cubic-bezier(0.2, 0.7, 0.2, 1), opacity 180ms ease;
}

.pa-conta {
  margin-top: auto;
  padding: 18px 12px 0;
  border-top: 1px solid #E3E8EE;
}

.pa-conta-nome {
  overflow: hidden;
  color: var(--pa-navy);
  font-size: 0.875rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pa-conta-cnpj {
  margin-top: 4px;
  color: var(--pa-suave);
  font-size: 0.75rem;
}

.pa-sair {
  margin-top: 8px;
  color: var(--pa-suave);
}

.pa-sair-conteudo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pa-nav {
  position: relative;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 8px;
  font-weight: 500;
  color: var(--pa-suave);
  transition: background 180ms ease, color 180ms ease;
}

.pa-nav:hover {
  background: #F4F6F9;
  color: var(--pa-navy);
}

.pa-nav-ativo {
  background: rgba(11, 60, 93, 0.08);
  font-weight: 700;
  color: var(--pa-navy);
}

@media (prefers-reduced-motion: reduce) {

  .pa-menu::before,
  .pa-nav {
    transition: none;
  }
}
</style>