import { liftTarget } from 'prosemirror-transform'
import type { Commands, NoArgsCommand } from '../../types'

declare module '@hetero/editor' {
  interface Commands {
    clearNodes: NoArgsCommand
  }
}

export const clearNodes: Commands['clearNodes'] =
  () =>
  ({ state, tr, dispatch }) => {
    const { selection } = tr
    const { ranges } = selection

    if (!dispatch) return true

    ranges.forEach(({ $from, $to }) => {
      state.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
        if (node.type.isText) return

        const { doc, mapping } = tr
        const $mappedFrom = doc.resolve(mapping.map(pos))
        const $mappedTo = doc.resolve(mapping.map(pos + node.nodeSize))
        const nodeRange = $mappedFrom.blockRange($mappedTo)

        if (!nodeRange) return

        const targetLiftDepth = liftTarget(nodeRange)

        if (node.type.isTextblock) {
          const { defaultType } = $mappedFrom.parent.contentMatchAt(
            $mappedFrom.index()
          )

          tr.setNodeMarkup(nodeRange.start, defaultType)
        }

        if (targetLiftDepth || targetLiftDepth === 0)
          tr.lift(nodeRange, targetLiftDepth)
      })
    })

    return true
  }
