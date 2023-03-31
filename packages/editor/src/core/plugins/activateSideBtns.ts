import { Plugin } from 'prosemirror-state'
import { HETERO_BLOCK_NODE_DATA_TAG } from '../../constants'
import { isHeteroBlock } from '../../utils/isSomewhat'
import type { EditorCore } from '../index'

function getRectLeftForCloset(
  el: HTMLElement,
  selector: string
): [number, HTMLElement] | void {
  const closetTopBlockElement = el.closest(selector) as HTMLElement | null
  if (!closetTopBlockElement) {
    return
  }
  const { left } = closetTopBlockElement.getBoundingClientRect()
  return [left, closetTopBlockElement]
}

const getClosetTopLevelBlockLeft = (el: HTMLElement) => {
  return getRectLeftForCloset(
    el,
    `.ProseMirror > [${HETERO_BLOCK_NODE_DATA_TAG}="true"]`
  )
}
const getClosetBlockLeft = (el: HTMLElement) => {
  return getRectLeftForCloset(el, `[${HETERO_BLOCK_NODE_DATA_TAG}="true"]`)
}

export const activateSideBtns = (core: EditorCore) => {
  const showSideToolBtn = (
    left: number,
    pos: number,
    hoveredBlockElement: HTMLElement,
    topBlockElement: HTMLElement
  ) =>
    core.emit('activateSideBtns', {
      left,
      hoverCtx: { pos, hoveredBlockElement, topBlockElement },
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

    const closetBlock = getClosetBlockLeft(domAtCurrentCursorPos)
    const closetTopBlock = getClosetTopLevelBlockLeft(domAtCurrentCursorPos)
    if (closetBlock && closetTopBlock) {
      const [, hoveredBlockElement] = closetBlock
      const [currentRectX, topBlockElement] = closetTopBlock
      showSideToolBtn(
        currentRectX,
        currentCursorPos,
        hoveredBlockElement,
        topBlockElement
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
            const closetBlock = getClosetBlockLeft(toElement)
            const closetTopBlock = getClosetTopLevelBlockLeft(toElement)
            if (!closetBlock || !closetTopBlock) {
              return false
            }
            const [, blockElement] = closetBlock
            const [topBlockX, topBlockElement] = closetTopBlock
            const blockRect = blockElement.getBoundingClientRect()
            const posAtTopBlockCoords = view.posAtCoords({
              left: blockRect.left,
              top: blockRect.top,
            })
            if (!posAtTopBlockCoords) {
              return false
            }
            const { pos } = posAtTopBlockCoords

            // why we need topblockX? because we want the side tool btn constantly stick to the same vertical position
            // and use the toElement's y position as the vertical position
            showSideToolBtn(topBlockX, pos, toElement, topBlockElement)
          }
          return false
        },
      },
    },
  })
}
