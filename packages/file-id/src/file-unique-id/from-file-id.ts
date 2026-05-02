import { FILE_TYPE_TO_UNIQUE, FileUniqueType } from '../constants'
import { FileIdParseError } from '../errors'
import type { ParsedFileId } from '../file-id/types'

import type { ParsedFileUniqueId } from './types'

// eslint-disable-next-line local-rules/no-redundant-return-type -- discriminant unions need explicit kind to narrow
export function fileUniqueIdFromFileId (file: ParsedFileId): ParsedFileUniqueId {
  if (file.kind === 'web') {
    return { kind: 'web', source: '', url: file.url }
  }

  const unique = FILE_TYPE_TO_UNIQUE.get(file.fileType)

  if (unique === undefined) {
    throw new FileIdParseError(`no unique_id mapping for file type ${file.fileType}`)
  }

  switch (unique) {
    case FileUniqueType.Photo: {
      if (file.kind !== 'photo') {
        throw new FileIdParseError('expected photo file_id for photo unique_id')
      }

      const ps = file.photoSize
      // pre-`RemovePhotoVolumeAndLocalId` photos carried volume_id/local_id outside the variant.
      // modern photos drop them — derive a synthetic key from the outer file id (not byte-equal
      // to TDLib's modern unique_id, but stable round-trip on our side)
      const volumeId = 'volumeId' in ps && ps.volumeId !== undefined ? ps.volumeId : file.id
      const localId = 'localId' in ps && ps.localId !== undefined ? ps.localId : 0

      return {
        kind: 'photo',
        source: '',
        volumeId,
        localId
      }
    }

    case FileUniqueType.Document:
      return { kind: 'document', source: '', id: file.id }

    case FileUniqueType.Secure:
      return { kind: 'secure', source: '', id: file.id }

    case FileUniqueType.Encrypted:
      return { kind: 'encrypted', source: '', id: file.id }

    case FileUniqueType.Temp:
      return { kind: 'temp', source: '', id: file.id }

    case FileUniqueType.Web:
      throw new FileIdParseError('FileUniqueType.Web should be handled by the kind === "web" branch')
  }
}
