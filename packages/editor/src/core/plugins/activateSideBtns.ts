import { Plugin } from 'prosemirror-state'
import {
  HETERO_BLOCK_NODE_DATA_TAG,
  HETERO_BLOCK_NODE_TYPE_DATA_BULLET_LIST,
  HETERO_BLOCK_NODE_TYPE_DATA_ORDERED_LIST,
} from '../../constants'
import { isHeteroBlock } from '../../utils/isSomewhat'
import type { EditorCore } from '../index'

const getClosetBlockRect = (el: HTMLElement) => {
  const closetBlockElement = el.closest<HTMLElement>(
    `[${HETERO_BLOCK_NODE_DATA_TAG}]`
  )
  if (!closetBlockElement) {
    return
  }

  let { left, width } = closetBlockElement.getBoundingClientRect()

  // Special handler for list item,
  // because list item has a marker which would take some width space of this line
  const closetListContainerElement = el.closest<HTMLElement>(
    `[${HETERO_BLOCK_NODE_DATA_TAG}="${HETERO_BLOCK_NODE_TYPE_DATA_BULLET_LIST}"],` +
      `[${HETERO_BLOCK_NODE_DATA_TAG}="${HETERO_BLOCK_NODE_TYPE_DATA_ORDERED_LIST}"]`
  )
  if (closetListContainerElement) {
    left = closetListContainerElement.getBoundingClientRect().left
    width = closetListContainerElement.getBoundingClientRect().width
  }

  return [left, width, closetBlockElement] as const
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
    const domAtPrevCursorPos = core.view.domAtPos(prevCursor).node
    const currentCursorPos = tr.selection.from
    const domAtCurrentCursorPos = core.view.domAtPos(currentCursorPos).node
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

    const closetBlock = getClosetBlockRect(domAtCurrentCursorPos)
    if (closetBlock) {
      const [hoveredBlockLeft, hoveredBlockWidth, hoveredBlockElement] =
        closetBlock
      showSideToolBtn(
        hoveredBlockLeft,
        hoveredBlockWidth,
        currentCursorPos,
        hoveredBlockElement
      )
    }
  })

  return new Plugin({
    props: {
      handleDOMEvents: {
        mouseover(view, event) {
          const toElement = event.target as HTMLElement
          const fromElement = event.relatedTarget as HTMLElement
          const isGoingIntoOneBlock = isHeteroBlock(event.target)
          const isLeavingFromOneBlock = isHeteroBlock(event.relatedTarget)

          if (isGoingIntoOneBlock) {
            if (isLeavingFromOneBlock) {
              if (fromElement.contains(toElement)) {
                // pass, execute underlaying logic to update y position
              } else if (toElement.contains(fromElement)) {
                // pass, leave from one block to its parent block
                // don't need to update y position
                return false
              }
            }
            const closetBlock = getClosetBlockRect(toElement)
            if (!closetBlock) {
              return false
            }
            const [blockLeft, blockWidth, blockElement] = closetBlock
            const pos = view.posAtDOM(blockElement, 0)
            if (pos === undefined) {
              return false
            }
            showSideToolBtn(blockLeft, blockWidth, pos, toElement)
          }
          return false
        },
      },
    },
  })
}
