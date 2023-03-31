import type { NoArgsCommand } from '../../types'

declare global {
  interface Commands {
    selectAll: NoArgsCommand
  }
}

export const selectAll: Commands['selectAll'] =
  () =>
  ({ tr, commands }) => {
    return commands.setTextSelection({
      position: {
        from: 0,
        to: tr.doc.content.size,
      },
    })
  }
