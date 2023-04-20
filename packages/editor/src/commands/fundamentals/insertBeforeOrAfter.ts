import { setTextSelection } from 'prosemirror-utils'
import { chooseFoundBlockForHoverPos as chooseInsertTargetBlockForHoverPos } from '../..//helpers/chooseFoundBlockForHoverPos'
import type { ContentNodeWithPos } from 'prosemirror-utils'
import type { Command, Commands } from '../../types'

export interface InsertBeforeOrAfterArgs {
  pos: number
}

declare module '@hetero/editor' {
  interface Commands {
    insertBefore: Command<InsertBeforeOrAfterArgs>
    insertAfter: Command<InsertBeforeOrAfterArgs>
  }
}

const createInssertBeforeOrAfterJudge =
  (actionType: 'insertBefore' | 'insertAfter') =>
  (
    foundBlockTreeAble: ContentNodeWithPos | undefined,
    foundTextBlock: ContentNodeWithPos | undefined
  ) => {
    if (foundBlockTreeAble && foundTextBlock) {
      // if the found text block is the first child of the found BlockTree-able node,
      // we should choose the BlockTree-able node node to return
      const { pos: blockTreeAblePos } = foundBlockTreeAble
      const { pos: textBlockPos } = foundTextBlock
      return actionType === 'insertBefore'
        ? blockTreeAblePos + 1 === textBlockPos
          ? foundBlockTreeAble
          : foundTextBlock
        : blockTreeAblePos +
            foundBlockTreeAble.node.nodeSize -
            1 -
            foundTextBlock.node.nodeSize ===
          textBlockPos
        ? foundBlockTreeAble
        : foundTextBlock
    }

    return foundTextBlock
  }

export const insertBefore: Commands['insertBefore'] =
  ({ pos }) =>
  ({ core, tr, dispatch }) => {
    if (dispatch) {
      // find which block is the target pos in
      // and insert a new block item before it, maybe paragraph or something else
      const choosedFoundBlock = chooseInsertTargetBlockForHoverPos(
        tr,
        pos,
        createInssertBeforeOrAfterJudge('insertBefore')
      )
      if (choosedFoundBlock) {
        const { pos } = choosedFoundBlock
        tr.insert(pos, core.schema.nodes.paragraph!.create())
        setTextSelection(pos)(tr)
      }
    }

    return true
  }

export const insertAfter: Commands['insertAfter'] =
  ({ pos }) =>
  ({ core, tr, dispatch }) => {
    if (dispatch) {
      // find which block is the target pos in
      // and insert a new block item after it, maybe paragraph or something else
      const choosedFoundBlock = chooseInsertTargetBlockForHoverPos(
        tr,
        pos,
        createInssertBeforeOrAfterJudge('insertAfter')
      )
      if (choosedFoundBlock) {
        const { pos, node } = choosedFoundBlock
        const newParagraph = core.schema.nodes.paragraph!.create()
        tr.insert(pos + node.nodeSize, newParagraph)
        setTextSelection(pos + node.nodeSize)(tr)
      }
    }

    return true
  }
