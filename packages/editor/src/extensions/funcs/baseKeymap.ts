import { EXTENSION_NAMES } from '../../constants'
import { ExtensionType } from '../../types'
import type { EditorCore } from '../../core'
import type { IEditorExtension } from '../../types'

export class BaseKeymap implements IEditorExtension {
  type = ExtensionType.func
  name = EXTENSION_NAMES.UNDERLINE
  options = {}

  constructor(public core: EditorCore) {}

  keymaps = () => {
    const handleBackspace = () =>
      this.core.commands.first({
        commands: ({ commands }) => [
          () => commands.undoInputRule(),
          () => commands.removeEmptyCodeBlock(),
          () => commands.supportRemoveFirstLine(),
          () => commands.deleteSelection(),
          () => commands.joinBackward(),
          () => commands.selectNodeBackward(),
        ],
      })
    const handleDelete = () =>
      this.core.commands.first({
        commands: ({ commands }) => [
          () => commands.deleteSelection(),
          () => commands.joinForward(),
          () => commands.selectNodeForward(),
        ],
      })
    const handleEnter = () =>
      this.core.commands.first({
        commands: ({ commands }) => [
          () => commands.newlineInCode(),
          () => commands.createParagraphNear(),
          () => commands.liftEmptyBlock(),
          () => commands.splitBlock(),
        ],
      })
    const baseKeymap = {
      Enter: handleEnter,
      'Mod-Enter': () =>
        this.core.commands.first({
          commands: ({ commands }) => [() => commands.exitCode()],
        }),
      Backspace: handleBackspace,
      'Mod-Backspace': handleBackspace,
      'Shift-Backspace': handleBackspace,
      Delete: handleDelete,
      'Mod-Delete': handleDelete,
      'Mod-a': () => this.core.commands.selectAll(),
    }

    return baseKeymap
  }
}
