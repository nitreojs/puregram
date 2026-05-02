// snake → camel by default; this map renames ergonomic outliers (e.g. `message_id` → `id`
// so `update.id` matches what users reach for)
const FIELD_NAME_OVERRIDES: Record<string, string> = {
  message_id: 'id'
}

export function getterNameFor (snakeField: string) {
  return FIELD_NAME_OVERRIDES[snakeField] ?? camelCase(snakeField)
}

export function camelCase (snake: string) {
  return snake.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}
