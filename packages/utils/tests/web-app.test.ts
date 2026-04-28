import crypto from 'node:crypto'

import { describe, expect, it } from 'vitest'

import { WebApp } from '../src/web-app'

const TEST_TOKEN = '1234567890:ABCDEFghijklmnopqrstuvwxyz'

function signInitData (token: string, fields: Record<string, string>) {
  const key = crypto.createHmac('sha256', 'WebAppData').update(token).digest()
  const dataCheckString = Object.keys(fields)
    .filter(k => k !== 'hash')
    .sort()
    .map(k => `${k}=${fields[k] ?? ''}`)
    .join('\n')
  const hash = crypto.createHmac('sha256', key).update(dataCheckString).digest('hex')
  const params = new URLSearchParams({ ...fields, hash })

  return params.toString()
}

describe('WebApp.generateSecretKey', () => {
  it('returns a 32-byte buffer (HMAC-SHA256)', () => {
    const key = WebApp.generateSecretKey(TEST_TOKEN)

    expect(Buffer.isBuffer(key)).toBe(true)
    expect(key.length).toBe(32)
  })

  it('is deterministic for the same token', () => {
    expect(WebApp.generateSecretKey(TEST_TOKEN).equals(WebApp.generateSecretKey(TEST_TOKEN))).toBe(true)
  })
})

describe('WebApp.parseInitData', () => {
  it('parses query-string fields into a flat object', () => {
    expect(WebApp.parseInitData('a=1&b=hello%20world&c=')).toEqual({ a: '1', b: 'hello world', c: '' })
  })
})

describe('WebApp.validate', () => {
  const fields = { auth_date: '1700000000', user: '{"id":42,"first_name":"Alice"}' }

  it('returns true for a correctly signed initData (token form)', () => {
    const initData = signInitData(TEST_TOKEN, fields)

    expect(WebApp.validate({ initData, token: TEST_TOKEN })).toBe(true)
  })

  it('returns true for a correctly signed initData (key form)', () => {
    const initData = signInitData(TEST_TOKEN, fields)
    const key = WebApp.generateSecretKey(TEST_TOKEN)

    expect(WebApp.validate({ initData, key })).toBe(true)
  })

  it('returns false when the hash is forged', () => {
    const initData = signInitData(TEST_TOKEN, fields)
    const tampered = initData.replace(/hash=[a-f0-9]+$/, 'hash=' + 'f'.repeat(64))

    expect(WebApp.validate({ initData: tampered, token: TEST_TOKEN })).toBe(false)
  })

  it('returns false when payload is altered after signing', () => {
    const initData = signInitData(TEST_TOKEN, fields)
    const altered = initData.replace('auth_date=1700000000', 'auth_date=1700000001')

    expect(WebApp.validate({ initData: altered, token: TEST_TOKEN })).toBe(false)
  })

  it('throws when neither key nor token is provided', () => {
    expect(() => WebApp.validate({ initData: 'hash=x' })).toThrow(TypeError)
  })

  it('throws when initData has no hash field', () => {
    expect(() => WebApp.validate({ initData: 'auth_date=1', token: TEST_TOKEN })).toThrow(TypeError)
  })

  it('throws on invalid hash when throwError is true', () => {
    const initData = signInitData(TEST_TOKEN, fields).replace(/hash=[a-f0-9]+$/, 'hash=' + 'f'.repeat(64))

    expect(() => WebApp.validate({ initData, token: TEST_TOKEN, throwError: true })).toThrow('hash mismatch')
  })
})
