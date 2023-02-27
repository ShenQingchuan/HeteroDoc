import type { DOMOutputSpec } from 'prosemirror-model'
import { markInputRule, markPasteRule } from '../../core/rule'
import type { PatternRule } from '../../core/rule'
import type { EditorCore } from '../../core'
import type { AddMarksSchema, IEditorMark, NoArgsCommand } from '../../types'

import { ExtensionType } from '../../types'
import { EXTENSION_NAMES } from '../../constants'

const boldStyleRegExp = /^(bold(er)?|[5-9]\d{2,})$/
const doubleStarInputRegex = /(?:^|\s)((?:\*\*)(?<text>(?:[^*]+))(?:\*\*))$/
const doubleStarPasteRegex = /(?:^|\s)((?:\*\*)(?<text>(?:[^*]+))(?:\*\*))/g
const doubleUnderscoreInputRegex = /(?:^|\s)((?:__)(?<text>(?:[^_]+))(?:__))$/
const doubleUnderscorePasteRegex = /(?:^|\s)((?:__)(?<text>(?:[^_]+))(?:__))/g
const boldDOM: DOMOutputSpec = ['strong', 0]

declare global {
  interface Commands {
    setBold: NoArgsCommand
    unsetBold: NoArgsCommand
    toggleBold: NoArgsCommand
  }
}

export class BoldExtension implements IEditorMark {
  type = ExtensionType.mark
  name = EXTENSION_NAMES.BOLD
  options = {}

  constructor(public core: EditorCore) {}

  schemaSpec: () => AddMarksSchema<EXTENSION_NAMES.BOLD> = () => {
    return {
      marks: {
        [EXTENSION_NAMES.BOLD]: {
          parseDOM: [
            { tag: 'strong' },
            { tag: 'b', getAttrs: node => (node as HTMLElement).style.fontWeight !== 'normal' && null },
            { style: 'font-weight', getAttrs: value => boldStyleRegExp.test(value as string) && null },
          ],
          toDOM: () => boldDOM,
        },
      },
    }
  }

  inputRules: () => PatternRule[] = () => {
    const type = this.core.schema.marks.bold!
    return [
      markInputRule({ find: doubleStarInputRegex, type }),
      markInputRule({ find: doubleUnderscoreInputRegex, type }),
    ]
  }

  pasteRules: () => PatternRule[] = () => {
    const type = this.core.schema.marks.bold!
    return [
      markPasteRule({ find: doubleStarPasteRegex, type }),
      markPasteRule({ find: doubleUnderscorePasteRegex, type }),
    ]
  }

  commands: () => Record<string, NoArgsCommand> = () => {
    return {
      setBold: () => ({ commands }) => {
        return commands.setMark({ typeOrName: this.name })
      },
      unsetBold: () => ({ commands }) => {
        return commands.unsetMark({ typeOrName: this.name })
      },
      toggleBold: () => ({ commands }) => {
        return commands.toggleMark({ typeOrName: this.name })
      },
    }
  }

  keymaps = () => {
    return {
      'Mod-b': () => this.core.commands.toggleBold(),
    }
  }
}
