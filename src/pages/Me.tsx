import { User } from "@akong/ui-react"
import { userId } from "../api"

export function Me() {
  return (
    <div className="h-full flex flex-col">
      <header className="shrink-0 px-4 py-3 border-b border-border bg-card">
        <h1 className="text-center text-base font-semibold">我的</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
            <User className="size-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mt-3">匿名用户</p>
          <p className="text-xs text-muted-foreground mt-1" data-testid="uid">
            uid: {userId().slice(0, 16)}…
          </p>
        </div>

        <section className="border-t border-border pt-4 space-y-2">
          <p className="text-xs text-muted-foreground">
            v0.2 还没接 SSO · 凭 localStorage uid 匿名跑 · 换浏览器 / 清缓存 = 新身份。后续接 OAuth (Apple / Google / 微信)。
          </p>
        </section>
      </div>
    </div>
  )
}
