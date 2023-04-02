import { getMarkAttrs } from '../../core/helpers/getMarkAttrs'
import { getMarkType } from '../../core/helpers/getMarkType'
import type { MarkType } from 'prosemirror-model'
import type { Command, Commands } from '../../types'

declare module '@hetero/editor' {
  interface Commands {
    setMark: Command<{
      typeOrName: string | MarkType
      attrs?: Record<string, any>
    }>
  }
}
export const setMark: Commands['setMark'] =
  ({ typeOrName, attrs = {} }) =>
  ({ tr, state, dispatch }) => {
    const { selection } = tr
    const { empty, ranges } = selection
    const type = getMarkType(typeOrName, state.schema)

    if (dispatch) {
      if (empty) {
        const oldAttributes = getMarkAttrs(state, type)

        tr.addStoredMark(
          type.create({
            ...oldAttributes,
            ...attrs,
          })
        )
      } else {
        ranges.forEach((range) => {
          const from = range.$from.pos
          const to = range.$to.pos

          state.doc.nodesBetween(from, to, (node, pos) => {
            const trimmedFrom = Math.max(pos, from)
            const trimmedTo = Math.min(pos + node.nodeSize, to)
            const someHasMark = node.marks.find((mark) => mark.type === type)

            // if there is already a mark of this type
            // we know that we have to merge its attributes
            // otherwise we add a fresh new mark
            if (someHasMark) {
              node.marks.forEach((mark) => {
                if (type === mark.type) {
                  tr.addMark(
                    trimmedFrom,
                    trimmedTo,
                    type.create({
                      ...mark.attrs,
                      ...attrs,
                    })
                  )
                }
              })
            } else {
              tr.addMark(trimmedFrom, trimmedTo, type.create(attrs))
            }
          })
        })
      }
    }

    return true
  }
