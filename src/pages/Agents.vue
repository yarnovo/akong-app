<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listAgents } from '../api.js'

const router = useRouter()
const agents = ref([])

async function load() {
  agents.value = await listAgents()
}

function open(a) {
  router.push({ name: 'chat', params: { scope: 'agent', target: a.slug } })
}

onMounted(load)
</script>

<template>
  <div class="h-full flex flex-col">
    <header class="shrink-0 px-4 py-3 border-b border-border bg-card">
      <h1 class="text-center text-base font-semibold">智能体</h1>
    </header>
    <div class="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
      <button v-for="a in agents" :key="a.slug" @click="open(a)"
              class="flex flex-col items-center text-center p-4 border border-border rounded-lg hover:bg-muted active:bg-accent">
        <div class="w-14 h-14 rounded-full flex items-center justify-center text-white font-medium text-lg mb-2"
             :style="{ backgroundColor: a.avatar_color }">
          {{ a.name.slice(-1) }}
        </div>
        <div class="text-sm font-medium">{{ a.name }}</div>
        <div class="text-xs text-muted-foreground mt-1 line-clamp-2">{{ a.title }}</div>
        <span v-if="a.pinned" class="text-[10px] mt-2 px-2 py-0.5 bg-primary text-primary-foreground rounded-full">总管</span>
        <span v-else class="text-[10px] mt-2 text-muted-foreground">{{ a.user_side === 'C' ? 'C 端' : a.user_side === 'B' ? 'B 端' : '' }}</span>
      </button>
    </div>
  </div>
</template>
