import { Plugin, Selection } from 'prosemirror-state'

export const clickEditorDOMCloseSelection = () => {
  return new Plugin({
    props: {
      handleClick(view, pos) {
        // if the selection is a range while clicking on the editor dom
        // we need to close the selection range
        if (!view.state.selection.empty) {
          const { tr } = view.state
          tr.setSelection(Selection.near(tr.doc.resolve(pos), 1))
          view.dispatch(tr)
          return true
        }

        return false
      },
    },
  })
}
