import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ChatPage, type Message as UIMessage } from "@akong/ui-react"
import { getConversation, listMessages, sendMessage, type Conversation } from "../api"

function fmtTime(ts: number): string {
  return new Date(ts * 1000).toTimeString().slice(0, 5)
}

export function Chat() {
  const { scope, target } = useParams<{ scope: string; target: string }>()
  const navigate = useNavigate()

  const [conv, setConv] = React.useState<Conversation | null>(null)
  const [messages, setMessages] = React.useState<UIMessage[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [sending, setSending] = React.useState(false)

  const idRef = React.useRef(1)
  const nextLocalId = () => `local-${idRef.current++}`

  React.useEffect(() => {
    if (!scope || !target) return
    let alive = true
    setLoading(true)
    setError("")
    ;(async () => {
      try {
        const c = await getConversation(scope, target)
        if (!alive) return
        setConv(c)
        const raw = await listMessages(c.id ?? 0)
        if (!alive) return
        const ui: UIMessage[] = raw.map((m) => ({
          id: m.id,
          role: m.sender_kind === "user" ? "user" : m.sender_kind === "system" ? "system" : "agent",
          content: m.content,
          timestamp: fmtTime(m.created_at),
        }))
        if (!ui.length && c.role === "router") {
          ui.push({
            id: nextLocalId(),
            role: "agent",
            content:
              '我是阿空 · 你说要找谁? 比如"找小喜帮我配相亲"/"找大邮看下今早邮件" · 我帮你叫人。',
          })
        } else if (!ui.length) {
          ui.push({ id: nextLocalId(), role: "agent", content: `${c.name} · ${c.title}` })
        }
        setMessages(ui)
      } catch (e: unknown) {
        if (alive) setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [scope, target])

  async function handleSend(text: string) {
    if (!conv?.id) return
    setSending(true)
    const userMsg: UIMessage = {
      id: nextLocalId(),
      role: "user",
      content: text,
      timestamp: fmtTime(Date.now() / 1000),
    }
    setMessages((ms) => [...ms, userMsg])
    try {
      const r = await sendMessage(conv.id, text)
      setMessages((ms) => [...ms, {
        id: r.agent_msg.id,
        role: "agent",
        content: r.agent_msg.content,
        timestamp: fmtTime(r.agent_msg.created_at),
      }])
    } catch (e: unknown) {
      setMessages((ms) => [...ms, {
        id: nextLocalId(),
        role: "system",
        content: "出错: " + (e instanceof Error ? e.message : String(e)),
      }])
    } finally {
      setSending(false)
    }
  }

  if (loading) return <p className="p-8 text-center text-sm text-muted-foreground">加载中…</p>
  if (error) return <p className="p-4 text-sm text-destructive">出错: {error}</p>
  if (!conv) return <p className="p-4 text-sm text-destructive">未找到会话</p>

  return (
    <ChatPage
      title={conv.name}
      subtitle={conv.title}
      online={!sending}
      messages={messages}
      inputDisabled={sending}
      onSend={handleSend}
      onBack={() => navigate("/")}
      onSettings={() => {}}
      avatarColor={conv.avatar_color}
      avatarFallback={
        <span className="text-white font-medium">{conv.name.slice(-1)}</span>
      }
    />
  )
}
