export function omit<T extends object, K extends keyof T>(
  obj: T,
  ...props: K[]
): Omit<T, K> {
  const result: any = {}
  Object.keys(obj).forEach((key) => {
    if (!props.includes(key as K)) {
      result[key] = (obj as any)[key]
    }
  })
  return result
}
