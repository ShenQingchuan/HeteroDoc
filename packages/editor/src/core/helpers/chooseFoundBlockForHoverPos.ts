import type { Node } from 'prosemirror-model'
import type { Transaction } from 'prosemirror-state'
import type { ContentNodeWithPos } from 'prosemirror-utils'
import { findParentNodeClosestToPos } from 'prosemirror-utils'

// Let's create a new concept called "BlockTree-able" node
// which means it can contain other blocks.
// if user wants to insert before the first child block of a "BlockTree-able" node,
// we should insert the new block before the "BlockTree-able" node,
// because user is already able to insert another child block using 'Enter'.
// The same is true for backward inserts
export const isBlockTreeAble = (node: Node) => {
  return node.type.spec.content?.includes('block+') ?? false
}

export const chooseFoundBlockForHoverPos = (tr: Transaction, hoverPos: number, returnJudge: (
  foundBlockTreeAble: ContentNodeWithPos | undefined,
  foundTextBlock: ContentNodeWithPos | undefined,
) => ContentNodeWithPos | undefined) => {
  const resolvedPos = tr.doc.resolve(hoverPos)
  const foundBlockTreeAble = findParentNodeClosestToPos(resolvedPos, node => isBlockTreeAble(node))
  const foundTextBlock = findParentNodeClosestToPos(resolvedPos, node => node.type.isTextblock)

  return returnJudge(foundBlockTreeAble, foundTextBlock)
}
