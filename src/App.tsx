import * as React from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { MessageCircle, Handshake, User } from "@akong/ui-react"

interface Tab {
  path: string
  label: string
  Icon: React.ComponentType<{ className?: string; size?: number }>
}

const TABS: Tab[] = [
  { path: "/",       label: "对话",   Icon: MessageCircle },
  { path: "/agents", label: "智能体", Icon: Handshake },
  { path: "/me",     label: "我的",   Icon: User },
]

const TAB_PATHS = new Set(TABS.map((t) => t.path))

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const showTabs = TAB_PATHS.has(location.pathname)

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <main className="flex-1 min-h-0 overflow-hidden">
        <Outlet />
      </main>
      {showTabs && (
        <nav className="shrink-0 flex border-t border-border bg-card" data-testid="tabbar">
          {TABS.map((t) => {
            const active = location.pathname === t.path
            const tabKey = t.path === "/" ? "list" : t.path.slice(1)
            return (
              <button
                key={t.path}
                onClick={() => navigate(t.path)}
                className={`flex-1 flex flex-col items-center py-2 text-[11px] gap-0.5 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid={`tab-${tabKey}`}
              >
                <t.Icon size={22} />
                <span>{t.label}</span>
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}
