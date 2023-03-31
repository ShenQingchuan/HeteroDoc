import { Selection } from 'prosemirror-state'
import type { NoArgsCommand } from '../../types'

declare global {
  interface Commands {
    supportRemoveFirstLine: NoArgsCommand
  }
}

export const supportRemoveFirstLine: Commands['supportRemoveFirstLine'] =
  () =>
  ({ commands }) =>
    commands.command({
      fn: ({ tr }) => {
        const { selection, doc } = tr
        const { empty, $anchor } = selection
        const { pos, parent } = $anchor
        const isAtStart = Selection.atStart(doc).from === pos

        if (
          !empty ||
          !isAtStart ||
          !parent.type.isTextblock ||
          parent.textContent.length > 0
        )
          return false

        return commands.clearNodes()
      },
    })
