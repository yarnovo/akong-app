<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()

// 4 个 tab · 跟豆包对齐 (简化 5→3)
const tabs = [
  { name: 'list',   label: '对话',     icon: '💬' },
  { name: 'agents', label: '智能体',   icon: '🤖' },
  { name: 'me',     label: '我的',     icon: '👤' },
]

const showTabs = computed(() => ['list', 'agents', 'me'].includes(route.name))
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-background overflow-hidden">
    <main class="flex-1 min-h-0 overflow-hidden">
      <router-view />
    </main>
    <nav v-if="showTabs" class="shrink-0 flex border-t border-border bg-card" data-testid="tabbar">
      <button v-for="t in tabs" :key="t.name"
              @click="router.push({ name: t.name })"
              class="flex-1 flex flex-col items-center py-2 text-xs gap-0.5"
              :class="route.name === t.name ? 'text-primary' : 'text-muted-foreground'"
              :data-testid="`tab-${t.name}`">
        <span class="text-base">{{ t.icon }}</span>
        <span>{{ t.label }}</span>
      </button>
    </nav>
  </div>
</template>
