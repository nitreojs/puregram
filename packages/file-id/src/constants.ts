// file_id type ids — mirror TDLib FileType enum
export enum FileType {
  Thumbnail = 0,
  ProfilePhoto = 1,
  Photo = 2,
  VoiceNote = 3,
  Video = 4,
  Document = 5,
  Encrypted = 6,
  Temp = 7,
  Sticker = 8,
  Audio = 9,
  Animation = 10,
  EncryptedThumbnail = 11,
  Wallpaper = 12,
  VideoNote = 13,
  SecureDecrypted = 14,
  SecureEncrypted = 15,
  Background = 16,
  DocumentAsFile = 17,
  Ringtone = 18,
  CallLog = 19,
  PhotoStory = 20,
  VideoStory = 21,
  SelfDestructingPhoto = 22,
  SelfDestructingVideo = 23,
  SelfDestructingVideoNote = 24,
  SelfDestructingVoiceNote = 25,
  None = 26
}

// type_id flags packed into the high bits of the first i32
export const WEB_LOCATION_FLAG = 0x01000000
export const FILE_REFERENCE_FLAG = 0x02000000

// file_unique_id type ids — small, separate enum
export enum FileUniqueType {
  Web = 0,
  Photo = 1,
  Document = 2,
  Secure = 3,
  Encrypted = 4,
  Temp = 5
}

// PhotoSizeSource variant tags
export enum PhotoSizeSourceType {
  Legacy = 0,
  Thumbnail = 1,
  DialogPhotoSmall = 2,
  DialogPhotoBig = 3,
  StickerSetThumbnail = 4
}

// known-good (version, sub_version) pairs round-tripped by this package
export const SUPPORTED_VERSIONS: readonly (readonly [number, number])[] = [
  [2, 0],
  [4, 22],
  [4, 27],
  [4, 30]
]

// mapping from full FileType to FileUniqueType — used by fileUniqueIdFromFileId
export const FILE_TYPE_TO_UNIQUE: ReadonlyMap<FileType, FileUniqueType> = new Map([
  [FileType.Thumbnail, FileUniqueType.Photo],
  [FileType.ProfilePhoto, FileUniqueType.Photo],
  [FileType.Photo, FileUniqueType.Photo],
  [FileType.EncryptedThumbnail, FileUniqueType.Photo],
  [FileType.Wallpaper, FileUniqueType.Photo],
  [FileType.PhotoStory, FileUniqueType.Photo],
  [FileType.SelfDestructingPhoto, FileUniqueType.Photo],

  [FileType.VoiceNote, FileUniqueType.Document],
  [FileType.Video, FileUniqueType.Document],
  [FileType.Document, FileUniqueType.Document],
  [FileType.Sticker, FileUniqueType.Document],
  [FileType.Audio, FileUniqueType.Document],
  [FileType.Animation, FileUniqueType.Document],
  [FileType.VideoNote, FileUniqueType.Document],
  [FileType.Background, FileUniqueType.Document],
  [FileType.DocumentAsFile, FileUniqueType.Document],
  [FileType.Ringtone, FileUniqueType.Document],
  [FileType.VideoStory, FileUniqueType.Document],
  [FileType.SelfDestructingVideo, FileUniqueType.Document],
  [FileType.SelfDestructingVideoNote, FileUniqueType.Document],
  [FileType.SelfDestructingVoiceNote, FileUniqueType.Document],

  [FileType.SecureDecrypted, FileUniqueType.Secure],
  [FileType.SecureEncrypted, FileUniqueType.Secure],

  [FileType.Encrypted, FileUniqueType.Encrypted],

  [FileType.Temp, FileUniqueType.Temp]
])
