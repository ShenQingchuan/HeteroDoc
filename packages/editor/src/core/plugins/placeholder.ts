import { Decoration, DecorationSet } from 'prosemirror-view'
import { Plugin } from 'prosemirror-state'
import type { EditorCore } from '../index'

export default function placeholderPlugin(core: EditorCore) {
  return new Plugin({
    props: {
      decorations(state) {
        const doc = state.doc

        if (doc.childCount > 1
          || !doc.firstChild?.isTextblock
          || doc.firstChild?.content.size > 0)
          return

        const placeHolder = document.createElement('div')
        placeHolder.classList.add('placeholder')
        placeHolder.textContent = core.i18nTr('editor.placeholder')

        return DecorationSet.create(doc, [Decoration.widget(1, placeHolder)])
      },
    },
  })
}
