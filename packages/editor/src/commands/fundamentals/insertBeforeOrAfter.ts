import type { Node } from 'prosemirror-model'
import type { Transaction } from 'prosemirror-state'
import { findParentNodeClosestToPos, setTextSelection } from 'prosemirror-utils'
import type { Command } from '../../types'

export interface InsertBeforeOrAfterArgs {
  pos: number
}

declare global {
  interface Commands {
    insertBefore: Command<InsertBeforeOrAfterArgs>
    insertAfter: Command<InsertBeforeOrAfterArgs>
  }
}

// Let's create a new concept called "BlockTree-able" node
// which means it can contain other blocks.
// if user wants to insert before the first child block of a "BlockTree-able" node,
// we should insert the new block before the "BlockTree-able" node,
// because user is already able to insert another child block using 'Enter'.
// The same is true for backward inserts
export const isBlockTreeAble = (node: Node) => {
  return node.type.spec.content?.includes('block+') ?? false
}

const chooseFoundBlock = (tr: Transaction, pos: number, actionType: 'insertBefore' | 'insertAfter') => {
  const resolvedPos = tr.doc.resolve(pos)
  const foundBlockTreeAble = findParentNodeClosestToPos(resolvedPos, node => isBlockTreeAble(node))
  const foundTextBlock = findParentNodeClosestToPos(resolvedPos, node => node.type.isTextblock)

  if (foundBlockTreeAble && foundTextBlock) {
    // if the found text block is the first child of the found block tree able node,
    // we should choose the found block tree able node to return
    const { pos: blockTreeAblePos } = foundBlockTreeAble
    const { pos: textBlockPos } = foundTextBlock
    return actionType === 'insertBefore'
      ? blockTreeAblePos + 1 === textBlockPos
        ? foundBlockTreeAble
        : foundTextBlock
      : blockTreeAblePos + foundBlockTreeAble.node.nodeSize - 1 - foundTextBlock.node.nodeSize === textBlockPos
        ? foundBlockTreeAble
        : foundTextBlock
  }

  return foundTextBlock
}

export const insertBefore: Commands['insertBefore'] = ({ pos }) => (
  { core, tr, dispatch },
) => {
  if (dispatch) {
    // find which block is current selection in
    // and insert a new paragraph before it
    const choosedFoundBlock = chooseFoundBlock(tr, pos, 'insertBefore')
    if (choosedFoundBlock) {
      const { pos } = choosedFoundBlock
      tr.insert(pos, core.schema.nodes.paragraph!.create())
      setTextSelection(pos)(tr)
    }
  }

  return true
}

export const insertAfter: Commands['insertAfter'] = ({ pos }) => (
  { core, tr, dispatch },
) => {
  if (dispatch) {
    // find which block is current selection in
    // and insert a new paragraph after it
    const choosedFoundBlock = chooseFoundBlock(tr, pos, 'insertAfter')
    if (choosedFoundBlock) {
      const { pos, node } = choosedFoundBlock
      const newParagraph = core.schema.nodes.paragraph!.create()
      tr.insert(pos + node.nodeSize, newParagraph)
      setTextSelection(pos + node.nodeSize)(tr)
    }
  }

  return true
}
