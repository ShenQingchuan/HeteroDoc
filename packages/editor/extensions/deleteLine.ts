import type { DOMOutputSpec } from 'prosemirror-model'
import type { EditorCore } from '../core'
import type { AddMarksSchema, NoArgsCommand } from '../types'
import type { PatternRule } from '../core/rule'
import { markInputRule, markPasteRule } from '../core/rule'
import { ExtensionType } from './editorExtension'
import type { IEditorExtension } from './editorExtension'

const deleteLineDOM: DOMOutputSpec = ['del', 0]
const deleteLineInputRegex = /(?:^|\s)((?:~)(?<text>(?:[^~]+))(?:~))$/
const deleteLinePasteRegex = /(?:^|\s)((?:~)(?<text>(?:[^~]+))(?:~))/g

declare global {
  interface Commands {
    setDeleteLine: NoArgsCommand
    unsetDeleteLine: NoArgsCommand
    toggleDeleteLine: NoArgsCommand
  }
}

export class DeleteLineExtension implements IEditorExtension {
  type = ExtensionType.mark
  name = 'deleteLine'
  core: EditorCore
  options = {}

  constructor(core: EditorCore) {
    this.core = core
  }

  schemaSpec: () => AddMarksSchema<'deleteLine'> = () => {
    return {
      marks: {
        deleteLine: {
          parseDOM: [
            { tag: 'del' },
            {
              style: 'text-decoration',
              getAttrs: value => (value as string).includes('line-through') && null,
            },
          ],
          toDOM: () => deleteLineDOM,
        },
      },
    }
  }

  commands: () => Record<string, NoArgsCommand> = () => {
    return {
      setDeleteLine: () => ({ commands }) => {
        return commands.setMark({ typeOrName: this.name })
      },
      unsetDeleteLine: () => ({ commands }) => {
        return commands.unsetMark({ typeOrName: this.name })
      },
      toggleDeleteLine: () => ({ commands }) => {
        return commands.toggleMark({ typeOrName: this.name })
      },
    }
  }

  inputRules: () => PatternRule[] = () => {
    const type = this.core.schema.marks.deleteLine!
    return [
      markInputRule({ find: deleteLineInputRegex, type }),
    ]
  }

  pasteRules: () => PatternRule[] = () => {
    const type = this.core.schema.marks.deleteLine!
    return [
      markPasteRule({ find: deleteLinePasteRegex, type }),
    ]
  }

  keymaps = () => {
    return {
      'Mod-Shift-s': () => this.core.commands.toggleDeleteLine(),
    }
  }
}
