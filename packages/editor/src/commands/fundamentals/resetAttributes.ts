import { getMarkType } from '../../helpers/getMarkType'
import { getNodeType } from '../../helpers/getNodeType'
import { getSchemaTypeNameByName } from '../../helpers/getSchemaTypeNameByName'
import { deleteProps } from '../../utils/deleteProps'
import type { Command, Commands } from '../../types'
import type { MarkType, NodeType } from 'prosemirror-model'

declare module '@hetero/editor' {
  interface Commands {
    resetAttributes: Command<{
      typeOrName: string | NodeType | MarkType
      attrs: string | string[]
    }>
  }
}

export const resetAttributes: Commands['resetAttributes'] =
  ({ typeOrName, attrs }) =>
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
        state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
          if (nodeType && nodeType === node.type) {
            tr.setNodeMarkup(pos, undefined, deleteProps(node.attrs, attrs))
          }

          if (markType && node.marks.length > 0) {
            node.marks.forEach((mark) => {
              if (markType === mark.type) {
                tr.addMark(
                  pos,
                  pos + node.nodeSize,
                  markType.create(deleteProps(mark.attrs, attrs))
                )
              }
            })
          }
        })
      })
    }

    return true
  }
