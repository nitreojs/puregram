import { Telegram, ApiError } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

// hook-form: fires when an api call inside the request pipeline throws
// `err` is the thrown error, `ctx` carries request context (method, params, etc.)
telegram.useHook('onError', (err, _ctx) => {
  console.error('[onError]:', err.message)
})

telegram.onMessage(async (message) => {
  // try/catch form: catch the throw at the call site
  try {
    await telegram.api.sendMessage({ chat_id: -1, text: 'will fail' })
  } catch (error) {
    if (error instanceof ApiError) {
      console.log(`api error ${error.code}: ${error.message}`)
    }
  }

  // suppress form: opt out of throwing — get a typed `T | ApiResponseError` back
  // use `Telegram.isErrorResponse(...)` to narrow
  const result = await telegram.api.sendMessage({
    chat_id: -1,
    text: 'will also fail',
    suppress: true
  })

  if (Telegram.isErrorResponse(result)) {
    await message.send(`silent error: ${result.description}`)

    return
  }

  await message.send(`sent message_id ${result.message_id}`)
})

await telegram.startPolling()
