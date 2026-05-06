import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Menu, Search } from "@akong/ui-react"
import { listConversations, type Conversation } from "../api"

function fmtTime(ts: number | null): string {
  if (!ts) return ""
  const d = new Date(ts * 1000)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return d.toTimeString().slice(0, 5)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function List() {
  const navigate = useNavigate()
  const [items, setItems] = React.useState<Conversation[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    let alive = true
    setLoading(true)
    listConversations()
      .then((r) => { if (alive) setItems(r) })
      .catch((e: unknown) => { if (alive) setError(e instanceof Error ? e.message : String(e)) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  function openConv(item: Conversation) {
    navigate(`/chat/${item.scope}/${item.target}`)
  }

  return (
    <div className="h-full flex flex-col">
      <header className="shrink-0 flex items-center px-4 py-3 border-b border-border bg-card">
        <button className="text-muted-foreground"><Menu size={20} /></button>
        <h1 className="flex-1 text-center text-base font-semibold">对话</h1>
        <button className="text-muted-foreground"><Search size={20} /></button>
      </header>

      <div className="flex-1 overflow-y-auto" data-testid="conv-list">
        {loading && <p className="p-8 text-center text-sm text-muted-foreground">加载中…</p>}
        {error && <p className="p-4 text-sm text-destructive">{error}</p>}

        {!loading && items.map((item) => (
          <button
            key={`${item.scope}-${item.target}`}
            onClick={() => openConv(item)}
            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted active:bg-accent border-b border-border ${
              item.pinned ? "bg-secondary/50" : ""
            }`}
            data-testid={`conv-${item.target}`}
          >
            <div
              className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-base"
              style={{ backgroundColor: item.avatar_color }}
            >
              {item.name.slice(-1)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm truncate flex-1">{item.name}</span>
                {item.last_msg_at && (
                  <span className="text-xs text-muted-foreground shrink-0">{fmtTime(item.last_msg_at)}</span>
                )}
              </div>
              <div className="text-sm text-muted-foreground truncate mt-0.5">
                {item.last_msg_preview || item.title}
              </div>
            </div>
            {item.unread_count > 0 && (
              <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-white text-[10px] flex items-center justify-center">
                {item.unread_count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
