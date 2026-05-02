interface AttachOptions {
  /** whether the attached property is enumerable (default `false`) — keep off for dispatch metadata */
  enumerable?: boolean
  /** whether the attached value can be reassigned (default `false`) — set true for mutable scratch slots */
  writable?: boolean
}

export function attach<T> (target: object, name: string, value: T, options: AttachOptions = {}) {
  Object.defineProperty(target, name, {
    value,
    configurable: true,
    enumerable: options.enumerable ?? false,
    writable: options.writable ?? false
  })
}
