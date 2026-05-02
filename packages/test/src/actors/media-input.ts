import type { FileHandle } from '../world/files'
import type { World } from '../world/world'

export type ActorMediaInput =
  | { source: 'buffer', value: Buffer | Uint8Array, filename?: string }
  | { source: 'url', value: string, filename?: string }
  | { source: 'fileId', value: string }
  | { source: 'path', value: string, filename?: string }

export type ResolvedMedia = FileHandle

export function resolveMedia (world: World, input: ActorMediaInput) {
  switch (input.source) {
    case 'buffer':
      return world.files.registerBuffer(input.value)
    case 'url':
      return world.files.registerUrl(input.value)
    case 'fileId':
      return world.files.registerFileId(input.value)
    case 'path':
      return world.files.registerUrl('path://' + input.value)
  }
}
