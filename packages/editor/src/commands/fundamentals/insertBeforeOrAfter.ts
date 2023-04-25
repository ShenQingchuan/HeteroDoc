import { setTextSelection } from 'prosemirror-utils'
import { getHoveredBlock } from '../../helpers/blockForHoverPos'
import { EXTENSION_NAMES } from '../../constants'
import { createBlockMetaAttr } from '../../utils/blockSchema'
import type { Attrs, Node as ProsemirrorNode } from 'prosemirror-model'
import type { EditorCore } from '../../core'
import type { Command, Commands } from '../../types'

export interface InsertBeforeOrAfterArgs {
  targetBlockElement: HTMLElement | undefined
}

declare module '@hetero/editor' {
  interface Commands {
    insertLineBefore: Command<InsertBeforeOrAfterArgs>
    insertLineAfter: Command<InsertBeforeOrAfterArgs>
  }
}

function createNodeForInserting(core: EditorCore, targetNode: ProsemirrorNode) {
  // Adopts the targetNode's attributes
  // but needs to override the blockify meta
  const newAttrs: Attrs = {
    ...targetNode.attrs,
    ...createBlockMetaAttr(),
  }

  // If the targetNode is a list item, create a new list item
  if (targetNode.type.name === EXTENSION_NAMES.LIST_ITEM) {
    // We need to create a paragraph node inside the list item
    const paragraphNode = core.schema.nodes.paragraph!.create(newAttrs)
    return core.schema.nodes[EXTENSION_NAMES.LIST_ITEM]!.create(
      newAttrs,
      paragraphNode
    )
  }

  // Return paragraph node by default
  return core.schema.nodes.paragraph!.create(newAttrs)
}

export const insertLineBefore: Commands['insertLineBefore'] =
  ({ targetBlockElement }) =>
  ({ core, tr, dispatch }) => {
    if (dispatch && targetBlockElement) {
      // find which block is the target pos in
      // and insert a new 'same-type' block item before it
      const { node, pos } = getHoveredBlock(core, targetBlockElement)
      if (node) {
        const newNode = createNodeForInserting(core, node)
        tr.insert(pos, newNode)
        const newCursorPos = tr.mapping.map(pos) - newNode.nodeSize
        setTextSelection(newCursorPos)(tr)
      }
    }

    return true
  }

export const insertLineAfter: Commands['insertLineAfter'] =
  ({ targetBlockElement }) =>
  ({ core, tr, dispatch }) => {
    if (dispatch && targetBlockElement) {
      // find which block is the target pos in
      // and insert a new 'same-type' block item after it, maybe paragraph or something else
      const { node, pos } = getHoveredBlock(core, targetBlockElement)
      if (node) {
        const newNode = createNodeForInserting(core, node)
        tr.insert(pos + node.nodeSize, newNode)
        // Q: Why no need tr.mapping here?
        // A: Because insert something after the given pos,
        //    the given pos is actually the start pos of the inserted node
        const newCursorPos = pos + node.nodeSize
        setTextSelection(newCursorPos)(tr)
      }
    }

    return true
  }
