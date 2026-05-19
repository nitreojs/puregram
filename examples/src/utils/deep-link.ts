import { deepLink } from '@puregram/utils'

// build proper `https://t.me/<bot>?...` urls with strict validation — no manual string concat,
// no silently-broken links

const bot = 'my_bot'

// bare bot link / start payload
console.log(deepLink.start({ bot }))
console.log(deepLink.start({ bot, payload: 'ref_42' }))

// add the bot to a group (optionally as admin)
console.log(deepLink.startGroup({ bot, payload: 'invite_token' }))
console.log(deepLink.startGroup({ bot, admin: ['post_messages', 'edit_messages'] }))

// channels require admin rights
console.log(deepLink.startChannel({ bot, admin: ['post_messages', 'edit_messages'] }))

// main mini-app + named mini-app
console.log(deepLink.startApp({ bot, payload: 'page_42', mode: 'fullscreen' }))
console.log(deepLink.startApp({ bot, app: 'tictactoe', payload: 'room_7' }))

// attachment menu
console.log(deepLink.startAttach({ bot, payload: 'p', choose: ['users', 'groups'] }))
console.log(deepLink.attachInChat({ chat: { username: 'durov' }, bot, payload: 'p' }))

// game, share, video chat
console.log(deepLink.game({ bot, name: 'tetris' }))
console.log(deepLink.share({ url: 'https://example.com', text: 'check this!' }))
console.log(deepLink.videoChat({ username: 'mychannel', hash: 'abc123', live: true }))
