import type { NoArgsCommand } from '../types'

declare global {
  interface Commands {
    scrollIntoView: NoArgsCommand
  }
}

export const scrollIntoView: Commands['scrollIntoView'] = () => ({ tr, dispatch }) => {
  if (dispatch)
    tr.scrollIntoView()

  return true
}
