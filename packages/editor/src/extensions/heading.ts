import type { EditorCore } from '../core'
import type { AddNodesSchema, Command, IEditorExtension } from '../types'
import { getUUID } from '../utils/getUUID'
import type { PatternRule } from '../core/rule'
import { textblockTypeInputRule } from '../core/rule'
import { EXTENSION_NAMES, HETERO_BLOCK_NODE_DATA_TAG } from '../constants'
import { ExtensionType } from '../types'
import { extendsTextBlockAttrs, stylesOfTextBlock } from '../utils/textBlockStyles'

const headingInputRuleRegExp = /^(#{1,5})\s/
const getRandomHeadingID = () => getUUID(6)

export interface HeadingSetterAttrs {
  level: number
}
interface HeadingCommandsDefs {
  setHeading: Command<HeadingSetterAttrs>
  toggleHeading: Command<HeadingSetterAttrs>
}
declare global {
  interface Commands {
    setHeading: HeadingCommandsDefs['setHeading']
    toggleHeading: HeadingCommandsDefs['toggleHeading']
  }
}

export class HeadingExtension implements IEditorExtension {
  type = ExtensionType.node
  name = EXTENSION_NAMES.HEADING
  options = {}

  constructor(public core: EditorCore) {}

  schemaSpec: () => AddNodesSchema<EXTENSION_NAMES.HEADING> = () => {
    return {
      nodes: {
        [EXTENSION_NAMES.HEADING]: {
          attrs: extendsTextBlockAttrs({
            level: { default: 1 },
            anchorId: {},
          }),
          content: 'inline*',
          group: 'block non_quote_block',
          defining: true,
          parseDOM: Array(6).map((_, i) => ({
            tag: `h${i + 1}`,
            getAttrs(dom) {
              return dom instanceof HTMLHeadElement
                ? {
                    level: parseInt(dom.tagName.slice(-1), 10),
                    anchorId: dom.dataset.anchorId || getRandomHeadingID(),
                  }
                : {}
            },
          })),
          toDOM(node) {
            const { level = 1, anchorId = getRandomHeadingID() } = node.attrs
            return [`h${level}`, {
              'style': stylesOfTextBlock(node),
              'id': anchorId,
              'data-anchorId': anchorId,
              [HETERO_BLOCK_NODE_DATA_TAG]: 'true',
            }, 0]
          },
        },
      },
    }
  }

  inputRules: () => PatternRule[] = () => {
    const nodeType = this.core.schema.nodes.heading!
    return [
      textblockTypeInputRule(
        headingInputRuleRegExp,
        nodeType,
        (match) => {
          return {
            level: match[1]!.length,
            anchorId: getRandomHeadingID(),
          }
        },
      ),
    ]
  }

  commands: () => HeadingCommandsDefs = () => {
    return {
      setHeading: ({ level }) => ({ commands }) => {
        return commands.setNode({
          typeOrName: this.name,
          attrs: {
            level,
            anchorId: getRandomHeadingID(),
          },
        })
      },
      toggleHeading: ({ level }) => ({ commands }) => {
        if (level === 0) {
          return commands.setNode({
            typeOrName: EXTENSION_NAMES.PARAGRAPH,
          })
        }
        return commands.toggleNode({
          turnOn: this.name,
          turnOff: EXTENSION_NAMES.PARAGRAPH,
          attrs: {
            level,
            anchorId: getRandomHeadingID(),
          },
        })
      },
    }
  }
}
