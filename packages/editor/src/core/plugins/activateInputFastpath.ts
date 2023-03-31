import { Plugin } from 'prosemirror-state'
import { findParentDomRef, findParentNode } from 'prosemirror-utils'
import { EXTENSION_NAMES } from '../../constants'
import type { Node } from 'prosemirror-model'
import type { EditorCore } from '../index'

export const activateInputFastPath = (core: EditorCore) => {
  let isFastPathTriggered = false

  core.on('deactivateInputFastPath', ({ isContentChanged }) => {
    if (isContentChanged) {
      const { tr, selection } = core.view.state
      const { from, empty } = selection
      if (empty) {
        tr.delete(from - 1, from)
        // delete the '/'
        core.view.dispatch(tr)
      }
    }
  })

  return new Plugin({
    props: {
      handleDOMEvents: {
        keydown(view, event) {
          // leave arrow up/down/enter to view layer
          if (
            event.key === 'ArrowUp' ||
            event.key === 'ArrowDown' ||
            event.key === 'Enter'
          ) {
            core.emit('fastpathActionKey', { event })
          }
          return false // means didn't handle by this plugin
        },
      },
      handleKeyDown(view, event) {
        if (event.key === '/') {
          const { state } = view
          const { selection } = state
          const { empty } = selection
          const paragraphPredicate = (node: Node) =>
            node.type.name === EXTENSION_NAMES.PARAGRAPH
          const blockquotePredicate = (node: Node) =>
            node.type.name === EXTENSION_NAMES.BLOCK_QUOTE
          const parentParagraph = findParentNode(paragraphPredicate)(selection)
          if (empty && parentParagraph?.node.textContent === '') {
            const paragraphDOM = findParentDomRef(
              paragraphPredicate,
              view.domAtPos.bind(view)
            )(selection)
            const isInsideBlockquote =
              !!findParentNode(blockquotePredicate)(selection)
            if (paragraphDOM instanceof HTMLElement) {
              const { left, top } = paragraphDOM.getBoundingClientRect()
              core.emit('activateInputFastPath', {
                left,
                top,
                options: {
                  blockQuoteAvailable: !isInsideBlockquote,
                },
              })
              isFastPathTriggered = true
            }
          }
        }
        // other keys input
        else if (isFastPathTriggered) {
          core.emit('deactivateInputFastPath', { isContentChanged: false })
          isFastPathTriggered = false
        }
      },
    },
  })
}
