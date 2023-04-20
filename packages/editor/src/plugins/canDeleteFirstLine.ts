import { Plugin } from 'prosemirror-state'

export const canDeleteFirstLine = () => {
  return new Plugin({
    props: {
      handleKeyDown(view, event) {
        const isBackspaceKeydown = event.key === 'Backspace'
        const isFirstLineEmpty = view.state.doc.child(0).textContent === ''
        const isMoreThanOneLine = view.state.doc.childCount > 1
        const isSelectionAtDocStart = view.state.selection.from === 1
        const isSelectionEmpty = view.state.selection.empty

        if (
          isBackspaceKeydown &&
          isFirstLineEmpty &&
          isMoreThanOneLine &&
          isSelectionAtDocStart &&
          isSelectionEmpty
        ) {
          event.preventDefault()
          const tr = view.state.tr.delete(0, view.state.doc.child(0).nodeSize)
          view.dispatch(tr)
          return true
        }
        return false
      },
    },
  })
}
