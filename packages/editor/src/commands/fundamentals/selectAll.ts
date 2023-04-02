import type { Commands, NoArgsCommand } from '../../types'

declare module '@hetero/editor' {
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
