<script setup>
import { userId } from '../api.js'
</script>

<template>
  <div class="h-full flex flex-col">
    <header class="shrink-0 px-4 py-3 border-b border-border bg-card">
      <h1 class="text-center text-base font-semibold">我的</h1>
    </header>
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <div class="text-center py-8">
        <div class="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center text-2xl">👤</div>
        <p class="text-sm font-medium mt-3">匿名用户</p>
        <p class="text-xs text-muted-foreground mt-1">uid: {{ userId().slice(0, 16) }}…</p>
      </div>

      <section class="border-t border-border pt-4 space-y-2">
        <p class="text-xs text-muted-foreground">v0.1 还没接 SSO · 凭 localStorage uid 匿名跑 · 换浏览器 / 清缓存 = 新身份。v0.2 接 OAuth (Apple / Google / 微信)。</p>
      </section>
    </div>
  </div>
</template>
