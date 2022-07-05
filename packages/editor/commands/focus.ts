import { resolveFocusPosition } from '../core/helpers/resolveFocusPosition'
import type { FocusPosition, OptionalArgsCommand } from '../types'
import { isTextSelection, isiOS } from '../utils/isSomewhat'

export interface FocusArgs {
  position?: FocusPosition
  options?: {
    scrollIntoView?: boolean
  }
}

declare global {
  interface Commands {
    focus: OptionalArgsCommand<FocusArgs>
  }
}

export const focus: Commands['focus'] = (args?: FocusArgs) => (
  { core, view, tr, dispatch },
) => {
  let options = { scrollIntoView: true }
  let position = null
  if (args) {
    const { position: posArg = null, options: optionsArg = {} } = args
    options = {
      ...options,
      ...optionsArg,
    }
    position = posArg
  }

  const delayedFocus = () => {
    // focus within `requestAnimationFrame` breaks focus on iOS
    // so we have to call this
    if (isiOS())
      (view.dom as HTMLElement).focus()

    // For React we have to focus asynchronously. Otherwise wild things happen.
    // see: https://github.com/ueberdosis/tiptap/issues/1520
    requestAnimationFrame(() => {
      if (!core.isDestroyed) {
        view.focus()

        if (options?.scrollIntoView)
          core.commands.scrollIntoView()
      }
    })
  }

  if ((view.hasFocus() && position === null) || position === false)
    return true

  // we don’t try to resolve a NodeSelection or CellSelection
  if (dispatch && position === null && !isTextSelection(view.state.selection)) {
    delayedFocus()
    return true
  }

  // pass through tr.doc instead of editor.state.doc
  // since transactions could change the editors state before this command has been run
  const selection = resolveFocusPosition(tr.doc, position) || view.state.selection
  const isSameSelection = view.state.selection.eq(selection)

  if (dispatch) {
    if (!isSameSelection)
      tr.setSelection(selection)

    // `tr.setSelection` resets the stored marks
    // so we’ll restore them if the selection is the same as before
    if (isSameSelection && tr.storedMarks)
      tr.setStoredMarks(tr.storedMarks)

    delayedFocus()
  }

  return true
}
