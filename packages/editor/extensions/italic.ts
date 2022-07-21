import { markInputRule, markPasteRule } from '../core/rule'
import type { PatternRule } from '../core/rule'
import type { EditorCore } from '../core'
import type { AddMarksSchema, NoArgsCommand } from '../types'
import type { IEditorExtension } from './editorExtension'
import { ExtensionType } from './editorExtension'

const singleStarInputRegex = /(?:^|\s)((?:\*)(?<text>(?:[^*]+))(?:\*))$/
const singleStarPasteRegex = /(?:^|\s)((?:\*)(?<text>(?:[^*]+))(?:\*))/g
const singleUnderscoreInputRegex = /(?:^|\s)((?:_)(?<text>(?:[^_]+))(?:_))$/
const singleUnderscorePasteRegex = /(?:^|\s)((?:_)(?<text>(?:[^_]+))(?:_))/g

declare global {
  interface Commands {
    setItalic: NoArgsCommand
    unsetItalic: NoArgsCommand
    toggleItalic: NoArgsCommand
  }
}

export class ItalicExtension implements IEditorExtension {
  type = ExtensionType.mark
  name = 'italic'
  core: EditorCore
  options = {}

  constructor(core: EditorCore) {
    this.core = core
  }

  schemaSpec: () => AddMarksSchema<'italic'> = () => {
    return {
      marks: {
        italic: {
          parseDOM: [
            { tag: 'i' },
            { tag: 'em' },
            { style: 'font-style=italic' },
          ],
          toDOM: () => ['em', 0],
        },
      },
    }
  }

  inputRules: () => PatternRule[] = () => {
    const type = this.core.schema.marks.italic!
    return [
      markInputRule({ find: singleStarInputRegex, type }),
      markInputRule({ find: singleUnderscoreInputRegex, type }),
    ]
  }

  pasteRules: () => PatternRule[] = () => {
    const type = this.core.schema.marks.italic!
    return [
      markPasteRule({ find: singleStarPasteRegex, type }),
      markPasteRule({ find: singleUnderscorePasteRegex, type }),
    ]
  }

  commands: () => Record<string, NoArgsCommand> = () => {
    return {
      setItalic: () => ({ commands }) => {
        return commands.setMark({ typeOrName: this.name })
      },
      unsetItalic: () => ({ commands }) => {
        return commands.unsetMark({ typeOrName: this.name })
      },
      toggleItalic: () => ({ commands }) => {
        return commands.toggleMark({ typeOrName: this.name })
      },
    }
  }

  keymaps = () => {
    return {
      'Mod-i': () => this.core.commands.toggleItalic(),
    }
  }
}
