import type { Commands, NoArgsCommand } from '../../types'

declare module '@hetero/editor' {
  interface Commands {
    scrollIntoView: NoArgsCommand
  }
}

export const scrollIntoView: Commands['scrollIntoView'] =
  () =>
  ({ tr, dispatch }) => {
    if (dispatch) tr.scrollIntoView()

    return true
  }
