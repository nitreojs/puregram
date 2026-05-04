import { Telegram, createPlugin } from 'puregram'

// a plugin is a `{ name, install }` object
// whatever `install` returns becomes a typed namespace under `tg.<name>`
const greeter = createPlugin({
  name: 'greeter',
  install (tg) {
    // plugins can attach handlers just like userland code
    tg.onMessage((message, next) => {
      if (message.hasText() && /^\/hi$/i.test(message.text)) {
        return message.send('hi from the plugin')
      }

      return next()
    })

    return {
      greet: (name: string) => `hello, ${name}`
    }
  }
})

const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(greeter)

// `telegram.greeter` is the install return value, fully typed
console.log(telegram.greeter.greet('starkow'))

await telegram.startPolling()
