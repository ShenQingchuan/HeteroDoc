import { markInputRule, markPasteRule } from '../core/rule'
import type { PatternRule } from '../core/rule'
import type { EditorCore } from '../core'
import type { AddMarksSchema, Command } from '../types'
import type { IEditorMark } from './editorExtension'
import { ExtensionType } from './editorExtension'

const boldStyleRegExp = /^(bold(er)?|[5-9]\d{2,})$/
const doubleStarInputRegex = /(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))$/
const doubleStarPasteRegex = /(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))/g
const doubleUnderscoreInputRegex = /(?:^|\s)((?:__)((?:[^__]+))(?:__))$/
const doubleUnderscorePasteRegex = /(?:^|\s)((?:__)((?:[^__]+))(?:__))/g

declare global {
  interface Commands {
    setBold: Command<{}>
    unsetBold: Command<{}>
    toggleBold: Command<{}>
  }
}

export class BoldExtension implements IEditorMark {
  type = ExtensionType.mark
  name = 'bold'
  core: EditorCore
  options = {}

  constructor(core: EditorCore) {
    this.core = core
  }

  schemaSpec: () => AddMarksSchema<'bold'> = () => {
    return {
      marks: {
        bold: {
          parseDOM: [
            { tag: 'strong' },
            { tag: 'b', getAttrs: node => (node as HTMLElement).style.fontWeight !== 'normal' && null },
            { style: 'font-weight', getAttrs: value => boldStyleRegExp.test(value as string) && null },
          ],
          toDOM: () => ['strong', 0],
        },
      },
    }
  }

  inputRules: () => PatternRule[] = () => {
    const type = this.core.schema.marks.bold
    return [
      markInputRule({ find: doubleStarInputRegex, type }),
      markInputRule({ find: doubleUnderscoreInputRegex, type }),
    ]
  }

  pasteRules: () => PatternRule[] = () => {
    const type = this.core.schema.marks.bold
    return [
      markPasteRule({ find: doubleStarPasteRegex, type }),
      markPasteRule({ find: doubleUnderscorePasteRegex, type }),
    ]
  }

  commands: () => Record<string, Command> = () => {
    return {
      setBold: () => ({ core }) => {
        return core.commands.setMark({ typeOrName: this.name })
      },
      unsetBold: () => ({ core }) => {
        return core.commands.unsetMark({ typeOrName: this.name })
      },
      toggleBold: () => ({ core }) => {
        return core.commands.toggleMark({ typeOrName: this.name })
      },
    }
  }
}
