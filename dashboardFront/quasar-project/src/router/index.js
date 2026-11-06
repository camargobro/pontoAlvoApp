import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { clearSession, getToken, getUser } from 'src/services/auth'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach((to) => {
    let autenticado = Boolean(getToken())
    const usuario = getUser()

    if (autenticado && !['admin', 'gestor', 'colaborador'].includes(usuario?.papel)) {
      clearSession()
      autenticado = false
    }

    if (to.meta.requiresAuth && !autenticado) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    if (to.meta.guestOnly && autenticado) return '/app'

    if (to.meta.roles && !to.meta.roles.includes(usuario?.papel)) {
      return usuario?.papel === 'admin' ? '/' : '/app'
    }
  })

  if (typeof window !== 'undefined') {
    window.addEventListener('auth-expired', () => Router.replace('/login'))
  }

  return Router
})
