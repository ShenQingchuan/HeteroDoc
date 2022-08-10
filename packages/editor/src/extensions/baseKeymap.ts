import { Selection } from 'prosemirror-state'
import type { EditorCore } from '../core'
import type { IEditorExtension } from './editorExtension'
import { ExtensionType } from './editorExtension'

export class BaseKeymap implements IEditorExtension {
  type = ExtensionType.func
  name = 'baseKeymap'
  options = {}

  constructor(public core: EditorCore) {}

  keymaps = () => {
    const handleBackspace = () => this.core.commands.first({
      commands: ({ commands }) => [
        () => commands.undoInputRule(),
        () => commands.command({
          fn: ({ tr }) => {
            const { selection, doc } = tr
            const { empty, $anchor } = selection
            const { pos, parent } = $anchor
            const isAtStart = Selection.atStart(doc).from === pos

            if (!empty || !isAtStart || !parent.type.isTextblock || parent.textContent.length)
              return false

            return commands.clearNodes()
          },
        }),
        () => commands.deleteSelection(),
        () => commands.joinBackward(),
        () => commands.selectNodeBackward(),
      ],
    })
    const handleDelete = () => this.core.commands.first({
      commands: ({ commands }) => [
        () => commands.deleteSelection(),
        () => commands.joinForward(),
        () => commands.selectNodeForward(),
      ],
    })
    const handleEnter = () => this.core.commands.first({
      commands: ({ commands }) => [
        () => commands.newlineInCode(),
        () => commands.createParagraphNear(),
        () => commands.liftEmptyBlock(),
        () => commands.splitBlock(),
      ],
    })
    const baseKeymap = {
      'Enter': handleEnter,
      'Mod-Enter': () => this.core.commands.exitCode(),
      'Backspace': handleBackspace,
      'Mod-Backspace': handleBackspace,
      'Shift-Backspace': handleBackspace,
      'Delete': handleDelete,
      'Mod-Delete': handleDelete,
      'Mod-a': () => this.core.commands.selectAll(),
    }

    return baseKeymap
  }
}
