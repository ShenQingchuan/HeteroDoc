import { TextSelection } from 'prosemirror-state'

export function isClass(value: any): boolean {
  if (value.constructor?.toString().substring(0, 5) !== 'class')
    return false

  return true
}
export function isObject(value: any): boolean {
  return (
    value
    && typeof value === 'object'
    && !Array.isArray(value)
    && !isClass(value)
  )
}
// see: https://github.com/mesqueeb/is-what/blob/88d6e4ca92fb2baab6003c54e02eedf4e729e5ab/src/index.ts
function getType(value: any): string {
  return Object.prototype.toString.call(value).slice(8, -1)
}
export function isPlainObject(value: any): value is Record<string, any> {
  if (getType(value) !== 'Object')
    return false

  return value.constructor === Object && Object.getPrototypeOf(value) === Object.prototype
}
export function isString(value: any): value is string {
  return typeof value === 'string'
}
export function isEmptyObject(value = {}): boolean {
  return Object.keys(value).length === 0 && value.constructor === Object
}
export function isRegExp(value: any): value is RegExp {
  return Object.prototype.toString.call(value) === '[object RegExp]'
}
export function isNumber(value: any): value is number {
  return typeof value === 'number'
}
export function isiOS(): boolean {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod',
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
}
export function isTextSelection(value: unknown): value is TextSelection {
  return isObject(value) && value instanceof TextSelection
}

