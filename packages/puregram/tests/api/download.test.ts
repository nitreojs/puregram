import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'

import { Photo } from '@puregram/api'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  download,
  downloadIterable,
  downloadStream,
  downloadToFile,
  getFileURL,
  resolveDownloadTarget
} from '../../src/api/download'
import type { HttpClient } from '../../src/http/client'
import { MediaSource } from '../../src/media-source'
import type { ResolvedTelegramOptions } from '../../src/options'

const baseOptions: ResolvedTelegramOptions = {
  token: 'TEST',
  httpClient: undefined,
  apiBaseUrl: 'https://api.telegram.org/bot',
  apiTimeout: 5000,
  apiWait: 1000,
  apiRetryLimit: 0,
  apiHeaders: {},
  useTestDc: false,
  useLocal: false,
  allowedUpdates: []
}

const FILE_BYTES = Buffer.from('hello world from telegram')

function streamFromBytes (bytes: Buffer) {
  return new ReadableStream<Uint8Array>({
    start (controller) {
      controller.enqueue(new Uint8Array(bytes))
      controller.close()
    }
  })
}

function readerOnlyStream (chunks: Buffer[]) {
  const source = new ReadableStream<Uint8Array>({
    start (controller) {
      for (const chunk of chunks) {
        controller.enqueue(new Uint8Array(chunk))
      }

      controller.close()
    }
  })

  // emulates a runtime whose ReadableStream exposes only getReader()
  return { getReader: () => source.getReader() } as unknown as ReadableStream<Uint8Array>
}

function mockClient (overrides?: Partial<HttpClient>) {
  return {
    request: vi.fn(),
    download: vi.fn().mockImplementation(() => Promise.resolve({
      status: 200,
      body: streamFromBytes(FILE_BYTES)
    })),
    ...overrides
  }
}

function depsWith (httpClient: HttpClient, options: Partial<ResolvedTelegramOptions> = {}) {
  return {
    options: { ...baseOptions, ...options },
    httpClient,
    getFile: vi.fn().mockImplementation((file_id: string) => Promise.resolve({
      file_id,
      file_unique_id: 'u_' + file_id,
      file_path: 'documents/file_42.bin'
    }))
  }
}

describe('resolveDownloadTarget', () => {
  it('accepts a raw file_id string', () => {
    expect(resolveDownloadTarget('AbCdEf')).toEqual({ fileId: 'AbCdEf' })
  })

  it('accepts a wrapper-shape (camelCase)', () => {
    expect(resolveDownloadTarget({ fileId: 'X', filePath: 'p/f' }))
      .toEqual({ fileId: 'X', filePath: 'p/f' })
  })

  it('accepts a raw payload (snake_case)', () => {
    expect(resolveDownloadTarget({ file_id: 'X', file_path: 'p/f' }))
      .toEqual({ fileId: 'X', filePath: 'p/f' })
  })

  it('accepts MediaSource.fileId(...)', () => {
    expect(resolveDownloadTarget(MediaSource.fileId('AbC'))).toEqual({ fileId: 'AbC' })
  })

  it('accepts a TelegramPhotoSize[] and picks the largest by file_size', () => {
    const sizes = [
      { file_id: 'small', file_unique_id: 's', width: 90, height: 90, file_size: 1000 },
      { file_id: 'big', file_unique_id: 'b', width: 800, height: 800, file_size: 50_000 },
      { file_id: 'med', file_unique_id: 'm', width: 320, height: 320, file_size: 10_000 }
    ]

    expect(resolveDownloadTarget(sizes)).toEqual({ fileId: 'big' })
  })

  it('falls back to width × height when file_size is missing on photo sizes', () => {
    const sizes = [
      { file_id: 'a', file_unique_id: 'a', width: 100, height: 100 },
      { file_id: 'b', file_unique_id: 'b', width: 800, height: 600 }
    ]

    expect(resolveDownloadTarget(sizes)).toEqual({ fileId: 'b' })
  })

  it('accepts a Photo wrapper and unwraps to its largest raw size', () => {
    const photo = new Photo([
      { file_id: 'small', file_unique_id: 's', width: 90, height: 90, file_size: 1000 },
      { file_id: 'big', file_unique_id: 'b', width: 800, height: 800, file_size: 50_000 }
    ])

    expect(resolveDownloadTarget(photo)).toEqual({ fileId: 'big' })
  })

  it('throws on upload-only MediaSource variants', () => {
    expect(() => resolveDownloadTarget(MediaSource.path('/tmp/x.jpg') as never))
      .toThrow(/cannot download from a "path"/)
    expect(() => resolveDownloadTarget(MediaSource.url('https://x') as never))
      .toThrow(/cannot download from a "url"/)
    expect(() => resolveDownloadTarget(MediaSource.buffer(Buffer.from('hi')) as never))
      .toThrow(/cannot download from a "buffer"/)
  })

  it('throws when no file_id can be found', () => {
    expect(() => resolveDownloadTarget({} as never)).toThrow(/no file_id/)
  })

  it('throws on an empty photo size array', () => {
    expect(() => resolveDownloadTarget([] as never)).toThrow(/empty photo size array/)
  })
})

describe('getFileURL', () => {
  it('builds the public URL via getFile when no file_path is present', async () => {
    const deps = depsWith(mockClient())
    const url = await getFileURL(deps, 'fid')

    expect(url).toBe('https://api.telegram.org/file/botTEST/documents/file_42.bin')
    expect(deps.getFile).toHaveBeenCalledWith('fid')
  })

  it('skips getFile when the target already carries file_path', async () => {
    const deps = depsWith(mockClient())
    const url = await getFileURL(deps, { file_id: 'fid', file_path: 'photos/x.jpg' })

    expect(url).toBe('https://api.telegram.org/file/botTEST/photos/x.jpg')
    expect(deps.getFile).not.toHaveBeenCalled()
  })

  it('returns the bare path under useLocal', async () => {
    const deps = depsWith(mockClient(), { useLocal: true })
    const url = await getFileURL(deps, { file_id: 'fid', file_path: '/srv/storage/photos/x.jpg' })

    expect(url).toBe('/srv/storage/photos/x.jpg')
  })
})

describe('download primitives', () => {
  it('download() returns the body as a Buffer', async () => {
    const deps = depsWith(mockClient())
    const buf = await download(deps, 'fid')

    expect(buf.equals(FILE_BYTES)).toBe(true)
  })

  it('downloadStream() returns a node Readable that yields the body', async () => {
    const deps = depsWith(mockClient())
    const stream = await downloadStream(deps, 'fid')

    expect(stream).toBeInstanceOf(Readable)

    const chunks: Buffer[] = []

    for await (const chunk of stream) {
      chunks.push(chunk as Buffer)
    }

    expect(Buffer.concat(chunks).equals(FILE_BYTES)).toBe(true)
  })

  it('downloadIterable() yields the body as Uint8Array chunks', async () => {
    const deps = depsWith(mockClient())
    const iter = await downloadIterable(deps, 'fid')

    const chunks: Buffer[] = []

    for await (const chunk of iter) {
      chunks.push(Buffer.from(chunk))
    }

    expect(Buffer.concat(chunks).equals(FILE_BYTES)).toBe(true)
  })

  it('download() falls back to getReader() when the body is not async-iterable', async () => {
    const parts = [Buffer.from('hello '), Buffer.from('world from '), Buffer.from('telegram')]
    const httpClient = mockClient({
      download: vi.fn().mockResolvedValue({ status: 200, body: readerOnlyStream(parts) })
    })
    const deps = depsWith(httpClient)
    const buf = await download(deps, 'fid')

    expect(buf.equals(FILE_BYTES)).toBe(true)
  })

  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'puregram-download-'))
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('downloadToFile() writes the body to disk', async () => {
    const deps = depsWith(mockClient())
    const path = join(dir, 'out.bin')

    await downloadToFile(deps, path, 'fid')

    expect((await readFile(path)).equals(FILE_BYTES)).toBe(true)
  })

  it('useLocal mode reads from the local file system instead of HTTP', async () => {
    const localPath = join(dir, 'local.bin')

    await writeFile(localPath, FILE_BYTES)

    const httpClient = mockClient()
    const deps = depsWith(httpClient, { useLocal: true })
    const buf = await download(deps, { file_id: 'fid', file_path: localPath })

    expect(buf.equals(FILE_BYTES)).toBe(true)
    expect(httpClient.download).not.toHaveBeenCalled()
  })

  it('falls back to native fetch when the client omits download()', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(FILE_BYTES, { status: 200 })
    )

    const httpClient: HttpClient = { request: vi.fn() }
    const deps = depsWith(httpClient)
    const buf = await download(deps, 'fid')

    expect(buf.equals(FILE_BYTES)).toBe(true)
    expect(fetchSpy).toHaveBeenCalled()

    fetchSpy.mockRestore()
  })

  it('throws when the server returns a 4xx', async () => {
    const httpClient = mockClient({
      download: vi.fn().mockResolvedValue({ status: 404, body: streamFromBytes(Buffer.alloc(0)) })
    })
    const deps = depsWith(httpClient)

    await expect(download(deps, 'fid')).rejects.toThrow(/404/)
  })
})
