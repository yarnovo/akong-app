import * as React from "react"
import { useNavigate } from "react-router-dom"
import { listAgents } from "../api"
import type { AgentMeta } from "../data/agents"

export function Agents() {
  const navigate = useNavigate()
  const [agents, setAgents] = React.useState<AgentMeta[]>([])
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    let alive = true
    listAgents()
      .then((r) => { if (alive) setAgents(r) })
      .catch((e: unknown) => { if (alive) setError(e instanceof Error ? e.message : String(e)) })
    return () => { alive = false }
  }, [])

  function open(a: AgentMeta) {
    navigate(`/chat/agent/${a.slug}`)
  }

  return (
    <div className="h-full flex flex-col">
      <header className="shrink-0 px-4 py-3 border-b border-border bg-card">
        <h1 className="text-center text-base font-semibold">智能体</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3" data-testid="agent-grid">
        {error && <p className="col-span-2 text-sm text-destructive">{error}</p>}
        {agents.map((a) => (
          <button
            key={a.slug}
            onClick={() => open(a)}
            className="flex flex-col items-center text-center p-4 border border-border rounded-lg hover:bg-muted active:bg-accent"
            data-testid={`agent-${a.slug}`}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-medium text-lg mb-2"
              style={{ backgroundColor: a.avatar_color }}
            >
              {a.name.slice(-1)}
            </div>
            <div className="text-sm font-medium">{a.name}</div>
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.title}</div>
            {a.pinned ? (
              <span className="text-[10px] mt-2 px-2 py-0.5 bg-primary text-primary-foreground rounded-full">总管</span>
            ) : (
              <span className="text-[10px] mt-2 text-muted-foreground">
                {a.user_side === "C" ? "C 端" : a.user_side === "B" ? "B 端" : ""}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
