<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { withBase } from 'vitepress'

import BrandLogo from './BrandLogo.vue'
import { PUNCHLINES, pick } from '../phrases'

// deterministic first paint, randomize on the client (matches the home)
const punchline = ref(PUNCHLINES[0])

// triggers vitepress's built-in local search (no public api); client-side only
const openSearch = () => {
  const btn = document.querySelector<HTMLElement>('#local-search button, .DocSearch-Button')
  btn?.click()
}

const onKey = (e: KeyboardEvent) => {
  const el = e.target as HTMLElement | null
  const typing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
  if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault()
    openSearch()
  }
}

onMounted(() => {
  punchline.value = pick(PUNCHLINES)
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div class="notfound">
    <div class="logo-wrap">
      <BrandLogo :size="56" />
    </div>
    <span class="label">404 · not handled</span>
    <p class="punch">{{ punchline }}</p>
    <div class="actions">
      <a class="btn primary" :href="withBase('/')">← home</a>
      <a class="btn" :href="withBase('/guide/getting-started/introduction')">browse the docs</a>
      <button class="btn" type="button" @click="openSearch">press / to search</button>
    </div>
  </div>
</template>

<style scoped>
.notfound {
  --acc: #28a3df;
  font-family: 'SF Mono', 'Cascadia Code', 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  text-transform: lowercase;
  min-height: calc(100vh - var(--vp-nav-height, 64px));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 64px 24px;
  box-sizing: border-box;
  text-align: center;
  background: #fff;
}

.logo-wrap {
  opacity: 0.92;
}

.label {
  color: var(--acc);
  font-size: 12px;
  letter-spacing: 3px;
  text-transform: uppercase;
}

.punch {
  margin: 0;
  font-size: 23px;
  color: #213547;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 4px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  border: 1px solid #d3d3d6;
  color: #3c3c43;
  background: none;
  text-decoration: none;
  cursor: pointer;
  font-family: inherit;
  text-transform: lowercase;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.btn:hover,
.btn.primary {
  border-color: var(--acc);
  color: var(--acc);
}

:global(html.dark) .notfound { background: linear-gradient(to bottom, #111, #151515); }
:global(html.dark) .punch { color: #ddd; }
:global(html.dark) .btn { border-color: #333; color: #bbb; }
:global(html.dark) .btn:hover,
:global(html.dark) .btn.primary { border-color: var(--acc); color: var(--acc); }
</style>
