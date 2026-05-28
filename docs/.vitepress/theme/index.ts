import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import './custom.css'

import Home from './components/Home.vue'

// custom theme is a layer on top of the default — extend here as the design grows
export default {
  extends: DefaultTheme,
  enhanceApp ({ app }) {
    app.component('Home', Home)
  }
} satisfies Theme
