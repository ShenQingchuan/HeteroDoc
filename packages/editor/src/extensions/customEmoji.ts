import { ExtensionType } from '../types'
import { EXTENSION_NAMES, HETERO_EMOJI_RAW_DATA_TAG } from '../constants'
import { PatternRule } from '../core/rule'
import { getMarkType } from '../helpers/getMarkType'
import { getUUID } from '../utils/getUUID'
import type { EditorCore } from '@hetero/editor'
import type { AddMarksSchema, IEditorExtension } from '../types'

const emojiPattern = /(?<text>\p{Emoji})/u

// List of emoji CDN
const twemojiCDNFromJsDelivr =
  'https://cdn.jsdelivr.net/npm/@iconify-emoji/twemoji/icons/'

export class CustomEmojiExtension
  implements
    IEditorExtension<{
      customURLResolve?: (emoji: string) => string
    }>
{
  name = EXTENSION_NAMES.CUSTOM_EMOJI
  type = ExtensionType.func
  constructor(
    public core: EditorCore,
    public options = {
      customURLResolve: (emoji: string) => {
        if (!emojiPattern.test(emoji)) {
          throw new Error(`Unrecongnized emoji: ${emoji}`)
        }
        return `${twemojiCDNFromJsDelivr}${CustomEmojiExtension.buildEmojiFileName(
          emoji
        )}.svg`
      },
    }
  ) {}

  static buildEmojiFileName = (emoji: string) => {
    return [...emoji]
      .map((emojiFragment) => emojiFragment.codePointAt(0)?.toString(16))
      .join('-')
  }

  schemaSpec: () => AddMarksSchema<EXTENSION_NAMES.CUSTOM_EMOJI> = () => {
    return {
      marks: {
        [EXTENSION_NAMES.CUSTOM_EMOJI]: {
          attrs: { emoji: {}, uuid: {} },
          inclusive: false,
          spanning: false,
          parseDOM: [
            {
              tag: 'span',
              getAttrs: (el) => {
                if (el instanceof HTMLElement) {
                  const emoji = el.getAttribute(HETERO_EMOJI_RAW_DATA_TAG)
                  return emoji
                    ? {
                        emoji,
                      }
                    : null
                }
                return null
              },
            },
          ],
          toDOM: (mark) => {
            const { emoji } = mark.attrs
            return [
              'span',
              {
                [HETERO_EMOJI_RAW_DATA_TAG]: emoji,
                style: `background-image: url(${this.options.customURLResolve(
                  emoji
                )})`,
              },
            ]
          },
        },
      },
    }
  }

  inputRules: () => PatternRule[] = () => {
    return [
      new PatternRule({
        preventUndo: true,
        onlyMatchNewInput: true,
        find: emojiPattern,
        handler: ({ state, match, range: { from, to } }) => {
          const { tr } = state
          const markType = getMarkType(
            EXTENSION_NAMES.CUSTOM_EMOJI,
            this.core.schema
          )
          const emojiText = match.groups!.text!
          const emojiMark = markType.create({
            emoji: emojiText,
            uuid: getUUID(4),
          })
          const textWithEmoji = this.core.schema.text(emojiText, [emojiMark])
          tr.replaceWith(from, to, textWithEmoji)

          // If the emoji is at the start of the line, we need to add an empty text node,
          // becaust ProseMirror mark is inclusive at left, and this can not be changed.
          // First, we need find current line's start position.
          const mappedFrom = tr.mapping.map(from)
          const lineStart = tr.doc.resolve(mappedFrom).start()
          if (lineStart === mappedFrom) {
            tr.insert(mappedFrom, [this.core.schema.text('\u200B')])
          }
        },
      }),
    ]
  }
}
