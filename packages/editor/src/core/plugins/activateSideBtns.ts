import { Plugin, TextSelection } from 'prosemirror-state'
import { findParentDomRef } from 'prosemirror-utils'
import {
  EXTENSION_NAMES,
  HETERO_BLOCK_NODE_DATA_TAG,
} from '../../constants'
import { isHeteroBlock } from '../../utils/isSomewhat'
import type { EditorCore } from '../index'
import { getClosetTarget } from '../helpers/blockForHoverPos'

/**
 * @returns {boolean} true if the event is handled
 */
const isSpecialHandledMouseOverForActivateSideBtns = (
  event: MouseEvent
): boolean => {
  const toElement = event.target
  const fromElement = event.relatedTarget
  const isGoingIntoOneBlock = isHeteroBlock(event.target)
  const isLeavingFromOneBlock = isHeteroBlock(event.relatedTarget)
  if (
    toElement instanceof HTMLElement &&
    fromElement instanceof HTMLElement &&
    isGoingIntoOneBlock &&
    isLeavingFromOneBlock &&
    toElement.contains(fromElement)
  ) {
    // pass, leave from one block to its parent block
    // don't need to update y position
    return true
  }

  if (
    toElement instanceof HTMLElement &&
    fromElement instanceof HTMLElement &&
    fromElement.closest(
      `[${HETERO_BLOCK_NODE_DATA_TAG}="${EXTENSION_NAMES.LIST_ITEM}"]`
    ) &&
    toElement.contains(fromElement)
  ) {
    // pass, leave from one sub-list item to its parent list item
    // don't need to update y position
    return true
  }

  return false
}

export const activateSideBtns = (core: EditorCore) => {
  const showSideToolBtn = (
    left: number,
    width: number,
    pos: number,
    hoveredBlockElement: HTMLElement
  ) =>
    core.emit('activateSideBtns', {
      left,
      width,
      hoverCtx: { pos, hoveredBlockElement },
    })

  core.on('selectionChange', ({ tr, prevState }) => {
    const prevCursor = prevState.selection.from
    const domAtPrevCursorPos = findParentDomRef(
      (node) => node.isBlock,
      core.view.domAtPos.bind(core.view)
    )(TextSelection.create(prevState.doc, prevCursor))
    const currentCursorPos = tr.selection.from
    const domAtCurrentCursorPos = findParentDomRef(
      (node) => node.isBlock,
      core.view.domAtPos.bind(core.view)
    )(TextSelection.create(core.view.state.doc, currentCursorPos))
    if (
      !(domAtPrevCursorPos instanceof HTMLElement) ||
      !(domAtCurrentCursorPos instanceof HTMLElement)
    ) {
      return
    }

    // Skip when moving selection cursor in the same line
    const currentRect = domAtCurrentCursorPos.getBoundingClientRect()
    const prevRect = domAtPrevCursorPos.getBoundingClientRect()
    if (prevRect.y === currentRect.y) {
      return
    }

    const closetBlock = getClosetTarget(domAtCurrentCursorPos)
    if (!closetBlock) {
      return
    }
    const [hoveredBlockLeft, hoveredBlockWidth, hoveredBlockElement] =
      closetBlock
    showSideToolBtn(
      hoveredBlockLeft,
      hoveredBlockWidth,
      currentCursorPos,
      hoveredBlockElement
    )
  })

  return new Plugin({
    props: {
      handleDOMEvents: {
        mouseover: (view, event) => {
          const toElement = event.target as HTMLElement
          if (isSpecialHandledMouseOverForActivateSideBtns(event)) {
            return false
          }
          const closetTarget = getClosetTarget(toElement)
          if (!closetTarget) {
            return false
          }
          const [targetLeft, targetWidth, targetElement] = closetTarget
          const pos = view.posAtDOM(targetElement, 0)
          if (pos === undefined) {
            return false
          }
          showSideToolBtn(targetLeft, targetWidth, pos, targetElement)
          return false
        },
      },
    },
  })
}
