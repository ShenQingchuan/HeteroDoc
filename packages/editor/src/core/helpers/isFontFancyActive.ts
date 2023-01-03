import type { Mark } from 'prosemirror-model'
import type { EditorState } from 'prosemirror-state'
import type { FontFancyAttrs, MarkRange } from '../../types'
import { getMarkType } from './getMarkType'

const getFancyAttrsFromMark = (mark: Mark): FontFancyAttrs | null => {
  const { colorIndex = 0, bgColorIndex = 0 } = mark.attrs
  if (!colorIndex && !bgColorIndex) {
    return null
  }
  return { colorIndex, bgColorIndex }
}

export function isFontFancyActive(state: EditorState): FontFancyAttrs | null {
  const { empty, ranges } = state.selection
  const type = getMarkType('fontFancy', state.schema)

  if (empty) {
    const foundFontFancyMark = (state.storedMarks || state.selection.$from.marks())
      .find((mark) => {
        return type.name === mark.type.name
      })
    if (foundFontFancyMark) {
      return getFancyAttrsFromMark(foundFontFancyMark)
    }
  }

  let selectionRange = 0
  const markRanges: MarkRange[] = []

  ranges.forEach(({ $from, $to }) => {
    const from = $from.pos
    const to = $to.pos

    state.doc.nodesBetween(from, to, (node, pos) => {
      if (!node.isText && !node.marks.length)
        return

      const relativeFrom = Math.max(from, pos)
      const relativeTo = Math.min(to, pos + node.nodeSize)
      const range = relativeTo - relativeFrom

      selectionRange += range

      markRanges.push(...node.marks.map(mark => ({
        mark,
        from: relativeFrom,
        to: relativeTo,
      })))
    })
  })

  if (selectionRange === 0)
    return null

  // calculate range of matched mark
  const matchedRangeCount = markRanges
    .filter(markRange => type.name === markRange.mark.type.name)
    .reduce((sum, markRange) => sum + markRange.to - markRange.from, 0)

  // calculate range of marks that excludes the searched mark
  // for example `code` doesn’t allow any other marks
  const excludedRangeCount = markRanges
    .filter(markRange => markRange.mark.type !== type && markRange.mark.type.excludes(type))
    .reduce((sum, markRange) => sum + markRange.to - markRange.from, 0)

  // we only include the result of `excludedRange` if there is a match at all
  const range = matchedRangeCount > 0
    ? matchedRangeCount + excludedRangeCount
    : matchedRangeCount

  if (range >= selectionRange) {
    const foundFontFancyMarks = markRanges
      .filter(markRange => type.name === markRange.mark.type.name)
      .map(markRange => markRange.mark)

    // if there are multiple marks, check if they are all the same
    // if they are, return the attrs of the first one,
    // otherwise return null
    if (foundFontFancyMarks.length > 1) {
      const firstMark = foundFontFancyMarks[0]!
      const isAllSame = foundFontFancyMarks.every(mark => mark.eq(firstMark))
      if (isAllSame) {
        return getFancyAttrsFromMark(firstMark)
      }
    }
    else if (foundFontFancyMarks.length === 1) {
      return getFancyAttrsFromMark(foundFontFancyMarks[0]!)
    }
  }

  return null
}
