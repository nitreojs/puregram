// names a wrapper-class getter (or update-class getter) gets when emitted from a schema
// field. snake-case schema field names default to camelCase; the override map below picks
// a friendlier name for ergonomic outliers (e.g. `message_id` → `id` so `update.id`
// matches what users intuitively reach for)
const FIELD_NAME_OVERRIDES: Record<string, string> = {
  message_id: 'id'
}

export function getterNameFor (snakeField: string) {
  return FIELD_NAME_OVERRIDES[snakeField] ?? camelCase(snakeField)
}

export function camelCase (snake: string) {
  return snake.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}
