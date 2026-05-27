import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'puregram',
  description: 'powerful and modern telegram bot api sdk for node.js and typescript',
  lang: 'en-US',
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
  ],

  themeConfig: {
    nav: [
      { text: 'guide', link: '/guide/getting-started' },
      { text: 'api', link: '/api/' },
      { text: 'examples', link: 'https://github.com/nitreojs/puregram/tree/v3/examples' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'getting started',
          items: [
            { text: 'introduction', link: '/guide/getting-started' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'api reference',
          items: [
            { text: 'overview', link: '/api/' },
            { text: 'methods', link: '/api/methods' },
            { text: 'objects', link: '/api/objects' }
          ]
        }
      ]
    },

    search: {
      provider: 'local'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/nitreojs/puregram' }
    ]
  },

  // i18n-ready: only `root` (english) active now; adding `ru` later is a sibling
  // key + a docs/ru/ tree, no restructure
  locales: {
    root: { label: 'english', lang: 'en' }
  }
})
