import { readFile, writeFile, mkdir, unlink } from 'node:fs/promises'
import { dirname, join } from 'node:path'

import type { KVStorage } from '@puregram/storage'

// implementing `KVStorage<V>` lets you plug your own backend into every puregram plugin
// this one persists each key as a json file under `./data/`
class FileStorage<V> implements KVStorage<V> {
  constructor (private readonly dir: string) {}

  async get (key: string) {
    try {
      const text = await readFile(this.path(key), 'utf8')

      return JSON.parse(text) as V
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return undefined
      }

      throw error
    }
  }

  async set (key: string, value: V) {
    const path = this.path(key)

    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, JSON.stringify(value), 'utf8')
  }

  async delete (key: string) {
    try {
      await unlink(this.path(key))
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
    }
  }

  async has (key: string) {
    try {
      await readFile(this.path(key))

      return true
    } catch {
      return false
    }
  }

  private path (key: string) {
    return join(this.dir, encodeURIComponent(key) + '.json')
  }
}

const storage = new FileStorage<{ counter: number }>('./data')

await storage.set('user:1', { counter: 1 })

console.log(await storage.get('user:1'))
