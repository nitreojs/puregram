export interface SessionStorage {
  get(key: string): Promise<object | undefined>
  set(key: string, value: object): Promise<boolean>
  has(key: string): Promise<boolean>
  delete(key: string): Promise<boolean>
  touch(key: string): Promise<void>
}
