const routes = [
  { path: '/', component: () => import('pages/landingPage.vue') },
  { path: '/login', component: () => import('pages/AuthPage.vue'), meta: { guestOnly: true } },
  { path: '/cadastro', component: () => import('pages/AuthPage.vue'), meta: { guestOnly: true } },
  {
    path: '/app',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('pages/IndexPage.vue'), meta: { roles: ['gestor', 'colaborador'] } },
      { path: 'ranking', component: () => import('pages/RankingPage.vue'), meta: { roles: ['gestor', 'colaborador'] } },
      { path: 'criar-acao', component: () => import('pages/criarAcaoPage.vue'), meta: { roles: ['gestor', 'colaborador'] } },
      { path: 'historico-acoes', component: () => import('pages/criarAcaoPage.vue'), meta: { roles: ['gestor', 'colaborador'] } },
      { path: 'pontos', component: () => import('pages/pontosPage.vue'), meta: { roles: ['gestor', 'colaborador'] } },
      { path: 'mapas', component: () => import('pages/MapasPage.vue'), meta: { roles: ['gestor', 'colaborador'] } },
      { path: 'usuarios', component: () => import('pages/UsuariosPage.vue'), meta: { roles: ['gestor'] } }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes