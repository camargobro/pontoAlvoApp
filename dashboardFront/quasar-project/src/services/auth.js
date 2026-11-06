const TOKEN_KEY = 'pontoalvo.token'
const USER_KEY = 'pontoalvo.usuario'

export function getToken () {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_KEY)
}

export function getUser () {
  if (typeof window === 'undefined') return null

  try {
    return JSON.parse(window.localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function temPapel (...papeis) {
  return papeis.includes(getUser()?.papel)
}

export function saveSession ({ token, usuario }) {
  if (usuario?.papel) usuario.papel = String(usuario.papel)
  window.localStorage.setItem(TOKEN_KEY, token)
  window.localStorage.setItem(USER_KEY, JSON.stringify(usuario))
}

export function clearSession () {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}