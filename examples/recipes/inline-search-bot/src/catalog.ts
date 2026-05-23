export interface Product {
  id: string
  title: string
  description: string
  price: string
}

export const PAGE_SIZE = 5

// tiny demo dataset — swap for a real db or http search in a production bot
const products: Product[] = [
  { id: 'p1', title: 'mechanical keyboard', description: 'tactile switches, hot-swappable, 75% layout', price: '$129' },
  { id: 'p2', title: 'low-profile keyboard', description: 'slim aluminium, magnetic switches', price: '$179' },
  { id: 'p3', title: 'ergonomic split keyboard', description: 'wireless, columnar layout, ortho keys', price: '$349' },
  { id: 'p4', title: 'wireless mouse', description: 'bluetooth + 2.4ghz, 8000 dpi sensor', price: '$59' },
  { id: 'p5', title: 'gaming mouse', description: 'wired, 26000 dpi, six programmable buttons', price: '$79' },
  { id: 'p6', title: 'trackball mouse', description: 'thumb-operated, scroll ring, large ball', price: '$99' },
  { id: 'p7', title: '4k monitor', description: '27" ips panel, 60 hz, usb-c power delivery', price: '$429' },
  { id: 'p8', title: 'ultrawide monitor', description: '34" curved, 144 hz, 3440x1440', price: '$649' },
  { id: 'p9', title: 'usb-c hub', description: '7-in-1, dual hdmi, gigabit ethernet, sd reader', price: '$45' },
  { id: 'p10', title: 'usb-c cable', description: 'thunderbolt 4, 1m, 240w power delivery', price: '$25' },
  { id: 'p11', title: 'webcam', description: '1080p, autofocus, dual microphone array', price: '$89' },
  { id: 'p12', title: 'desk microphone', description: 'cardioid usb-c, with arm and pop filter', price: '$139' },
  { id: 'p13', title: 'over-ear headphones', description: 'closed-back, planar magnetic, balanced cable', price: '$299' },
  { id: 'p14', title: 'in-ear monitors', description: 'triple driver, detachable mmcx, foam tips', price: '$159' },
  { id: 'p15', title: 'desk lamp', description: 'wide bar, cri 95, color temperature control', price: '$119' },
  { id: 'p16', title: 'monitor arm', description: 'gas-spring, vesa 75/100, cable management', price: '$89' },
  { id: 'p17', title: 'standing desk', description: 'electric, dual motor, 70x140 cm', price: '$549' },
  { id: 'p18', title: 'leather mousepad', description: 'large 90x40 cm, hand-stitched edges', price: '$69' },
  { id: 'p19', title: 'mouse wrist rest', description: 'memory foam, ergonomic curve, anti-slip base', price: '$25' },
  { id: 'p20', title: 'cable tray', description: 'under-desk, no-drill, holds power strip', price: '$35' }
]

/** case-insensitive substring search returning a paginated slice */
export function searchProducts (query: string, page: number) {
  const needle = query.trim().toLowerCase()
  const filtered = needle.length === 0
    ? products
    : products.filter(p => p.title.includes(needle) || p.description.includes(needle))

  const start = page * PAGE_SIZE
  const slice = filtered.slice(start, start + PAGE_SIZE)
  const hasMore = start + slice.length < filtered.length

  return { slice, hasMore, total: filtered.length }
}
