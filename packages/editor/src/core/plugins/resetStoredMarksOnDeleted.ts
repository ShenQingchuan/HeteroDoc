import { Plugin } from 'prosemirror-state'
import type { Mark } from 'prosemirror-model'
import type { EditorState } from 'prosemirror-state'
import { ReplaceStep } from 'prosemirror-transform'

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

export const pluginResetStoredMarksOnDeleted = () => new Plugin({
  appendTransaction(trs, prevState, currentState) {
    const newTr = currentState.tr
    const currentStoredMarks = currentState.storedMarks
    if (currentStoredMarks?.length === 0) {
      return
    }

    if (prevState.selection.empty) {
      const curTr = trs[0]
      if (!curTr) {
        return
      }
      for (const step of curTr.steps) {
        if (
          step instanceof ReplaceStep
          && step.to === prevState.selection.from
          && step.slice.content.size === 0 // this means a deleting trasaction
          && currentStoredMarks?.some(
            curStoredMark => curTr.storedMarks?.includes(curStoredMark),
          )
        ) {
          currentStoredMarks.filter(
            curStoredMark => curTr.storedMarks?.includes(curStoredMark),
          ).forEach(staleMark => newTr.removeStoredMark(staleMark))
          return newTr
        }
      }
    }
    else {
      const prevSelectionMarks = getMarksInSelectionOfState(prevState)
      const currentSelectionMarks = getMarksInSelectionOfState(currentState)
      const currentStoredMarksSameInPrev
        = currentStoredMarks?.filter(
          curStoredMark => prevSelectionMarks.includes(curStoredMark),
        ) ?? []
      const isCurrentStoredMarksNodesDeleted
        = currentStoredMarksSameInPrev.length > 0
          && currentSelectionMarks.every(curMark => !prevSelectionMarks.includes(curMark))
      if (isCurrentStoredMarksNodesDeleted) {
        currentStoredMarksSameInPrev.forEach(
          staleMark => newTr.removeStoredMark(staleMark),
        )
        return newTr
      }
    }
  },
})
