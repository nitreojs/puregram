export function base64urlDecode (input: string) {
  return new Uint8Array(Buffer.from(input, 'base64url'))
}

export function base64urlEncode (input: Uint8Array) {
  return Buffer.from(input).toString('base64url')
}
