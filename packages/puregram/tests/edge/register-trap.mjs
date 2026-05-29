import { register } from 'node:module'

register('./trap-loader.mjs', import.meta.url)
