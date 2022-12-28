import { debounce } from 'lodash'
import { Plugin } from 'prosemirror-state'
import { HETERO_BLOCK_NODE_DATA_TAG } from '../../constants'
import type { EditorCore } from '../index'

const isHeteroBlock = (node: EventTarget | null): node is HTMLElement => {
  return node instanceof HTMLElement
    && node.getAttribute(HETERO_BLOCK_NODE_DATA_TAG) === 'true'
}
const getClosetTopLevelBlockLeft = (node: HTMLElement): number => {
  const topBlock = node.closest(`.ProseMirror > [${HETERO_BLOCK_NODE_DATA_TAG}="true"]`) as HTMLElement
  const { left } = topBlock.getBoundingClientRect()
  return left
}

export const activateSideToolBtn = (core: EditorCore) => {
  const throttleShowBtn = debounce(
    (left: number, top: number, pos: number) => core.emit('activateSideToolBtn', { left, top, pos }),
    200,
    { leading: false },
  )

  return new Plugin({
    props: {
      // @ts-expect-error it seems that ProseMirror's type has an issue here
      handleDOMEvents: {
        mouseover(view, event) {
          const toElement = event.target as HTMLElement; const fromElement = event.relatedTarget as HTMLElement
          const isGoingIntoOneBlock = isHeteroBlock(event.target)
          const isLeavingFromOneBlock = isHeteroBlock(event.relatedTarget)

          if (isGoingIntoOneBlock) {
            if (isLeavingFromOneBlock) {
              if (fromElement.contains(toElement)) {
                // pass, execute underlaying logic to update y position
              }
              else if (toElement.contains(fromElement)) {
                // pass, leave from one block to its parent block
                // don't need to update y position
                return false
              }
            }
            const { y } = event.target.getBoundingClientRect()
            const x = getClosetTopLevelBlockLeft(toElement)
            const pos = view.posAtDOM(toElement, 0)
            throttleShowBtn(x, y, pos)
          }
          return false
        },
      },
    },
  })
}
