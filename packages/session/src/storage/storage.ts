export interface SessionStorage {
  get: (key: string) => Promise<unknown>
  set: (key: string, value: unknown) => Promise<boolean>
  has: (key: string) => Promise<boolean>
  delete: (key: string) => Promise<boolean>
  touch: (key: string) => Promise<void>
}
