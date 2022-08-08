import { Plugin } from 'prosemirror-state'
import type { Mark } from 'prosemirror-model'
import type { EditorState } from 'prosemirror-state'

function getMarksInSelectionOfState(state: EditorState) {
  const { from, to } = state.selection
  let marksCollect: readonly Mark[] = []
  state.doc.nodesBetween(
    from, to,
    node => node.marks.forEach((mark) => {
      marksCollect = mark.addToSet(marksCollect)
    }),
  )
  return marksCollect
}

export const pluginResetStoredMarksOnDeleted = new Plugin({
  appendTransaction(_, prevState, currentState) {
    const newTr = currentState.tr
    const currentStoredMarks = currentState.storedMarks
    if (currentStoredMarks?.length === 0) {
      return
    }

    const prevMarks = getMarksInSelectionOfState(prevState)
    const currentMarks = getMarksInSelectionOfState(currentState)
    const currentStoredMarksSameInPrev
      = currentStoredMarks?.filter(
        curStoredMark => prevMarks.includes(curStoredMark),
      ) ?? []

    if (
      currentStoredMarksSameInPrev.length > 0
      && currentMarks.every(curMark => !prevMarks.includes(curMark))
    ) {
      currentStoredMarksSameInPrev.forEach(
        staleMark => newTr.removeStoredMark(staleMark),
      )
    }

    return newTr
  },
})
