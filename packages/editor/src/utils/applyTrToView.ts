import type { Transaction } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'

export function applyTrToView(view: EditorView, applyTr: (tr: Transaction) => void) {
  const { state } = view
  const tr = state.tr
  applyTr(tr)
  view.dispatch(tr)
}
