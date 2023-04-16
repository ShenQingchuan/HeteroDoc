export function debounce(
  fn: (...args: any[]) => any,
  wait: number,
  immediate?: boolean
) {
  let timeout: any
  return (...args: any[]) => {
    const later = () => {
      timeout = null
      if (!immediate) fn(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) fn(...args)
  }
}
