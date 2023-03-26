import type { Mark } from 'prosemirror-model'
import { Slice } from 'prosemirror-model'
import { Plugin, PluginKey } from 'prosemirror-state'
import { EXTENSION_NAMES } from '../constants'
import type { EditorCore } from '../core'
import type { AddMarksSchema, Command, IEditorExtension, NoArgsCommand } from '../types'
import { ExtensionType } from '../types'

interface FontColorCommandDefs {
  setFontColor: Command<{ colorIndex: number }>
  unsetFontColor: NoArgsCommand
  setFontBgColor: Command<{ bgColorIndex: number }>
  unsetFontBgColor: NoArgsCommand
}

declare global {
  interface Commands {
    setFontColor: FontColorCommandDefs['setFontColor']
    unsetFontColor: FontColorCommandDefs['unsetFontColor']
    setFontBgColor: FontColorCommandDefs['setFontBgColor']
    unsetFontBgColor: FontColorCommandDefs['unsetFontBgColor']
  }
}

export class FontFancyExtension implements IEditorExtension {
  type = ExtensionType.mark
  name = EXTENSION_NAMES.FONT_FANCY
  options = {}

  constructor(public core: EditorCore) {}

  schemaSpec: () => AddMarksSchema<EXTENSION_NAMES.FONT_FANCY> = () => {
    return {
      marks: {
        [EXTENSION_NAMES.FONT_FANCY]: {
          attrs: {
            colorIndex: {
              default: 0,
            },
            bgColorIndex: {
              default: 0,
            },
          },
          parseDOM: [
            {
              tag: 'span',
              getAttrs(el) {
                if (typeof el === 'string')
                  return null

                const colorIndex = parseInt(el.getAttribute('data-color-index') ?? '0')
                const bgColorIndex = parseInt(el.getAttribute('data-bg-color-index') ?? '0')
                return { colorIndex, bgColorIndex }
              },
            },
          ],
          // no parseDOM, because we don't want to parse the color/background-color from the DOM
          toDOM: (mark: Mark) => {
            const styles: string[] = []
            if (mark.attrs.colorIndex)
              styles.push(`color: var(--heterodoc-fontfancy-text-color-${mark.attrs.colorIndex});`)
            if (mark.attrs.bgColorIndex)
              styles.push(`background-color: var(--heterodoc-fontfancy-bg-color-${mark.attrs.bgColorIndex});`)
            return ['span', {
              'data-color-index': mark.attrs.colorIndex,
              'data-bg-color-index': mark.attrs.bgColorIndex,
              'style': styles.join(' '),
            }, 0]
          },
        },
      },
    }
  }

  commands: () => FontColorCommandDefs = () => {
    return {
      setFontColor: ({ colorIndex }) => ({ commands }) => {
        return commands.setMark({ typeOrName: this.name, attrs: { colorIndex, bgColorIndex: 0 } })
      },
      unsetFontColor: () => ({ commands }) => {
        return commands.updateAttributes({ typeOrName: this.name, attrs: { colorIndex: 0 } })
      },
      setFontBgColor: ({ bgColorIndex }) => ({ commands }) => {
        return commands.setMark({ typeOrName: this.name, attrs: { bgColorIndex, colorIndex: 0 } })
      },
      unsetFontBgColor: () => ({ commands }) => {
        return commands.updateAttributes({ typeOrName: this.name, attrs: { bgColorIndex: 0 } })
      },
    }
  }

  getProseMirrorPlugin: () => Plugin[] = () => {
    const recursiveRemoveFontFancyMark = (node: any) => {
      if (node.marks) {
        node.marks = node.marks.filter((mark: any) => {
          return mark.type !== 'fontFancy'
        })
      }

      const content = node.content ?? []
      content.forEach((child: any) => recursiveRemoveFontFancyMark(child))
    }

    return [
      new Plugin({
        key: new PluginKey('fontFancyReInitOnPaste'),
        props: {
          handlePaste(view, _, slice) {
            // create a new slice, modified from the original slice,
            // which is serialized from the pasting content
            const newSliceJSON = Object.assign({}, slice.toJSON())
            recursiveRemoveFontFancyMark(newSliceJSON)
            const newSlice = Slice.fromJSON(view.state.schema, newSliceJSON)
            slice = newSlice
            return false
          },
        },
      }),
    ]
  }
}
