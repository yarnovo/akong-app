<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChatPage } from '@akong/ui'
import { getConversation, listMessages, sendMessage, BACKEND_READY } from '../api.js'

const route = useRoute()
const router = useRouter()

const conv = ref(null)
const messages = ref([])
const loading = ref(true)
const error = ref('')
const sending = ref(false)

let nextId = 1
function fmtTime(ts) {
  return new Date(ts * 1000).toTimeString().slice(0, 5)
}

async function load() {
  loading.value = true; error.value = ''
  try {
    conv.value = await getConversation(route.params.scope, route.params.target)
    const raw = await listMessages(conv.value.id)
    messages.value = raw.map(m => ({
      id: m.id,
      role: m.sender_kind === 'user' ? 'user' : (m.sender_kind === 'system' ? 'system' : 'agent'),
      content: m.content,
      timestamp: fmtTime(m.created_at),
    }))
    if (!messages.value.length && conv.value.role === 'router') {
      messages.value.push({ id: 'init-' + nextId++, role: 'agent', content: '我是阿空 · 你说要找谁? 比如"找小喜帮我配相亲"/"找大邮看下今早邮件" · 我帮你叫人。' })
    } else if (!messages.value.length) {
      messages.value.push({ id: 'init-' + nextId++, role: 'agent', content: `${conv.value.name} · ${conv.value.title}` })
    }
  } catch (e) { error.value = e.message } finally { loading.value = false }
}

async function send(text) {
  if (!conv.value) return
  sending.value = true
  messages.value.push({ id: 'tmp-u-' + nextId++, role: 'user', content: text, timestamp: fmtTime(Date.now() / 1000) })
  try {
    const r = await sendMessage(conv.value.id, text)
    // 替换临时 + 加 agent 回
    messages.value.push({
      id: r.agent_msg.id, role: 'agent',
      content: r.agent_msg.content,
      timestamp: fmtTime(r.agent_msg.created_at),
    })
  } catch (e) {
    messages.value.push({ id: 'err-' + nextId++, role: 'system', content: '出错: ' + e.message })
  } finally { sending.value = false }
}

onMounted(load)
</script>

<template>
  <div class="h-full flex flex-col">
    <p v-if="loading" class="p-8 text-center text-sm text-muted-foreground">加载中…</p>
    <p v-else-if="error" class="p-4 text-sm text-destructive">出错: {{ error }}</p>

    <ChatPage
      v-else-if="conv"
      :title="conv.name"
      :subtitle="conv.title"
      :online="!sending"
      :messages="messages"
      :input-disabled="sending || !BACKEND_READY"
      @send="send"
      @back="router.push({ name: 'list' })"
      @settings="() => {}"
      class="h-full"
    >
      <template #avatar>
        <div class="w-full h-full flex items-center justify-center text-white font-medium"
             :style="{ backgroundColor: conv.avatar_color }">
          {{ conv.name.slice(-1) }}
        </div>
      </template>
    </ChatPage>
  </div>
</template>
