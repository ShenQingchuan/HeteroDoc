import type { Mark } from 'prosemirror-model'
import { Slice } from 'prosemirror-model'
import { Plugin, PluginKey } from 'prosemirror-state'
import type { EditorCore } from '../core'
import type { AddMarksSchema, Command, IEditorExtension, NoArgsCommand } from '../types'
import { ExtensionType } from '../types'

interface FontColorCommandDefs {
  setFontColor: Command<{ color: string }>
  unsetFontColor: NoArgsCommand
  setFontBgColor: Command<{ bgColor: string }>
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
  name = 'fontFancy'
  options = {}

  constructor(public core: EditorCore) {}

  schemaSpec: () => AddMarksSchema<'fontFancy'> = () => {
    return {
      marks: {
        fontFancy: {
          attrs: { color: { default: '' }, bgColor: { default: '' } },
          parseDOM: [
            {
              tag: 'span',
              style: 'color',
              getAttrs(el) {
                return {
                  color: (el as HTMLElement).style.color,
                }
              },
            },
            {
              tag: 'span',
              style: 'background-color',
              getAttrs(el) {
                return {
                  bgColor: (el as HTMLElement).style.backgroundColor,
                }
              },
            },
          ],
          toDOM(mark: Mark) {
            const styles: string[] = []
            if (mark.attrs.color) {
              styles.push(`color: ${mark.attrs.color};`)
            }
            if (mark.attrs.bgColor) {
              styles.push(`background-color: ${mark.attrs.bgColor};`)
            }
            return ['span', { style: styles.join(' ') }, 0]
          },
        },
      },
    }
  }

  commands: () => FontColorCommandDefs = () => {
    return {
      setFontColor: ({ color }) => ({ commands }) => {
        return commands.setMark({ typeOrName: this.name, attrs: { color, bgColor: '' } })
      },
      unsetFontColor: () => ({ commands }) => {
        return commands.updateAttributes({ typeOrName: this.name, attrs: { color: '' } })
      },
      setFontBgColor: ({ bgColor }) => ({ commands }) => {
        return commands.setMark({ typeOrName: this.name, attrs: { bgColor, color: '' } })
      },
      unsetFontBgColor: () => ({ commands }) => {
        return commands.updateAttributes({ typeOrName: this.name, attrs: { bgColor: '' } })
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
        key: new PluginKey('fontFancyPaste'),
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
