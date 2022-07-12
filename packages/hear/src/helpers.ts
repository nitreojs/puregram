export const splitPath = (path: string) => (
  path
    .replace(/\[([^[\]]*)]/g, '.$1.')
    .split('.')
    .filter(Boolean)
)

export const getObjectValue = (source: Record<string, any>, selectors: string[]): any => {
  let link = source

  for (const selector of selectors) {
    if (!link[selector]) {
      return
    }

    link = link[selector]
  }

  return link
}

export const unifyCondition = (condition: unknown) => {
  if (typeof condition === 'function') {
    return condition
  }

  if (condition instanceof RegExp) {
    return (text: string | undefined) => text ? condition.test(text) : false
  }

  if (Array.isArray(condition)) {
    const arrayConditions = condition.map(unifyCondition)

    return (value: string | undefined) => (
      Array.isArray(value)
        ? arrayConditions.every(cond => value.some(val => cond(val)))
        : arrayConditions.some(cond => cond(value))
    )
  }

  return (value: string | undefined) => value === condition
}
