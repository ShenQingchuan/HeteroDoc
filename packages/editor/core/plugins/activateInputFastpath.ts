import { Plugin } from 'prosemirror-state'
import type { EditorCore } from '../index'

export const activateInputFastPath = (core: EditorCore) => new Plugin({
  props: {
    handleKeyDown(_, event) {
      if (event.key === '/') {
        core.emit('activateInputFastPath')
      }
    },
  },
})
