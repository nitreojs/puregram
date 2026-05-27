import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import './custom.css'

// custom theme is a layer on top of the default — extend here as the design grows
export default {
  extends: DefaultTheme
} satisfies Theme
