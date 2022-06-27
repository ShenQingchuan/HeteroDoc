import type { MarkType } from 'prosemirror-model'
import { getMarkType } from '../core/helpers/getMarkType'
import { isMarkActive } from '../core/helpers/isMarkActive'
import type { Command } from '../types'

declare global {
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

export const toggleMark: Commands['toggleMark'] = ({ typeOrName, attrs = {}, options = {} }) => ({ core, state }) => {
  const { extendEmptyMarkRange = false } = options
  const type = getMarkType(typeOrName, state.schema)
  const isActive = isMarkActive(state, type, attrs)

  if (isActive)
    return core.commands.unsetMark({ typeOrName: type, options: { extendEmptyMarkRange } })

  return core.commands.setMark({ typeOrName: type, attrs })
}
