export interface SessionStorage {
  get(key: string): Promise<any | undefined>
  set(key: string, value: any): Promise<boolean>
  has(key: string): Promise<boolean>
  delete(key: string): Promise<boolean>
  touch(key: string): Promise<void>
}
