import { ChatType, Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN as string)

telegram.updates.on('message', (context) => {
  // INFO: every is* and has* _method_ is a type predicate
  // INFO: that means `hasText()` method, if returns `true`, will change `context.text`'s type to [string] (it was [string | undefined])

  const text = context.text
  // INFO: here, text is [string | undefined]
  // INFO: let us execute the type predicate method and see if the type changed...

  if (context.hasText() && /hello/i.test(context.text)) {
    const text = context.text
    // INFO: text is now [string]!

    return context.send('hello, world!')
  }

  // INFO: this works for every is*, has* and can* method which can somehow influence the code flow analysis

  if (context.hasCaption()) {
    const caption = context.caption
    // INFO: string
  }

  if (context.hasAttachment() && context.isPM()) {
    const attachment = context.attachment
    // INFO: AnimationAttachment | AudioAttachment | ContactAttachment | ...

    let type = context.chatType
    // INFO: {} & ChatType.Private (`{}` part is because of `SoftString`, don't worry about it)

    // ERROR: Type 'ChatType.Group' is not assignable to type 'ChatType.Private'
    type = ChatType.Group
  }
})

telegram.updates.startPolling()
  .then(() => console.log(`started polling @${telegram.bot.username}`))
  .catch(console.error)
