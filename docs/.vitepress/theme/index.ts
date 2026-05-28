import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'

import './custom.css'

import Home from './components/Home.vue'
import NotFound from './components/NotFound.vue'

// custom theme is a layer on top of the default — extend here as the design grows
export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'not-found': () => h(NotFound)
  }),
  enhanceApp ({ app }) {
    app.component('Home', Home)
  }
} satisfies Theme
