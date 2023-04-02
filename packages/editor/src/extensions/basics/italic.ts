import { markInputRule, markPasteRule } from '../../core/rule'
import { ExtensionType } from '../../types'
import { EXTENSION_NAMES } from '../../constants'
import type { PatternRule } from '../../core/rule'
import type { EditorCore } from '../../core'
import type {
  AddMarksSchema,
  IEditorExtension,
  NoArgsCommand,
} from '../../types'

const singleStarInputRegex = /(?:^|\s)(\*(?<text>[^*]+)\*)$/
const singleStarPasteRegex = /(?:^|\s)(\*(?<text>[^*]+)\*)/g
const singleUnderscoreInputRegex = /(?:^|\s)(_(?<text>[^_]+)_)$/
const singleUnderscorePasteRegex = /(?:^|\s)(_(?<text>[^_]+)_)/g

declare module '@hetero/editor' {
  interface Commands {
    setItalic: NoArgsCommand
    unsetItalic: NoArgsCommand
    toggleItalic: NoArgsCommand
  }
}

export class ItalicExtension implements IEditorExtension {
  type = ExtensionType.mark
  name = EXTENSION_NAMES.ITALIC
  options = {}

  constructor(public core: EditorCore) {}

  schemaSpec: () => AddMarksSchema<EXTENSION_NAMES.ITALIC> = () => {
    return {
      marks: {
        [EXTENSION_NAMES.ITALIC]: {
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
      setItalic:
        () =>
        ({ commands }) => {
          return commands.setMark({ typeOrName: this.name })
        },
      unsetItalic:
        () =>
        ({ commands }) => {
          return commands.unsetMark({ typeOrName: this.name })
        },
      toggleItalic:
        () =>
        ({ commands }) => {
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
