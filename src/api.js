// akong-app-agent 后端 · multi-user (X-User-ID 自动带 · anon-uuid in localStorage)

const API_BASE = import.meta.env.VITE_API_BASE || ''

export const BACKEND_READY = !!API_BASE

function getOrCreateUserId() {
  let id = localStorage.getItem('akong-app.user_id')
  if (!id) {
    id = 'anon-' + crypto.randomUUID().replace(/-/g, '')
    localStorage.setItem('akong-app.user_id', id)
  }
  return id
}

export const userId = () => getOrCreateUserId()

async function api(path, { method = 'GET', body = null } = {}) {
  if (!BACKEND_READY) throw new Error('backend not configured (VITE_API_BASE)')
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-User-ID': getOrCreateUserId(),
    },
    body: body ? JSON.stringify(body) : null,
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export const listAgents = () => api('/api/agents')
export const listConversations = () => api('/api/conversations')
export const getConversation = (scope, target) => api(`/api/conversation?scope=${scope}&target=${target}`)
export const listMessages = (conversation_id) => api(`/api/messages?conversation_id=${conversation_id}`)
export const sendMessage = (conversation_id, content) => api('/api/messages', { method: 'POST', body: { conversation_id, content } })
