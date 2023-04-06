import { EXTENSION_NAMES, HETERO_BLOCK_NODE_DATA_TAG } from '../../constants'
import { ExtensionType } from '../../types'
import {
  blockIdDataAttrAtDOM,
  extendsBlockAttrs,
  getBlockAttrsFromElement,
} from '../../utils/blockSchema'
import { wrappingInputRule } from '../../core/rule'
import { getNodeType } from '../../core/helpers/getNodeType'
import type { PatternRule } from '../../core/rule'
import type { EditorCore } from '../../core'
import type {
  AddNodesSchema,
  IEditorExtension,
  KeyboardShortcutCommand,
  NoArgsCommand,
} from '../../types'

const START_DATA_ATTRIBUTE = 'data-start'
export const orderedListRegExp = /^(\d+)\.\s$/

interface OrderedListCommandsDefs {
  toggleOrderedList: NoArgsCommand
}

declare module '@hetero/editor' {
  interface Commands {
    toggleOrderedList: OrderedListCommandsDefs['toggleOrderedList']
  }
}

function parseElementStartAttribute(el: HTMLElement) {
  const start = el.getAttribute(START_DATA_ATTRIBUTE)
  return start ? Number.parseInt(start, 10) : 1
}

export class OrderedListExtension implements IEditorExtension {
  name = EXTENSION_NAMES.ORDERED_LIST
  type = ExtensionType.node
  options = {}

  constructor(public core: EditorCore) {}

  schemaSpec: () => AddNodesSchema<EXTENSION_NAMES.ORDERED_LIST> = () => {
    return {
      nodes: {
        [EXTENSION_NAMES.ORDERED_LIST]: {
          content: `${EXTENSION_NAMES.LIST_ITEM}+`,
          group: 'block list',
          attrs: {
            start: { default: 1 },
            ...extendsBlockAttrs(),
          },
          parseDOM: [
            {
              tag: 'ol',
              getAttrs: (el) => {
                return el instanceof HTMLElement
                  ? {
                      start: parseElementStartAttribute(el),
                      ...getBlockAttrsFromElement(el),
                    }
                  : {}
              },
            },
          ],
          toDOM(node) {
            const { attrs } = node

            return [
              'ol',
              {
                [START_DATA_ATTRIBUTE]: `${attrs.start}`,
                [HETERO_BLOCK_NODE_DATA_TAG]: 'true',
                ...blockIdDataAttrAtDOM(node),
              },
              0,
            ]
          },
        },
      },
    }
  }

  commands: () => OrderedListCommandsDefs = () => {
    return {
      toggleOrderedList:
        () =>
        ({ commands }) => {
          return commands.toggleList({
            listTypeOrName: EXTENSION_NAMES.ORDERED_LIST,
            itemTypeOrName: EXTENSION_NAMES.LIST_ITEM,
          })
        },
    }
  }

  inputRules: () => PatternRule[] = () => {
    const bulletListTypeNodeType = getNodeType(this.name, this.core.schema)
    const orderedListRule = wrappingInputRule({
      find: orderedListRegExp,
      type: bulletListTypeNodeType,
      getAttributes: (match) => ({ start: Number.parseInt(match[1]!, 10) }),
      joinPredicate: (match, node) =>
        node.childCount + node.attrs.start === Number.parseInt(match[1]!, 10),
    })

    return [orderedListRule]
  }

  keymaps: () => Record<string, KeyboardShortcutCommand> = () => {
    return {
      'Mod-Shift-7': () => this.core.commands.toggleOrderedList(),
    }
  }
}
