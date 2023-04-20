import { EditorCore } from '../../core'
import { type Attrs, Node as ProsemirrorNode } from 'prosemirror-model'
import { setTextSelection } from 'prosemirror-utils'
import { getHoveredBlock } from '../../helpers/blockForHoverPos'
import type { Command, Commands } from '../../types'
import { EXTENSION_NAMES } from '../../constants'
import {  createBlockMetaAttr } from '../../utils/blockSchema'

export interface InsertBeforeOrAfterArgs {
  hoveredBlockElement: HTMLElement | undefined
}

declare module '@hetero/editor' {
  interface Commands {
    insertBefore: Command<InsertBeforeOrAfterArgs>
    insertAfter: Command<InsertBeforeOrAfterArgs>
  }
}

function createNodeForInserting(
  core: EditorCore,
  targetNode: ProsemirrorNode,
) {
  // Adopts the targetNode's attributes
  // but needs to override the blockify meta
  const newAttrs: Attrs = {
    ...targetNode.attrs,
    ...createBlockMetaAttr()
  }

  // If the targetNode is a list item, create a new list item
  if (targetNode.type.name === EXTENSION_NAMES.LIST_ITEM) {
    // We need to create a paragraph node inside the list item
    const paragraphNode = core.schema.nodes.paragraph!.create(newAttrs)
    return core.schema.nodes[EXTENSION_NAMES.LIST_ITEM]!.create(
      newAttrs,
      paragraphNode,
    )
  }

  // Return paragraph node by default
  return core.schema.nodes.paragraph!.create(newAttrs);
}

export const insertBefore: Commands['insertBefore'] =
  ({ hoveredBlockElement }) =>
  ({ core, tr, dispatch }) => {
    if (dispatch && hoveredBlockElement) {
      // find which block is the target pos in
      // and insert a new 'same-type' block item before it
      const { node, pos } = getHoveredBlock(
        core,
        hoveredBlockElement,
      )
      if (node) {
        const newNode = createNodeForInserting(core, node);
        tr.insert(pos, newNode)
        const newCursorPos = tr.mapping.map(pos) - newNode.nodeSize
        setTextSelection(newCursorPos)(tr)
      }
    }

    return true
  }

export const insertAfter: Commands['insertAfter'] =
  ({ hoveredBlockElement }) =>
  ({ core, tr, dispatch }) => {
    if (dispatch && hoveredBlockElement) {
      // find which block is the target pos in
      // and insert a new 'same-type' block item after it, maybe paragraph or something else
      const { node, pos } = getHoveredBlock(
        core,
        hoveredBlockElement,
      )
      if (node) {
        const newNode = createNodeForInserting(core, node)
        console.log('inserting pos: ', pos + node.nodeSize)
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
