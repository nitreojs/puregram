<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { withBase } from 'vitepress'

import BrandLogo from './BrandLogo.vue'
import { TAGLINES, pick } from '../phrases'

// deterministic first paint (ssr), randomize on the client to avoid hydration mismatch
const tagline = ref(TAGLINES[0])

onMounted(() => {
  tagline.value = pick(TAGLINES)
})

const cards = [
  { kicker: 'start here', title: 'getting started', blurb: 'install, token, your first bot in 10 lines', link: '/guide/getting-started/introduction' },
  { kicker: 'extend', title: 'plugins', blurb: 'sessions, scenes, flow, markup & more', link: '/plugins/' },
  { kicker: 'reference', title: 'api', blurb: 'every method & object, pinned to the schema', link: '/reference/api' }
]
</script>

<template>
  <div class="home">
    <section class="hero">
      <BrandLogo :size="64" />
      <h1 class="name">puregram</h1>
      <p class="tagline">{{ tagline }}</p>
      <div class="actions">
        <a class="btn primary" :href="withBase('/guide/getting-started/introduction')">get started →</a>
        <a class="btn" href="https://github.com/puregram/puregram" target="_blank" rel="noreferrer">github</a>
      </div>
    </section>

    <section class="cards">
      <a v-for="card in cards" :key="card.title" class="card" :href="withBase(card.link)">
        <span class="kicker">{{ card.kicker }}</span>
        <span class="card-title">{{ card.title }}</span>
        <span class="blurb">{{ card.blurb }}</span>
        <span class="arrow">→</span>
      </a>
    </section>
  </div>
</template>

<style scoped>
.home {
  --acc: #28a3df;
  font-family: 'SF Mono', 'Cascadia Code', 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  text-transform: lowercase;
  min-height: calc(100vh - var(--vp-nav-height, 64px));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 48px;
  padding: 64px 24px;
  box-sizing: border-box;
  background: #fff;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.name {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #213547;
  border: none;
}

.tagline {
  margin: 0;
  font-size: 14px;
  color: #67676c;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 13px;
  border: 1px solid #d3d3d6;
  color: #3c3c43;
  text-decoration: none;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.btn:hover,
.btn.primary {
  border-color: var(--acc);
  color: var(--acc);
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
  max-width: 880px;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px;
  border-radius: 10px;
  background: #f6f6f7;
  border: 1px solid #ececef;
  text-decoration: none;
  transition: border-color 0.15s ease, transform 0.15s ease;
}

.card:hover {
  border-color: var(--acc);
  transform: translateY(-2px);
}

.kicker {
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #888;
}

.card-title {
  font-size: 15px;
  color: #213547;
}

.blurb {
  font-size: 12px;
  line-height: 1.5;
  color: #67676c;
}

.arrow {
  margin-top: 4px;
  color: var(--acc);
}

@media (max-width: 720px) {
  .cards {
    grid-template-columns: 1fr;
    max-width: 420px;
  }
}
</style>

<style>
/* dark overrides live unscoped + anchored under .home — vue strips the trailing
   selector off a scoped :global(.dark) descendant, so they can't be scoped here */
html.dark .home { background: linear-gradient(to bottom, #111, #151515); }
html.dark .home .name { color: #ccc; }
html.dark .home .tagline { color: #666; }
html.dark .home .btn { border-color: #333; color: #bbb; }
html.dark .home .btn:hover,
html.dark .home .btn.primary { border-color: var(--acc); color: var(--acc); }
html.dark .home .card { background: #181818; border-color: #262626; }
html.dark .home .card-title { color: #ddd; }
html.dark .home .blurb { color: #777; }
html.dark .home .kicker { color: #666; }
</style>
