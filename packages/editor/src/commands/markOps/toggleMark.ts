import { getMarkType } from '../..//helpers/getMarkType'
import { isMarkActive } from '../..//helpers/isMarkActive'
import type { MarkType } from 'prosemirror-model'
import type { Command, Commands } from '../../types'

declare module '@hetero/editor' {
  interface Commands {
    toggleMark: Command<{
      typeOrName: string | MarkType
      attrs?: Record<string, any>
      options?: {
        /** Removes the mark even across the current selection. Defaults to `false`. */
        extendEmptyMarkRange?: boolean
      }
    }>
  }
}

export const toggleMark: Commands['toggleMark'] =
  ({ typeOrName, attrs = {}, options = {} }) =>
  ({ commands, state }) => {
    const { extendEmptyMarkRange = false } = options
    const type = getMarkType(typeOrName, state.schema)
    const isActive = isMarkActive(state, type, attrs)

    if (isActive)
      return commands.unsetMark({
        typeOrName: type,
        options: { extendEmptyMarkRange },
      })

    return commands.setMark({ typeOrName: type, attrs })
  }
