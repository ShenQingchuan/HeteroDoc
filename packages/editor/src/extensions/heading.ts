import type { EditorCore } from '../core'
import type { AddNodesSchema, Command, IEditorExtension } from '../types'
import { getUUID } from '../utils/getUUID'
import type { PatternRule } from '../core/rule'
import { textblockTypeInputRule } from '../core/rule'
import { HETERO_BLOCK_NODE_DATA_TAG } from '../constants'
import { ExtensionType } from '../types'

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
  name = 'heading'
  options = {}

  constructor(public core: EditorCore) {}

  schemaSpec: () => AddNodesSchema<'heading'> = () => {
    return {
      nodes: {
        heading: {
          attrs: {
            level: { default: 1 },
            uuid: {},
          },
          content: 'inline*',
          group: 'block non_quote_block',
          defining: true,
          parseDOM: Array(6).map((_, i) => ({
            tag: `h${i + 1}`,
            getAttrs(dom) {
              return dom instanceof HTMLHeadElement
                ? {
                    level: parseInt(dom.tagName.slice(-1), 10),
                    uuid: dom.dataset.uuid || getRandomHeadingID(),
                  }
                : {}
            },
          })),
          toDOM(node) {
            const { level = 1, uuid = getRandomHeadingID() } = node.attrs
            return [`h${level}`, { 'data-uuid': uuid, [HETERO_BLOCK_NODE_DATA_TAG]: 'true' }, 0]
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
            uuid: getRandomHeadingID(),
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
            uuid: getRandomHeadingID(),
          },
        })
      },
      toggleHeading: ({ level }) => ({ commands }) => {
        if (level === 0) {
          return commands.setNode({
            typeOrName: 'paragraph',
          })
        }
        return commands.toggleNode({
          turnOn: this.name,
          turnOff: 'paragraph',
          attrs: {
            level,
            uuid: getRandomHeadingID(),
          },
        })
      },
    }
  }
}
