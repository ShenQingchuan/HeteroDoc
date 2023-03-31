import type { EditorState, Transaction } from 'prosemirror-state'
import type { InputFastpathOptions } from '../types'

export interface EditorCoreEvent {
  rendered: { timeCost: number }
  changeTheme: { theme: 'light' | 'dark' }
  beforeDispatchTransaction: { tr: Transaction }
  dispatchedTransaction: null
  selectionChange: { tr: Transaction; prevState: EditorState }
  activateInputFastPath: {
    left: number
    top: number
    options: InputFastpathOptions
  }
  deactivateInputFastPath: { isContentChanged: boolean }
  activateSideBtns: {
    left: number
    hoverCtx: {
      pos: number
      hoveredBlockElement: HTMLElement
      topBlockElement: HTMLElement
    }
  }
  fastpathActionKey: { event: KeyboardEvent }
  updateCodeBlock: {
    codeBlockDOM: HTMLElement
    langName: string
    alias?: string
  }
  /** Start drag block node, and we need handle the 'mouseover' event to make hovered blocks show a highlight border, in order to indicate the dropable position */
  dragBlock: { hoverNodePos: number; hoverBlockRect: DOMRect }
  /** Mouse will move over block elements on dragging  */
  dragMoving: {
    hoverElement: HTMLElement
    x: number
    y: number
    isAppend?: boolean
  }
  /** End of block node dragging. on this event handling, we need to move the dragged node to its target position  */
  dropBlock: { dropPos: number; isAppend: boolean }

  /** Toggle on the search UI view */
  toggleSearchView: { state: 'on' | 'off' }
  search: { pattern: string; caseSensitive?: boolean; isRegExp?: boolean }
}
