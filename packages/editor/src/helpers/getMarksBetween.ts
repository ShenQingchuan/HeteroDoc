import { getMarkRange } from './getMarkRange'
import type { Node as ProseMirrorNode } from 'prosemirror-model'

import type { MarkRange } from '../types'

export function getMarksBetween(
  from: number,
  to: number,
  doc: ProseMirrorNode
): MarkRange[] {
  const marks: MarkRange[] = []

  // get all inclusive marks on empty selection
  if (from === to) {
    doc
      .resolve(from)
      .marks()
      .forEach((mark) => {
        const $pos = doc.resolve(from - 1)
        const range = getMarkRange($pos, mark.type)

        if (!range) return

        marks.push({
          mark,
          ...range,
        })
      })
  } else {
    doc.nodesBetween(from, to, (node, pos) => {
      marks.push(
        ...node.marks.map((mark) => ({
          from: pos,
          to: pos + node.nodeSize,
          mark,
        }))
      )
    })
  }

  return marks
}
