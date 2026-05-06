<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listConversations } from '../api.js'

const router = useRouter()
const items = ref([])
const loading = ref(true)
const error = ref('')

async function refresh() {
  loading.value = true; error.value = ''
  try {
    items.value = await listConversations()
  } catch (e) { error.value = e.message } finally { loading.value = false }
}

function openConv(item) {
  router.push({ name: 'chat', params: { scope: item.scope, target: item.target } })
}

function fmtTime(ts) {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return d.toTimeString().slice(0, 5)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

onMounted(refresh)
</script>

<template>
  <div class="h-full flex flex-col">
    <header class="shrink-0 flex items-center px-4 py-3 border-b border-border bg-card">
      <span class="text-xs">⊞</span>
      <h1 class="flex-1 text-center text-base font-semibold">对话</h1>
      <span class="text-xs">🔍</span>
    </header>

    <div class="flex-1 overflow-y-auto" data-testid="conv-list">
      <p v-if="loading" class="p-8 text-center text-sm text-muted-foreground">加载中…</p>
      <p v-else-if="error" class="p-4 text-sm text-destructive">{{ error }}</p>

      <button v-for="item in items" :key="`${item.scope}-${item.target}`"
              @click="openConv(item)"
              class="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted active:bg-accent border-b border-border"
              :class="item.pinned && 'bg-secondary'"
              :data-testid="`conv-${item.target}`">
        <div class="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-base"
             :style="{ backgroundColor: item.avatar_color }">
          {{ item.name.slice(-1) }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline gap-2">
            <span class="font-medium text-sm truncate flex-1">{{ item.name }}</span>
            <span v-if="item.last_msg_at" class="text-xs text-muted-foreground shrink-0">{{ fmtTime(item.last_msg_at) }}</span>
          </div>
          <div class="text-sm text-muted-foreground truncate mt-0.5">{{ item.last_msg_preview || item.title }}</div>
        </div>
        <span v-if="item.unread_count" class="shrink-0 w-5 h-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center">{{ item.unread_count }}</span>
      </button>
    </div>
  </div>
</template>
