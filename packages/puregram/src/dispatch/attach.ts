// shared helper for attaching ephemeral, plugin-defined properties onto update
// instances during dispatch (e.g. `update.flow`, `update.session`, `message.match`)
//
// hides the `Object.defineProperty` boilerplate and standardises the descriptor:
// non-enumerable so JSON serialisation and util.inspect default views skip it,
// configurable so subsequent dispatches can overwrite. plugins and core code
// reach for `attach` instead of defining the descriptor manually

interface AttachOptions {
  /**
   * whether the attached property is enumerable (default `false`)
   *
   * keep `false` for properties that wouldn't be useful in a `JSON.stringify(update)`
   * dump or in shallow logging — they're dispatch metadata, not part of the payload
   */
  enumerable?: boolean
  /**
   * whether the attached value can be reassigned (default `false`)
   *
   * core attachments (flow, session, match) are read-only handles — set to `true`
   * for mutable scratch slots
   */
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
