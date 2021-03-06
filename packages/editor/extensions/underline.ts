import type { DOMOutputSpec } from 'prosemirror-model'
import type { EditorCore } from '../core'
import type { AddMarksSchema, NoArgsCommand } from '../types'
import { ExtensionType } from './editorExtension'
import type { IEditorExtension } from './editorExtension'

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
  name = 'underline'
  core: EditorCore
  options = {}

  constructor(core: EditorCore) {
    this.core = core
  }

  schemaSpec: () => AddMarksSchema<'underline'> = () => {
    return {
      marks: {
        underline: {
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
