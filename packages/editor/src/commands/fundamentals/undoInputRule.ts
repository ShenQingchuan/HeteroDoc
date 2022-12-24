import type { NoArgsCommand } from '../../types'

declare global {
  interface Commands {
    undoInputRule: NoArgsCommand
  }
}

export const undoInputRule: Commands['undoInputRule'] = () => ({ state, dispatch }) => {
  const plugins = state.plugins

  for (const plugin of plugins) {
    const isInputRules: boolean = Reflect.get(plugin.spec, 'isInputRules')
    let undoable: any

    if (isInputRules && plugin.getState(state)) {
      undoable = plugin.getState(state)
      if (dispatch) {
        const { tr } = state
        const toUndo = undoable.transform

        for (let j = toUndo.steps.length - 1; j >= 0; j -= 1)
          tr.step(toUndo.steps[j].invert(toUndo.docs[j]))

        if (undoable.text) {
          const marks = tr.doc.resolve(undoable.from).marks()

          tr.replaceWith(undoable.from, undoable.to, state.schema.text(undoable.text, marks))
        }
        else {
          tr.delete(undoable.from, undoable.to)
        }
      }
      return true
    }
  }

  return false
}
