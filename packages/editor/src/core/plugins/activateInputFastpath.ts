import type { Node } from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
import { findParentDomRef, findParentNode } from 'prosemirror-utils'
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
      handleKeyDown(view, event) {
        if (event.key === '/') {
          const { state } = view
          const { selection } = state
          const { empty } = selection
          const paragraphPredicate = (node: Node) => node.type.name === 'paragraph'
          const parentParagraph = findParentNode(paragraphPredicate)(selection)
          if (empty && parentParagraph?.node.textContent === '') {
            const paragraphDOM = findParentDomRef(
              paragraphPredicate, view.domAtPos.bind(view),
            )(selection)
            if (paragraphDOM instanceof HTMLElement) {
              const { left, top } = paragraphDOM.getBoundingClientRect()
              core.emit('activateInputFastPath', { left, top })
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
