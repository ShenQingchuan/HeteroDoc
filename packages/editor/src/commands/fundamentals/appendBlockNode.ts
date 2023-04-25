import { findParentNode, setTextSelection } from 'prosemirror-utils'
import { getNodeType } from '../../helpers/getNodeType'
import { createBlockMetaAttr } from '../../utils/blockSchema'
import { EXTENSION_NAMES, PARAGRAPH_SCHEMA_NODE_NAME } from '../../constants'
import { isList } from '../../helpers/isList'
import type { Node, NodeType } from 'prosemirror-model'
import type { Command, Commands } from '../../types'

declare module '@hetero/editor' {
  interface Commands {
    appendBlockNode: Command<{
      nameOrType: string | NodeType
      attrs?: Record<string, any>
    }>
  }
}

export const appendBlockNode: Commands['appendBlockNode'] =
  ({ nameOrType, attrs }) =>
  ({ core, tr, dispatch }) => {
    if (dispatch) {
      const type = getNodeType(nameOrType, core.schema)
      // Append a new block node after the current selection.
      // But we need to get the wrapper node of current selection first.
      const { $from } = tr.selection

      const parentParagraph = findParentNode(
        (node) => node.type.name === PARAGRAPH_SCHEMA_NODE_NAME
      )(tr.selection)
      const parentListItem = findParentNode(
        (node) => node.type.name === EXTENSION_NAMES.LIST_ITEM
      )(tr.selection)
      let appendPos = $from.pos
      // Select the wrapper node of current selection.
      // - If the current cursor is in a list item, we should select the list item.
      if (parentListItem) {
        const { pos } = parentListItem
        appendPos = pos + parentListItem.node.nodeSize
      }
      // - else, we should select the paragraph.
      else if (parentParagraph) {
        const { pos } = parentParagraph
        appendPos = pos + parentParagraph.node.nodeSize
      }

      const appendingNodeContent: Node[] = []
      if (isList(type, core)) {
        // If the appending node is a list, we should insert a list item node.
        const listItem = core.schema.nodes[EXTENSION_NAMES.LIST_ITEM]!.create(
          {
            ...createBlockMetaAttr(),
          },
          [
            // And then insert a paragraph node in the list item node.
            core.schema.nodes[PARAGRAPH_SCHEMA_NODE_NAME]!.create({
              ...createBlockMetaAttr(),
            }),
          ]
        )
        appendingNodeContent.push(listItem)
      }

      // Then we can insert the new block node after the wrapper node.
      const appendingNode = type.create(
        {
          ...createBlockMetaAttr(),
          ...attrs,
        },
        appendingNodeContent
      )
      tr.insert(appendPos, appendingNode)
      // Set the cursor to the new block node.
      setTextSelection(appendPos + 1)(tr)
    }

    return true
  }
