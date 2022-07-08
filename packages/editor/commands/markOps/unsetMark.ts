import type { MarkType } from 'prosemirror-model'
import { getMarkRange } from '../../core/helpers/getMarkRange'
import { getMarkType } from '../../core/helpers/getMarkType'
import type { Command } from '../../types'

declare global {
  interface Commands {
    unsetMark: Command<{
      typeOrName: string | MarkType
      options?: {
        /** Removes the mark even across the current selection. Defaults to `false`. */
        extendEmptyMarkRange?: boolean
      }
    }>
  }
}

export const unsetMark: Commands['unsetMark'] = ({ typeOrName, options = {} }) => ({ state, tr, dispatch }) => {
  const { extendEmptyMarkRange = false } = options
  const { selection } = tr
  const type = getMarkType(typeOrName, state.schema)
  const { $from, empty, ranges } = selection

  if (!dispatch)
    return true

  if (empty && extendEmptyMarkRange) {
    let { from, to } = selection
    const attrs = $from.marks().find(mark => mark.type === type)?.attrs
    const range = getMarkRange($from, type, attrs)

    if (range) {
      from = range.from
      to = range.to
    }

    tr.removeMark(from, to, type)
  }
  else {
    ranges.forEach((range) => {
      tr.removeMark(range.$from.pos, range.$to.pos, type)
    })
  }

  tr.removeStoredMark(type)

  return true
}
