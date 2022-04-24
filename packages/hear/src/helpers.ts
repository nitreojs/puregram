export const splitPath = (path: string) => (
  path
    .replace(/\[([^[\]]*)]/g, '.$1.')
    .split('.')
    .filter(Boolean)
)

export const getObjectValue = (source: Record<string, any>, selectors: string[]): any => {
  let link: Record<string, any> = source

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
    return (text: string | undefined): boolean => (
      condition.test(text!)
    )
  }

  if (Array.isArray(condition)) {
    const arrayConditions: Function[] = condition.map(unifyCondition)

    return (value: string | undefined): boolean => (
      Array.isArray(value)
        ? arrayConditions.every(
          (cond: Function): boolean => (
            value.some(
              (val): boolean => cond(val)
            )
          )
        )
        : arrayConditions.some(
          (cond: Function): boolean => cond(value)
        )
    )
  }

  return (value: string | undefined): boolean => value === condition
}
