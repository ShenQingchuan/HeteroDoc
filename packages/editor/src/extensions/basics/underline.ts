import type { DOMOutputSpec } from 'prosemirror-model'
import { EXTENSION_NAMES } from '../../constants'
import type { EditorCore } from '../../core'
import type { AddMarksSchema, IEditorExtension, NoArgsCommand } from '../../types'
import { ExtensionType } from '../../types'

const underlineDOM: DOMOutputSpec = ['u', 0]

declare global {
  interface Commands {
    setUnderline: NoArgsCommand
    unsetUnderline: NoArgsCommand
    toggleUnderline: NoArgsCommand
  }
}

export class UnderlineExtension implements IEditorExtension {
  type = ExtensionType.mark
  name = EXTENSION_NAMES.UNDERLINE
  options = {}

  constructor(public core: EditorCore) {}

  schemaSpec: () => AddMarksSchema<EXTENSION_NAMES.UNDERLINE> = () => {
    return {
      marks: {
        [EXTENSION_NAMES.UNDERLINE]: {
          parseDOM: [
            { tag: 'u' },
            {
              style: 'text-decoration',
              getAttrs: value => (value as string).includes('underline') && null,
            },
          ],
          toDOM: () => underlineDOM,
        },
      },
    }
  }

  commands: () => Record<string, NoArgsCommand> = () => {
    return {
      setUnderline: () => ({ commands }) => {
        return commands.setMark({ typeOrName: this.name })
      },
      unsetUnderline: () => ({ commands }) => {
        return commands.unsetMark({ typeOrName: this.name })
      },
      toggleUnderline: () => ({ commands }) => {
        return commands.toggleMark({ typeOrName: this.name })
      },
    }
  }

  keymaps = () => {
    return {
      'Mod-u': () => this.core.commands.toggleUnderline(),
    }
  }
}
