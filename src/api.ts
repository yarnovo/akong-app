// akong-app-agent 后端 · multi-user (X-User-ID 自动带 · anon-uuid in localStorage)
// v0.1 fallback: backend 没接 prod 时 · 用 hardcoded mock 数据让 UI 跑起来 · 老板能看视觉

import { AGENTS, findAgent, type AgentMeta } from "./data/agents"

const API_BASE = (import.meta.env.VITE_API_BASE as string) || ""
export const BACKEND_READY = !!API_BASE

// ─── multi-user uid ───────────────────────────────────────────────────

function getOrCreateUserId(): string {
  let id = localStorage.getItem("akong-app.user_id")
  if (!id) {
    id = "anon-" + crypto.randomUUID().replace(/-/g, "")
    localStorage.setItem("akong-app.user_id", id)
  }
  return id
}
export const userId = (): string => getOrCreateUserId()

// ─── types ────────────────────────────────────────────────────────────

export interface Conversation {
  id: number | null
  scope: string
  target: string
  name: string
  title: string
  avatar_color: string
  pinned: boolean
  last_msg_at: number | null
  last_msg_preview: string
  unread_count: number
  role: string
}

export interface Message {
  id: number
  sender_kind: "user" | "agent" | "system"
  sender_slug: string | null
  content: string
  created_at: number
}

export interface SendResponse {
  user_msg: Message
  agent_msg: Message
}

interface StoredConv {
  id: number
  scope: string
  target: string
  last_msg_at: number | null
  last_msg_preview: string
  title: string
}

// ─── per-uid localStorage ────────────────────────────────────────────

const localKey = (k: string) => `akong-app.${userId()}.${k}`
function localGet<T>(k: string, dflt: T): T {
  try {
    const raw = localStorage.getItem(localKey(k))
    if (raw === null) return dflt
    return (JSON.parse(raw) as T) ?? dflt
  } catch {
    return dflt
  }
}
function localSet<T>(k: string, v: T) {
  localStorage.setItem(localKey(k), JSON.stringify(v))
}

// ─── fetch wrapper · 后端没接就走 mock ──────────────────────────────

async function api<T = unknown>(
  path: string,
  { method = "GET", body = null }: { method?: string; body?: unknown } = {},
): Promise<T> {
  if (!BACKEND_READY) return _mock<T>(path, method, body)
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", "X-User-ID": userId() },
    body: body ? JSON.stringify(body) : null,
  })
  if (!res.ok) {
    const detail = (await res.json().catch(() => ({}))) as { detail?: string }
    throw new Error(detail.detail || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

function _mock<T>(path: string, method: string, body: unknown): T {
  if (path === "/api/agents") return AGENTS as T
  if (path === "/api/conversations") return _mockConvList() as T
  if (path.startsWith("/api/conversation?")) {
    const u = new URL("http://x" + path)
    return _mockConv(u.searchParams.get("scope")!, u.searchParams.get("target")!) as T
  }
  if (path.startsWith("/api/messages?")) {
    const cid = +new URL("http://x" + path).searchParams.get("conversation_id")!
    return _mockMessages(cid) as T
  }
  if (path === "/api/messages" && method === "POST") {
    return _mockSend(body as { conversation_id: number; content: string }) as T
  }
  throw new Error("mock: unknown " + path)
}

function _mockConvList(): Conversation[] {
  const convs = localGet<Record<string, StoredConv>>("convs", {})
  const items: Conversation[] = []
  // 置顶 akong (永远在 · 即使没聊过)
  const akong = AGENTS[0]
  const k = `agent:${akong.slug}`
  if (convs[k]) {
    items.push(_renderConv(convs[k], akong))
  } else {
    items.push({
      id: null, scope: "agent", target: akong.slug, name: akong.name, title: akong.title,
      avatar_color: akong.avatar_color, pinned: true, last_msg_at: null,
      last_msg_preview: "点开聊聊", unread_count: 0, role: akong.role,
    })
  }
  // 其他按 last_msg_at desc
  const others = Object.entries(convs)
    .filter(([key]) => key !== `agent:${akong.slug}`)
    .map(([, v]) => v)
    .sort((a, b) => (b.last_msg_at || 0) - (a.last_msg_at || 0))
  for (const c of others) {
    const meta = findAgent(c.target)
    items.push(_renderConv(c, meta))
  }
  return items
}

function _renderConv(c: StoredConv, meta: AgentMeta | undefined): Conversation {
  return {
    id: c.id,
    scope: c.scope,
    target: c.target,
    name: meta?.name || c.target,
    title: meta?.title || "",
    avatar_color: meta?.avatar_color || "hsl(0 0% 50%)",
    pinned: meta?.pinned || false,
    last_msg_at: c.last_msg_at,
    last_msg_preview: c.last_msg_preview || "",
    unread_count: 0,
    role: meta?.role || "agent",
  }
}

let _nextId = 1
function _mockConv(scope: string, target: string): Conversation {
  const convs = localGet<Record<string, StoredConv>>("convs", {})
  const k = `${scope}:${target}`
  if (!convs[k]) {
    const meta = findAgent(target)
    convs[k] = {
      id: _nextId++,
      scope,
      target,
      last_msg_at: Math.floor(Date.now() / 1000),
      last_msg_preview: "",
      title: meta?.name || target,
    }
    localSet("convs", convs)
  }
  return _renderConv(convs[k], findAgent(target))
}

function _mockMessages(cid: number): Message[] {
  return localGet<Message[]>(`msgs.${cid}`, [])
}

function _mockSend({ conversation_id, content }: { conversation_id: number; content: string }): SendResponse {
  const msgs = localGet<Message[]>(`msgs.${conversation_id}`, [])
  const now = Math.floor(Date.now() / 1000)
  const userMsg: Message = {
    id: msgs.length + 1, sender_kind: "user", sender_slug: null, content, created_at: now,
  }
  msgs.push(userMsg)
  const convs = localGet<Record<string, StoredConv>>("convs", {})
  const conv = Object.values(convs).find((c) => c.id === conversation_id)
  const meta = conv ? findAgent(conv.target) : undefined
  let agentReply: string
  if (meta?.role === "router") {
    agentReply = `我是阿空 · 你刚说"${content.slice(0, 30)}" · v0.1 mock 模式还没接路由 · 真路由 v0.2 上线 · 现在你可以从下面 list 直接进各 agent 单聊试试。`
  } else if (meta) {
    agentReply = `${meta.name} 这边 · 收到 (${content.length} 字) · v0.1 mock 模式 · 真后端 v0.2 接通 · 想真聊就去专属 chat: ${meta.slug}.${meta.user_side === "C" ? "C 端" : ""}`
  } else {
    agentReply = "(unknown agent)"
  }
  const agentMsg: Message = {
    id: msgs.length + 1, sender_kind: "agent", sender_slug: conv?.target || null, content: agentReply, created_at: now + 1,
  }
  msgs.push(agentMsg)
  localSet(`msgs.${conversation_id}`, msgs)
  if (conv) {
    conv.last_msg_at = now + 1
    conv.last_msg_preview = agentReply.slice(0, 100)
    localSet("convs", convs)
  }
  return { user_msg: userMsg, agent_msg: agentMsg }
}

// ─── public API ──────────────────────────────────────────────────────

export const listAgents = () => api<AgentMeta[]>("/api/agents")
export const listConversations = () => api<Conversation[]>("/api/conversations")
export const getConversation = (scope: string, target: string) =>
  api<Conversation>(`/api/conversation?scope=${scope}&target=${target}`)
export const listMessages = (conversation_id: number) =>
  api<Message[]>(`/api/messages?conversation_id=${conversation_id}`)
export const sendMessage = (conversation_id: number, content: string) =>
  api<SendResponse>("/api/messages", { method: "POST", body: { conversation_id, content } })
