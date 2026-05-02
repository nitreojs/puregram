export interface NamespacedStorageView {
  [name: string]: unknown
}

export interface StorageViewWithRegister extends NamespacedStorageView {
  register: (name: string, handle: unknown) => void
}

export function createNamespacedStorageView () {
  const view: Record<string, unknown> = {}

  Object.defineProperty(view, 'register', {
    value: (name: string, handle: unknown) => {
      view[name] = handle
    },
    enumerable: false,
    configurable: false,
    writable: false
  })

  return view as StorageViewWithRegister
}
