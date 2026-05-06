# akong-app

阿空总壳子 (豆包风对话列表) · 单点入口 · 多 agent 聚合。

## 老板视角

- prod: https://app.agentaily.com
- staging: https://staging.app.agentaily.com

## 架构

3 个 tab (豆包同款简化):
- **对话** (`/`): 主列表 · 置顶阿空 · 下面用户跟各 agent 的历史会话
- **智能体** (`/agents`): 全部 agent grid
- **我的** (`/me`): 用户信息 + 设置

路由:
- `/chat/:scope/:target` 单会话页 (scope=agent|akong|proxy|group · target=slug 或 id)

阿空特殊处理:
- `pinned: true` 永远在主列表第一条 (即使用户没聊过 · 也显示"点开聊聊")
- `role: router` chat 时 onboarding 文案不同 ("找小喜帮我配相亲 / 找大邮看下今早邮件" 引导)
- v0.2: 阿空帮用户起的代理对话 → 进入阿空详情页的**子列表** (跟独立单聊物理分开)

## 跑

```bash
pnpm install      # file: link 装 @akong/ui
pnpm dev          # http://localhost:5173 + proxy /api → localhost:9200 (akong-app-agent)
pnpm build
```

## 部

```bash
PROFILE=hongniang-main aliyun ossutil cp dist/ oss://agentaily-app/ -r -f --cache-control "public, max-age=300, must-revalidate"
```

## 上下游

- 后端: `akong-app-agent` (api.app.agentaily.com)
- UI 库: `@akong/ui` (file: link)
- 各 agent backend (chat 转发用)

## v0.1 范围

- ✅ 主列表 (置顶阿空 + 用户聊过的 agent)
- ✅ 智能体 grid (9 个 agent)
- ✅ 单 agent chat (历史持久化 sqlite)
- ⚠️ chat backend 是 stub (各 agent 还没接统一 chat endpoint · 现 echo placeholder)
- ❌ 阿空代理子列表 (v0.2)
- ❌ 群聊 + sequential @ reply (v0.2)
- ❌ SSO (v0.2 接 Apple/Google/微信)

## v0.2

- 阿空 router 真接 deepseek-v4-flash · 解析意图 → 起 proxy_session
- 群聊 UI + 后端 (sequential @ orchestrator)
- 各 agent backend 统一 `/chat` endpoint · akong-app 转发
