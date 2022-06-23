import type { InputRule } from 'prosemirror-inputrules'
import type { Schema, SchemaSpec } from 'prosemirror-model'
import { markInputRule, markPasteRule } from '../core/rule'
import type { PasteRule } from '../core/rule'
import type { IEditorExtension } from './editorExtension'

const boldStyleRegExp = /bold(er)?|[5-9]0{2}/
const starInputRegex = /(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))$/
const starPasteRegex = /(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))/g

export class BoldExtension implements IEditorExtension {
  name = 'bold'
  schema: Schema
  options = {}

  constructor(schema: Schema) {
    this.schema = schema
  }

  schemaSpec: () => Partial<SchemaSpec<any, 'bold'>> = () => {
    return {
      marks: {
        bold: {
          content: 'text*',
          group: 'inline',
          parseDOM: [
            { tag: 'strong' },
            { tag: 'b', getAttrs: node => (node as HTMLElement).style.fontWeight !== 'normal' && {} },
            { style: 'font-weight', getAttrs: value => boldStyleRegExp.test(value as string) && {} },
          ],
          toDOM: () => ['span', { style: 'font-weight: bold' }],
        },
      },
    }
  }

  inputRules: () => InputRule[] = () => [
    markInputRule(starInputRegex, this.schema.marks.bold),
  ]

  pasteRules: () => PasteRule[] = () => [
    markPasteRule(starPasteRegex, this.schema.marks.bold),
  ]
}
