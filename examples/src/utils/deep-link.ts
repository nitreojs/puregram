import { deepLink } from '@puregram/utils'

// build proper `https://t.me/<bot>?...` urls with url-encoded payloads — no manual string concat
const bot = 'my_bot'

console.log(deepLink({ bot, start: 'ref_42' }))
console.log(deepLink({ bot, startgroup: 'invite_token' }))
console.log(deepLink({ bot, startapp: 'mini_app_payload' }))

// `startchannel` + `admin` requests admin rights joined by `+`
console.log(deepLink({ bot, startchannel: true, admin: ['post_messages', 'edit_messages'] }))
