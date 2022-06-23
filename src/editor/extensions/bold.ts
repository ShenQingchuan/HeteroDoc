import type { SchemaSpec } from 'prosemirror-model'
import { markInputRule, markPasteRule } from '../core/rule'
import type { PatternRule } from '../core/rule'
import type { EditorCore } from '../core'
import type { IEditorExtension } from './editorExtension'

const boldStyleRegExp = /^(bold(er)?|[5-9]\d{2,})$/
const starInputRegex = /(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))$/
const starPasteRegex = /(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))/g
const underscoreInputRegex = /(?:^|\s)((?:__)((?:[^__]+))(?:__))$/
const underscorePasteRegex = /(?:^|\s)((?:__)((?:[^__]+))(?:__))/g

export class BoldExtension implements IEditorExtension {
  name = 'bold'
  core: EditorCore
  options = {}

  constructor(core: EditorCore) {
    this.core = core
  }

  schemaSpec: () => Partial<SchemaSpec<any, 'bold'>> = () => {
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
      markInputRule({ find: starInputRegex, type }),
      markInputRule({ find: underscoreInputRegex, type }),
    ]
  }

  pasteRules: () => PatternRule[] = () => {
    const type = this.core.schema.marks.bold
    return [
      markPasteRule({ find: starPasteRegex, type }),
      markPasteRule({ find: underscorePasteRegex, type }),
    ]
  }
}
