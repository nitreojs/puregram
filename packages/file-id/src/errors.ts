export class FileIdParseError extends Error {
  readonly input: string | undefined

  constructor (message: string, input?: string) {
    super(message)

    this.name = 'FileIdParseError'
    this.input = input
  }
}

export class UnsupportedFileIdVersionError extends Error {
  readonly version: number
  readonly subVersion: number

  constructor (version: number, subVersion: number) {
    super(`unsupported file_id version ${version}.${subVersion}`)

    this.name = 'UnsupportedFileIdVersionError'
    this.version = version
    this.subVersion = subVersion
  }
}
