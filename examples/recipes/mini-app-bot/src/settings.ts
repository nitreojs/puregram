export type Theme = 'light' | 'dark' | 'auto'

export interface Settings {
  theme: Theme
  notifications: boolean
  displayName: string
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'auto',
  notifications: true,
  displayName: ''
}

/** session key namespace used by both the bot handlers and the http endpoint */
export function sessionKey (userId: number) {
  return `user:${userId}`
}

/** narrow + sanitize whatever arrives from the webapp before storing */
export function parseIncoming (raw: unknown): Settings | null {
  if (typeof raw !== 'object' || raw === null) {
    return null
  }

  const r = raw as Record<string, unknown>

  if (r.theme !== 'light' && r.theme !== 'dark' && r.theme !== 'auto') {
    return null
  }

  if (typeof r.notifications !== 'boolean') {
    return null
  }

  if (typeof r.displayName !== 'string' || r.displayName.length > 64) {
    return null
  }

  return {
    theme: r.theme,
    notifications: r.notifications,
    displayName: r.displayName.trim()
  }
}
