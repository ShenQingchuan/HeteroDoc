import type { EditorCore } from '../core'
import type { AddMarksSchema } from '../types'
import { ExtensionType } from './editorExtension'
import type { IEditorExtension } from './editorExtension'

export class HyperlinkExtension implements IEditorExtension {
  type = ExtensionType.node
  name = 'hyperlink'
  options = {}
  core: EditorCore

  constructor(core: EditorCore) {
    this.core = core
  }

  schemaSpec: () => AddMarksSchema<'hyperlink'> = () => {
    return {
      marks: {
        hyperlink: {
          inclusive: false,
          attrs: {
            url: { default: '' },
            displayText: { default: '' },
          },
          parseDOM: [
            {
              tag: 'a[href]',
              getAttrs(dom) {
                if (typeof dom === 'string')
                  return null
                const url = dom.getAttribute('href')
                const displayText = dom.textContent
                return { url, displayText }
              },
            },
          ],
          toDOM(mark) {
            const { url, displayText } = mark.attrs as { url: string; displayText: string }
            return ['a', { href: url, class: 'hyperlink' }, displayText]
          },
        },
      },
    }
  }
}
