import type { DOMOutputSpec } from 'prosemirror-model'
import type { EditorCore } from '../../core'
import type { PatternRule } from '../../core/rule'
import { markInputRule, markPasteRule } from '../../core/rule'
import type { AddMarksSchema, IEditorExtension, NoArgsCommand } from '../../types'
import { ExtensionType } from '../../types'
import { whiteSpaceDom } from '../../constants'

const inlineCodeInputRegex = /(?:^|\s)((?:`)(?<text>(?:[^`]+))(?:`))$/
const inlineCodePasteRegex = /(?:^|\s)((?:`)(?<text>(?:[^`]+))(?:`))/g
const codeDOM: DOMOutputSpec = [
  'code',
  { 'data-node-type': 'inline' },
  whiteSpaceDom,
  ['span', 0],
  whiteSpaceDom,
]

declare global {
  interface Commands {
    setCode: NoArgsCommand
    unsetCode: NoArgsCommand
    toggleCode: NoArgsCommand
  }
}

export class CodeExtension implements IEditorExtension {
  type = ExtensionType.mark
  name = 'code'
  options = {}

  constructor(public core: EditorCore) {}

  schemaSpec: () => AddMarksSchema<'code'> = () => {
    return {
      marks: {
        code: {
          parseDOM: [
            { tag: 'code' },
          ],
          toDOM: () => codeDOM,
        },
      },
    }
  }

  inputRules: () => PatternRule[] = () => {
    const type = this.core.schema.marks.code!
    return [
      markInputRule({ find: inlineCodeInputRegex, type }),
    ]
  }

  pasteRules: () => PatternRule[] = () => {
    const type = this.core.schema.marks.code!
    return [
      markPasteRule({ find: inlineCodePasteRegex, type }),
    ]
  }

  commands: () => Record<string, NoArgsCommand> = () => {
    return {
      setCode: () => ({ commands }) => {
        return commands.setMark({ typeOrName: this.name })
      },
      unsetCode: () => ({ commands }) => {
        return commands.unsetMark({ typeOrName: this.name })
      },
      toggleCode: () => ({ commands }) => {
        return commands.toggleMark({ typeOrName: this.name })
      },
    }
  }
}
