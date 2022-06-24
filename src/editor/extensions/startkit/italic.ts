import { markInputRule, markPasteRule } from '../../core/rule'
import type { PatternRule } from '../../core/rule'
import type { EditorCore } from '../../core'
import type { IEditorExtension } from '../editorExtension'
import type { AddMarksSchema } from '../../types'

const singleStarInputRegex = /(?:^|\s)((?:\*)((?:[^*]+))(?:\*))$/
const singleStarPasteRegex = /(?:^|\s)((?:\*)((?:[^*]+))(?:\*))/g
const singleUnderscoreInputRegex = /(?:^|\s)((?:_)((?:[^_]+))(?:_))$/
const singleUnderscorePasteRegex = /(?:^|\s)((?:_)((?:[^_]+))(?:_))/g

export class ItalicExtension implements IEditorExtension {
  name = 'bold'
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
    const type = this.core.schema.marks.italic
    return [
      markInputRule({ find: singleStarInputRegex, type }),
      markInputRule({ find: singleUnderscoreInputRegex, type }),
    ]
  }

  pasteRules: () => PatternRule[] = () => {
    const type = this.core.schema.marks.italic
    return [
      markPasteRule({ find: singleStarPasteRegex, type }),
      markPasteRule({ find: singleUnderscorePasteRegex, type }),
    ]
  }
}
