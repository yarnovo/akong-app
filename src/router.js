import { createRouter, createWebHashHistory } from 'vue-router'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/',                  name: 'list',     component: () => import('./pages/List.vue') },
    { path: '/agents',            name: 'agents',   component: () => import('./pages/Agents.vue') },
    { path: '/me',                name: 'me',       component: () => import('./pages/Me.vue') },
    { path: '/chat/:scope/:target', name: 'chat',   component: () => import('./pages/Chat.vue') },
  ],
})
