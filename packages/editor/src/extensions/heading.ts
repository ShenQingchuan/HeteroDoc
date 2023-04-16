import { getUUID } from '../utils/getUUID'
import { textblockTypeInputRule } from '../core/rule'
import {
  EXTENSION_NAMES,
  HETERO_BLOCK_NODE_DATA_TAG,
  PARAGRAPH_SCHEMA_NODE_NAME,
} from '../constants'
import { ExtensionType } from '../types'
import {
  extendsTextBlockAttrs,
  getTextBlockAttrsFromElement,
  stylesOfTextBlock,
} from '../utils/textBlockSchema'
import { blockIdDataAttrAtDOM, createBlockIdAttr } from '../utils/blockSchema'
import type { PatternRule } from '../core/rule'
import type { AddNodesSchema, Command, IEditorExtension } from '../types'
import type { EditorCore } from '../core'

const headingInputRuleRegExp = /^(#{1,5})\s/
const getRandomHeadingID = () => getUUID(6)

export interface HeadingSetterAttrs {
  level: number
}
interface HeadingCommandsDefs {
  setHeading: Command<HeadingSetterAttrs>
  toggleHeading: Command<HeadingSetterAttrs>
}
declare module '@hetero/editor' {
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
          group: 'block ',
          defining: true,
          parseDOM: Array.from({ length: 6 }).map((_, i) => ({
            tag: `h${i + 1}`,
            getAttrs(el) {
              return el instanceof HTMLHeadElement
                ? {
                    level: Number.parseInt(el.tagName.slice(-1), 10),
                    anchorId: el.dataset.anchorId || getRandomHeadingID(),
                    ...getTextBlockAttrsFromElement(el),
                  }
                : {}
            },
          })),
          toDOM(node) {
            const { level = 1, anchorId = getRandomHeadingID() } = node.attrs
            return [
              `h${level}`,
              {
                style: stylesOfTextBlock(node),
                id: anchorId,
                'data-anchorId': anchorId,
                [HETERO_BLOCK_NODE_DATA_TAG]: EXTENSION_NAMES.HEADING,
                ...blockIdDataAttrAtDOM(node),
              },
              0,
            ]
          },
        },
      },
    }
  }

  inputRules: () => PatternRule[] = () => {
    const nodeType = this.core.schema.nodes.heading!
    return [
      textblockTypeInputRule(headingInputRuleRegExp, nodeType, (match) => {
        return {
          level: match[1]!.length,
          anchorId: getRandomHeadingID(),
          ...createBlockIdAttr(),
        }
      }),
    ]
  }

  commands: () => HeadingCommandsDefs = () => {
    return {
      setHeading:
        ({ level }) =>
        ({ commands }) => {
          return commands.setNode({
            typeOrName: this.name,
            attrs: {
              level,
              anchorId: getRandomHeadingID(),
              ...createBlockIdAttr(),
            },
          })
        },
      toggleHeading:
        ({ level }) =>
        ({ commands }) => {
          if (level === 0) {
            return commands.setNode({
              typeOrName: PARAGRAPH_SCHEMA_NODE_NAME,
            })
          }
          return commands.toggleNode({
            turnOn: this.name,
            turnOff: PARAGRAPH_SCHEMA_NODE_NAME,
            attrs: {
              level,
              anchorId: getRandomHeadingID(),
              ...createBlockIdAttr(),
            },
          })
        },
    }
  }
}
