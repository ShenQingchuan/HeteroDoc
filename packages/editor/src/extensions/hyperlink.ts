import { Plugin, PluginKey } from 'prosemirror-state'
import { markInputRule, markPasteRule } from '../core/rule'
import { getMarksBetween } from '../core/helpers/getMarksBetween'
import { getMarkRange } from '../core/helpers/getMarkRange'
import { ExtensionType } from '../types'
import { EXTENSION_NAMES } from '../constants'
import type { PatternRule } from '../core/rule'
import type {
  AddMarksSchema,
  Command,
  IEditorExtension,
  NoArgsCommand,
} from '../types'
import type { EditorCore } from '../core'

const hyperlinkInputRegExp = /(?:^|\s)\[(?<text>[^[\]]+)]\((?<url>[^()]+)\)$/
const hyperlinkPasteRegExp = /\[(?<text>[^[\]]+)]\((?<url>[^()]+)\)/g
const getHyperlinkAttrsFromMarkdownFormat = (match: RegExpMatchArray) => {
  const text = match.groups?.text ?? ''
  const url = match.groups?.url ?? ''
  return { url, displayText: text }
}

export interface HyperlinkAttrs {
  url: string
}

interface HyperlinkCommandsDefs {
  updateHyperlink: Command<{
    current: HyperlinkAttrs
    prev: HyperlinkAttrs
    linkText: string
  }>
  unsetHyperlink: NoArgsCommand
  toggleHyperlink: Command<HyperlinkAttrs>
}

declare module '@hetero/editor' {
  interface Commands {
    updateHyperlink: HyperlinkCommandsDefs['updateHyperlink']
    unsetHyperlink: HyperlinkCommandsDefs['unsetHyperlink']
    toggleHyperlink: HyperlinkCommandsDefs['toggleHyperlink']
  }
}

interface HyperlinkOptions {
  onTriggerEditPopover: (
    pos: { left: number; top: number },
    attrs: HyperlinkAttrs,
    linkText: string
  ) => void
  onCloseEditPopover: () => void
}

export class HyperlinkExtension implements IEditorExtension<HyperlinkOptions> {
  type = ExtensionType.mark
  name = EXTENSION_NAMES.HYPERLINK
  options: HyperlinkOptions

  constructor(public core: EditorCore, options: HyperlinkOptions) {
    this.options = options
  }

  schemaSpec: () => AddMarksSchema<EXTENSION_NAMES.HYPERLINK> = () => {
    return {
      marks: {
        [EXTENSION_NAMES.HYPERLINK]: {
          inclusive: false,
          attrs: {
            url: { default: '' },
            displayText: { default: '' },
          },
          parseDOM: [
            {
              tag: 'a[href]',
              getAttrs(el) {
                if (typeof el === 'string') return null
                const url = el.getAttribute('href')
                const displayText = el.textContent
                return { url, displayText }
              },
            },
          ],
          toDOM(mark) {
            const { url = '' } = mark.attrs as HyperlinkAttrs
            return ['a', { class: EXTENSION_NAMES.HYPERLINK, href: url }, 0]
          },
        },
      },
    }
  }

  commands: () => HyperlinkCommandsDefs = () => {
    return {
      updateHyperlink:
        ({ current, prev, linkText }) =>
        ({ core, view, tr, dispatch }) => {
          if (dispatch) {
            const newHyperlinkMark =
              core.schema.marks.hyperlink!.create(current)
            const { from, to, empty } = view.state.selection
            const newCurrentMarks = newHyperlinkMark.addToSet(
              getMarksBetween(from, to, view.state.doc).map((m) => m.mark)
            )
            if (empty) {
              const resolvedPos = view.state.doc.resolve(from)
              const markRange = getMarkRange(
                resolvedPos,
                core.schema.marks.hyperlink!,
                prev
              )
              if (markRange) {
                const { from, to } = markRange
                tr.replaceRangeWith(
                  from,
                  to,
                  core.schema.text(linkText, newCurrentMarks)
                )
              } else {
                tr.insert(from, core.schema.text(linkText, newCurrentMarks))
              }
            } else {
              tr.replaceRangeWith(
                from,
                to,
                core.schema.text(linkText, newCurrentMarks)
              )
            }
          }
          return true
        },
      unsetHyperlink:
        () =>
        ({ commands }) => {
          return commands.unsetMark({ typeOrName: this.name })
        },
      toggleHyperlink:
        ({ url }) =>
        ({ commands }) => {
          return commands.toggleMark({
            typeOrName: this.name,
            attrs: { url },
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

  getProseMirrorPlugin: () => Plugin[] = () => {
    const { onTriggerEditPopover, onCloseEditPopover } = this.options
    return [
      new Plugin({
        key: new PluginKey('hyperlinkUIEventsHandler'),
        props: {
          handleClick(view, pos, event) {
            const { doc } = view.state
            const currentNode = doc.nodeAt(pos)
            if (!currentNode) {
              return true
            }
            const linkAttrs = currentNode.marks.find(
              (m) => m.type.name === 'hyperlink'
            )?.attrs
            if (linkAttrs) {
              const { left, top } = (
                event.target as HTMLElement
              ).getBoundingClientRect()
              const { url = '' } = linkAttrs
              onTriggerEditPopover(
                { left, top },
                { url },
                currentNode.text ?? ''
              )
            } else {
              onCloseEditPopover()
            }
            return false
          },
        },
      }),
    ]
  }
}
