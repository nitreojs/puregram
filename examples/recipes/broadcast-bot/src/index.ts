import { createBot } from './bot'

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

const { telegram } = createBot({ token, adminUserId })

await telegram.start()

console.log(`[broadcast-bot] logged in as @${telegram.bot.username ?? '<unknown>'}`)
console.log(`[broadcast-bot] admin = ${adminUserId}`)

await telegram.startPolling()
