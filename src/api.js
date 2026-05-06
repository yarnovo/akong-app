// akong-app-agent 后端 · multi-user (X-User-ID 自动带 · anon-uuid in localStorage)
// v0.1 fallback: backend 没接 prod 时 · 用 hardcoded mock 数据让 UI 跑起来 · 老板能看视觉

const API_BASE = import.meta.env.VITE_API_BASE || ''
export const BACKEND_READY = !!API_BASE

// ─── multi-user uid ───────────────────────────────────────────────────

function getOrCreateUserId() {
  let id = localStorage.getItem('akong-app.user_id')
  if (!id) {
    id = 'anon-' + crypto.randomUUID().replace(/-/g, '')
    localStorage.setItem('akong-app.user_id', id)
  }
  return id
}
export const userId = () => getOrCreateUserId()

// ─── mock fallback (v0.1 · 跟 backend agents.py 同步) ────────────────

const MOCK_AGENTS = [
  { slug: 'akong',    name: '阿空',         title: '总管 · 跟我说要找谁 · 我帮你叫',           avatar_color: 'hsl(0 0% 9%)',    role: 'router', pinned: true,  user_side: 'C' },
  { slug: 'xiaoxi',   name: '阿空红娘小喜', title: 'C 端相亲 · 跟我聊配偏好 · 我帮你筛真人',   avatar_color: 'hsl(330 80% 60%)', role: 'agent',  pinned: false, user_side: 'C' },
  { slug: 'xiaoqiao', name: '阿空红娘小桥', title: 'B 端机构对接 · 接会员名单 · 中转消息',     avatar_color: 'hsl(280 60% 55%)', role: 'agent',  pinned: false, user_side: 'B' },
  { slug: 'xiaohua',  name: '阿空小画',     title: 'C 端 AI 头像生成 · 不抄不模仿不广告',       avatar_color: 'hsl(180 60% 50%)', role: 'agent',  pinned: false, user_side: 'C' },
  { slug: 'xiaozhi',  name: '阿空小知',     title: 'C 端个人知识管理 · 一概念一节点 · 数据归你', avatar_color: 'hsl(140 50% 50%)', role: 'agent',  pinned: false, user_side: 'C' },
  { slug: 'xiaoke',   name: '阿空小客',     title: 'C 端客服 + 反馈 · 不替谁辩解 · 不假装一定改', avatar_color: 'hsl(40 80% 55%)',  role: 'agent',  pinned: false, user_side: 'C' },
  { slug: 'dayou',    name: '阿空大邮',     title: 'C 端邮箱管理 · 你挂自己邮箱 · 不替你拍 · 不自动回', avatar_color: 'hsl(220 30% 25%)', role: 'agent', pinned: false, user_side: 'C' },
  { slug: 'xiaoyan',  name: '阿空发现小研', title: 'C 端 AI 项目调研陪伴 · 听你的故事不堆 idea', avatar_color: 'hsl(200 60% 50%)', role: 'agent',  pinned: false, user_side: 'C' },
  { slug: 'dayan',    name: '阿空发现大研', title: 'B 端给客户配专属小研',                       avatar_color: 'hsl(15 70% 50%)',  role: 'agent',  pinned: false, user_side: 'B' },
]

// localStorage key per uid · 用户隔离 · v0.2 backend 接上去就拆
const localKey = (k) => `akong-app.${userId()}.${k}`
const localGet = (k, dflt) => {
  try { return JSON.parse(localStorage.getItem(localKey(k))) ?? dflt }
  catch { return dflt }
}
const localSet = (k, v) => localStorage.setItem(localKey(k), JSON.stringify(v))

// ─── fetch wrapper · 后端没接就走 mock ──────────────────────────────

async function api(path, { method = 'GET', body = null } = {}) {
  if (!BACKEND_READY) return _mock(path, method, body)
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-User-ID': userId() },
    body: body ? JSON.stringify(body) : null,
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

function _mock(path, method, body) {
  // 简单路由 · 跟 backend server.py 同款
  if (path === '/api/agents') return MOCK_AGENTS
  if (path === '/api/conversations') return _mockConvList()
  if (path.startsWith('/api/conversation?')) {
    const u = new URL('http://x' + path)
    return _mockConv(u.searchParams.get('scope'), u.searchParams.get('target'))
  }
  if (path.startsWith('/api/messages?')) {
    const cid = +new URL('http://x' + path).searchParams.get('conversation_id')
    return _mockMessages(cid)
  }
  if (path === '/api/messages' && method === 'POST') return _mockSend(body)
  throw new Error('mock: unknown ' + path)
}

function _mockConvList() {
  const convs = localGet('convs', {})  // { 'agent:slug': {...} }
  const items = []
  // 置顶 akong (永远在 · 即使没聊过)
  const akong = MOCK_AGENTS[0]
  const k = `agent:${akong.slug}`
  items.push(convs[k] ? _renderConv(convs[k], akong) : {
    id: null, scope: 'agent', target: akong.slug, name: akong.name, title: akong.title,
    avatar_color: akong.avatar_color, pinned: true, last_msg_at: null,
    last_msg_preview: '点开聊聊', unread_count: 0, role: akong.role,
  })
  // 其他按 last_msg_at desc
  const others = Object.entries(convs)
    .filter(([k]) => k !== `agent:${akong.slug}`)
    .map(([k, v]) => v)
    .sort((a, b) => (b.last_msg_at || 0) - (a.last_msg_at || 0))
  for (const c of others) {
    const meta = MOCK_AGENTS.find(a => a.slug === c.target)
    items.push(_renderConv(c, meta))
  }
  return items
}

function _renderConv(c, meta) {
  return {
    id: c.id, scope: c.scope, target: c.target,
    name: meta?.name || c.target, title: meta?.title || '',
    avatar_color: meta?.avatar_color || 'hsl(0 0% 50%)',
    pinned: meta?.pinned || false,
    last_msg_at: c.last_msg_at, last_msg_preview: c.last_msg_preview || '',
    unread_count: 0, role: meta?.role || 'agent',
  }
}

let _nextId = 1
function _mockConv(scope, target) {
  const convs = localGet('convs', {})
  const k = `${scope}:${target}`
  if (!convs[k]) {
    const meta = MOCK_AGENTS.find(a => a.slug === target)
    convs[k] = { id: _nextId++, scope, target, last_msg_at: Math.floor(Date.now() / 1000),
                 last_msg_preview: '', title: meta?.name || target }
    localSet('convs', convs)
  }
  const meta = MOCK_AGENTS.find(a => a.slug === target)
  return _renderConv(convs[k], meta)
}

function _mockMessages(cid) {
  return localGet(`msgs.${cid}`, [])
}

function _mockSend({ conversation_id, content }) {
  const msgs = localGet(`msgs.${conversation_id}`, [])
  const now = Math.floor(Date.now() / 1000)
  const userMsg = { id: msgs.length + 1, sender_kind: 'user', sender_slug: null, content, created_at: now }
  msgs.push(userMsg)
  // 找 conv 拿 target
  const convs = localGet('convs', {})
  const conv = Object.values(convs).find(c => c.id === conversation_id)
  const meta = MOCK_AGENTS.find(a => a.slug === conv?.target)
  let agentReply
  if (meta?.role === 'router') {
    agentReply = `我是阿空 · 你刚说"${content.slice(0, 30)}" · v0.1 mock 模式还没接路由 · 真路由 v0.2 上线 · 现在你可以从下面 list 直接进各 agent 单聊试试。`
  } else if (meta) {
    agentReply = `${meta.name} 这边 · 收到 (${content.length} 字) · v0.1 mock 模式 · 真后端 v0.2 接通 · 想真聊就去专属 chat: ${meta.slug}.${meta.user_side === 'C' ? 'C 端' : ''}`
  } else {
    agentReply = '(unknown agent)'
  }
  const agentMsg = { id: msgs.length + 1, sender_kind: 'agent', sender_slug: conv?.target, content: agentReply, created_at: now + 1 }
  msgs.push(agentMsg)
  localSet(`msgs.${conversation_id}`, msgs)
  // 更新 conv last_msg
  if (conv) {
    conv.last_msg_at = now + 1
    conv.last_msg_preview = agentReply.slice(0, 100)
    localSet('convs', convs)
  }
  return { user_msg: userMsg, agent_msg: agentMsg }
}

// ─── public API ──────────────────────────────────────────────────────

export const listAgents = () => api('/api/agents')
export const listConversations = () => api('/api/conversations')
export const getConversation = (scope, target) => api(`/api/conversation?scope=${scope}&target=${target}`)
export const listMessages = (conversation_id) => api(`/api/messages?conversation_id=${conversation_id}`)
export const sendMessage = (conversation_id, content) => api('/api/messages', { method: 'POST', body: { conversation_id, content } })
