import { HETERO_BLOCK_NODE_DATA_TAG, EXTENSION_NAMES, HETERODOC_LIST_ITEM_CONTENT_CLASS_NAME } from '../../constants'
import { getLogger } from '../../utils/logger'
import { EditorCore } from '../index'

const logger = getLogger('blockForHoverPos')

export const getClosetTarget = (el: HTMLElement) => {
  let closetTargetElement = el.closest<HTMLElement>(
    `[${HETERO_BLOCK_NODE_DATA_TAG}]`
  )
  if (!closetTargetElement) {
    return
  }
  let { left, width } = closetTargetElement.getBoundingClientRect()

  // Special handlers, because some wrapper element would take some width space before this line width
  // 1. handler for blockquote
  const closetBlockquoteContainerElement = el.closest<HTMLElement>(
    `[${HETERO_BLOCK_NODE_DATA_TAG}="${EXTENSION_NAMES.BLOCK_QUOTE}"]`
  )
  if (closetBlockquoteContainerElement) {
    left = closetBlockquoteContainerElement.getBoundingClientRect().x
    width = closetBlockquoteContainerElement.getBoundingClientRect().width
    closetTargetElement = closetBlockquoteContainerElement
    return [left, width, closetTargetElement] as const
  }

  // 2. handler for list item
  const closetListItemElement = el.closest<HTMLElement>(
    `[${HETERO_BLOCK_NODE_DATA_TAG}="${EXTENSION_NAMES.LIST_ITEM}"]`
  )
  // if the current closet target is the first child of the list item,
  // then we need to use the list item's left and width
  // else, we use the child's left and width
  if (closetListItemElement) {
    const listItemContent = closetListItemElement.querySelector<HTMLElement>(
      `.${HETERODOC_LIST_ITEM_CONTENT_CLASS_NAME}`
    )
    const isClosetToListItemContentFirstChild =
      listItemContent?.firstChild?.contains(closetTargetElement)
    if (isClosetToListItemContentFirstChild) {
      left = closetListItemElement.getBoundingClientRect().x
      width = closetListItemElement.getBoundingClientRect().width
      return [left, width, closetListItemElement] as const
    }
  }

  return [left, width, closetTargetElement] as const
}

export const getHoveredBlock = (
  core: EditorCore,
  hoveredBlockElement: HTMLElement,
) => {
  const resolvedPos = core.view.state.doc.resolve(
    core.view.posAtDOM(hoveredBlockElement, 0)
  )
  logger.debug("[getHoveredBlock] resolvedPos", resolvedPos)
  const result = {
    pos: resolvedPos.before(resolvedPos.depth),
    node: resolvedPos.parent,
  }
  logger.debug("[getHoveredBlock] result", result)
  return result
}
