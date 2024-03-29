import { getMarkType } from '../../helpers/getMarkType'
import { getNodeType } from '../../helpers/getNodeType'
import { getSchemaTypeNameByName } from '../../helpers/getSchemaTypeNameByName'
import type { MarkType, NodeType } from 'prosemirror-model'
import type { Command, Commands } from '../../types'

declare module '@hetero/editor' {
  interface Commands {
    updateAttributes: Command<{
      typeOrName: string | NodeType | MarkType
      attrs: Record<string, any>
    }>
  }
}

export const updateAttributes: Commands['updateAttributes'] =
  ({ typeOrName, attrs = {} }) =>
  ({ tr, state, dispatch }) => {
    let nodeType: NodeType | null = null
    let markType: MarkType | null = null
    const schemaType = getSchemaTypeNameByName(
      typeof typeOrName === 'string' ? typeOrName : typeOrName.name,
      state.schema
    )
    if (!schemaType) {
      return false
    }
    if (schemaType === 'node') {
      nodeType = getNodeType(typeOrName as NodeType, state.schema)
    }
    if (schemaType === 'mark') {
      markType = getMarkType(typeOrName as MarkType, state.schema)
    }
    if (dispatch) {
      tr.selection.ranges.forEach((range) => {
        const from = range.$from.pos
        const to = range.$to.pos

        state.doc.nodesBetween(from, to, (node, pos) => {
          if (nodeType && nodeType === node.type) {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              ...attrs,
            })
          }

          if (markType && node.marks.length > 0) {
            node.marks.forEach((mark) => {
              if (markType === mark.type) {
                const trimmedFrom = Math.max(pos, from)
                const trimmedTo = Math.min(pos + node.nodeSize, to)

                tr.addMark(
                  trimmedFrom,
                  trimmedTo,
                  markType.create({
                    ...mark.attrs,
                    ...attrs,
                  })
                )
              }
            })
          }
        })
      })
    }
    return true
  }
