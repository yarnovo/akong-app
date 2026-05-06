// 9 个 agent 注册表 · 跟 ~/.claude/repos/akong-app-agent/src/akong_app_agent/agents.py 同步
// backend prod 接通后可由 /api/agents 拉取 · v0.1 mock 走本表

export type AgentRole = "router" | "agent"
export type UserSide = "B" | "C"

export interface AgentMeta {
  slug: string
  name: string
  title: string
  avatar_color: string
  role: AgentRole
  pinned: boolean
  user_side: UserSide
}

export const AGENTS: AgentMeta[] = [
  { slug: "akong",    name: "阿空",         title: "总管 · 跟我说要找谁 · 我帮你叫",                       avatar_color: "hsl(0 0% 9%)",     role: "router", pinned: true,  user_side: "C" },
  { slug: "xiaoxi",   name: "阿空红娘小喜", title: "C 端相亲 · 跟我聊配偏好 · 我帮你筛真人",               avatar_color: "hsl(330 80% 60%)", role: "agent",  pinned: false, user_side: "C" },
  { slug: "xiaoqiao", name: "阿空红娘小桥", title: "B 端机构对接 · 接会员名单 · 中转消息",                 avatar_color: "hsl(280 60% 55%)", role: "agent",  pinned: false, user_side: "B" },
  { slug: "xiaohua",  name: "阿空小画",     title: "C 端 AI 头像生成 · 不抄不模仿不广告",                  avatar_color: "hsl(180 60% 50%)", role: "agent",  pinned: false, user_side: "C" },
  { slug: "xiaozhi",  name: "阿空小知",     title: "C 端个人知识管理 · 一概念一节点 · 数据归你",           avatar_color: "hsl(140 50% 50%)", role: "agent",  pinned: false, user_side: "C" },
  { slug: "xiaoke",   name: "阿空小客",     title: "C 端客服 + 反馈 · 不替谁辩解 · 不假装一定改",          avatar_color: "hsl(40 80% 55%)",  role: "agent",  pinned: false, user_side: "C" },
  { slug: "dayou",    name: "阿空大邮",     title: "C 端邮箱管理 · 你挂自己邮箱 · 不替你拍 · 不自动回",    avatar_color: "hsl(220 30% 25%)", role: "agent",  pinned: false, user_side: "C" },
  { slug: "xiaoyan",  name: "阿空发现小研", title: "C 端 AI 项目调研陪伴 · 听你的故事不堆 idea",           avatar_color: "hsl(200 60% 50%)", role: "agent",  pinned: false, user_side: "C" },
  { slug: "dayan",    name: "阿空发现大研", title: "B 端给客户配专属小研",                                 avatar_color: "hsl(15 70% 50%)",  role: "agent",  pinned: false, user_side: "B" },
]

export const findAgent = (slug: string): AgentMeta | undefined =>
  AGENTS.find((a) => a.slug === slug)
