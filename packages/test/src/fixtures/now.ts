// current unix time in seconds, reading from `Date.now` so the time-travel clock affects fixtures
export function nowSeconds () {
  return Math.floor(Date.now() / 1000)
}
