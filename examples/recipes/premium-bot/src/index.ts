import { Telegram } from 'puregram'

import { registerCommandHandlers } from './handlers/commands'
import { registerPaymentHandlers } from './handlers/payment'

const token = process.env.TOKEN

if (token === undefined || token === '') {
  console.error('set TOKEN= in .env')
  process.exit(1)
}

const rawAdminId = process.env.ADMIN_USER_ID
const adminUserId = rawAdminId === undefined ? Number.NaN : Number.parseInt(rawAdminId, 10)

if (Number.isNaN(adminUserId)) {
  console.error('set ADMIN_USER_ID= in .env (your telegram user id)')
  process.exit(1)
}

const telegram = Telegram.fromToken(token)

registerPaymentHandlers(telegram)
registerCommandHandlers(telegram, { adminUserId })

await telegram.start()

console.log(`[premium-bot] logged in as @${telegram.bot.username ?? '<unknown>'}`)
console.log(`[premium-bot] admin = ${adminUserId}`)

await telegram.startPolling()
