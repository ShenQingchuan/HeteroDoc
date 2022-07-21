import type { EditorCore } from '../core'
import type { AddMarksSchema, Command, HyperlinkAttrs } from '../types'
import type { PatternRule } from '../core/rule'
import { markInputRule, markPasteRule } from '../core/rule'
import { ExtensionType } from './editorExtension'
import type { IEditorExtension } from './editorExtension'

const hyperlinkInputRegExp = /(?:^|\s)(?:\[)(?<text>(?:[^\[\]]+))(?:\]\()(?<url>(?:[^\(\)]+))(?:\))$/
const hyperlinkPasteRegExp = /(?:\[)(?<text>(?:[^\[\]]+))(?:\]\()(?<url>(?:[^\(\)]+))(?:\))/g
const getHyperlinkAttrsFromMarkdownFormat = (match: RegExpMatchArray) => {
  const text = match.groups?.text ?? ''
  const url = match.groups?.url ?? ''
  return { url, displayText: text }
}

interface HyperlinkCommandsDefs {
  toggleHyperlink: Command<HyperlinkAttrs>
}

declare global {
  interface Commands {
    toggleHyperlink: HyperlinkCommandsDefs['toggleHyperlink']
  }
}

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

  commands: () => HyperlinkCommandsDefs = () => {
    return {
      toggleHyperlink: ({ url, text }) => ({ commands }) => {
        return commands.toggleMark({
          typeOrName: this.name,
          attrs: { url, text },
          options: {
            extendEmptyMarkRange: true,
          },
        })
      },
    }
  }

  inputRules: () => PatternRule[] = () => {
    const type = this.core.schema.marks.hyperlink!
    return [
      markInputRule({
        find: hyperlinkInputRegExp,
        type,
        getAttributes: getHyperlinkAttrsFromMarkdownFormat,
      }),
    ]
  }

  pasteRules: () => PatternRule[] = () => {
    const type = this.core.schema.marks.hyperlink!
    return [
      markPasteRule({
        find: hyperlinkPasteRegExp,
        type,
        getAttributes: getHyperlinkAttrsFromMarkdownFormat,
      }),
    ]
  }
}
