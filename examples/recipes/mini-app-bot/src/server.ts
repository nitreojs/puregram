import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import fastifyStatic from '@fastify/static'
import { WebApp } from '@puregram/utils'
import Fastify from 'fastify'
import { InlineQueryResult, InputMessageContent } from 'puregram'

import type { Bot } from './bot'
import { DEFAULT_SETTINGS, parseIncoming, sessionKey, type Settings } from './settings'

interface ServerConfig {
  telegram: Bot
  token: string
  port: number
}

interface SavePayload {
  initData: string
  settings: unknown
}

interface SharePayload {
  initData: string
}

/** decode the `user` and `query_id` fields from a validated initData string */
function readInitData (initData: string) {
  const parsed = WebApp.parseInitData(initData)
  const user = parsed.user === undefined ? undefined : JSON.parse(parsed.user) as { id: number; first_name?: string }

  return { user, queryId: parsed.query_id }
}

const here = dirname(fileURLToPath(import.meta.url))
const webappRoot = resolve(here, '..', 'webapp')

function escapeHtml (text: string) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

export function createServer ({ telegram, token, port }: ServerConfig) {
  const app = Fastify({ logger: false })

  app.register(fastifyStatic, { root: webappRoot })

  app.post('/api/save', async (request, reply) => {
    const body = request.body as SavePayload | undefined

    if (body === undefined || typeof body.initData !== 'string') {
      return reply.status(400).send({ error: 'initData missing' })
    }

    if (!WebApp.validate({ initData: body.initData, token })) {
      return reply.status(401).send({ error: 'initData signature mismatch' })
    }

    const { user } = readInitData(body.initData)

    if (user === undefined || typeof user.id !== 'number') {
      return reply.status(400).send({ error: 'user missing from initData' })
    }

    const settings = parseIncoming(body.settings)

    if (settings === null) {
      return reply.status(422).send({ error: 'invalid settings shape' })
    }

    const key = sessionKey(user.id)
    const previous = (await telegram.session.get(key) ?? {}) as { settings?: Settings }

    await telegram.session.set(key, { ...previous, settings })

    // confirm in chat — webapp closes itself client-side
    await telegram.api.sendMessage({
      chat_id: user.id,
      text:
        '✓ settings saved\n\n'
        + `theme: ${settings.theme}\n`
        + `notifications: ${settings.notifications}\n`
        + `display name: ${settings.displayName === '' ? '(empty)' : settings.displayName}`
    })

    return { ok: true, settings }
  })

  // GET /api/initial?initData=... — webapp calls this on mount to prefill the form.
  // we re-validate here too; never trust a client to tell us who it is
  app.get('/api/initial', async (request, reply) => {
    const initData = (request.query as { initData?: string }).initData

    if (initData === undefined || !WebApp.validate({ initData, token })) {
      return reply.status(401).send({ error: 'initData signature mismatch' })
    }

    const { user } = readInitData(initData)

    if (user === undefined || typeof user.id !== 'number') {
      return reply.status(400).send({ error: 'user missing from initData' })
    }

    const stored = (await telegram.session.get(sessionKey(user.id)) ?? {}) as { settings?: Settings }

    return { settings: stored.settings ?? DEFAULT_SETTINGS }
  })

  // POST /api/share — posts a "settings card" message into the user's current
  // chat ON BEHALF OF THE USER via answerWebAppQuery. requires a query_id, which
  // is present on initData for menu-button / inline-keyboard / main-app launches
  // (and absent for reply-keyboard launches)
  app.post('/api/share', async (request, reply) => {
    const body = request.body as SharePayload | undefined

    if (body === undefined || typeof body.initData !== 'string') {
      return reply.status(400).send({ error: 'initData missing' })
    }

    if (!WebApp.validate({ initData: body.initData, token })) {
      return reply.status(401).send({ error: 'initData signature mismatch' })
    }

    const { user, queryId } = readInitData(body.initData)

    if (user === undefined || typeof user.id !== 'number') {
      return reply.status(400).send({ error: 'user missing from initData' })
    }

    if (queryId === undefined) {
      return reply.status(400).send({ error: 'no query_id in initData — share is only available for menu-button / inline-keyboard / main-app launches' })
    }

    const stored = (await telegram.session.get(sessionKey(user.id)) ?? {}) as { settings?: Settings }
    const settings = stored.settings ?? DEFAULT_SETTINGS
    const displayName = settings.displayName === '' ? user.first_name ?? 'unnamed' : settings.displayName

    await telegram.api.answerWebAppQuery({
      web_app_query_id: queryId,
      result: InlineQueryResult.article({
        id: `settings-${user.id}-${Date.now()}`,
        title: `${displayName}'s settings`,
        description: `theme: ${settings.theme} • notifications: ${settings.notifications ? 'on' : 'off'}`,
        content: InputMessageContent.text(
          `<b>${escapeHtml(displayName)}'s settings</b>\n`
          + `theme: <code>${settings.theme}</code>\n`
          + `notifications: <code>${settings.notifications ? 'on' : 'off'}</code>`,
          { parseMode: 'HTML' }
        )
      })
    })

    return { ok: true }
  })

  return {
    listen: async () => {
      await app.listen({ port, host: '0.0.0.0' })
    },
    close: () => app.close()
  }
}
