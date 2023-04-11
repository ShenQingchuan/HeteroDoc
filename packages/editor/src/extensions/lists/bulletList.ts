import {
  EXTENSION_NAMES,
  HETERO_BLOCK_NODE_DATA_TAG,
  HETERO_BLOCK_NODE_TYPE_DATA_BULLET_LIST,
} from '../../constants'
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

export const bulletListRegExp = /^\s*([*+-])\s$/

interface BulletListCommandsDefs {
  toggleBulletList: NoArgsCommand
}

declare module '@hetero/editor' {
  interface Commands {
    toggleBulletList: BulletListCommandsDefs['toggleBulletList']
  }
}

export class BulletListExtension implements IEditorExtension {
  name = EXTENSION_NAMES.BULLET_LIST
  type = ExtensionType.node
  options = {}

  constructor(public core: EditorCore) {}

  schemaSpec: () => AddNodesSchema<EXTENSION_NAMES.BULLET_LIST> = () => {
    return {
      nodes: {
        [EXTENSION_NAMES.BULLET_LIST]: {
          content: `${EXTENSION_NAMES.LIST_ITEM}+`,
          group: 'block list',
          attrs: {
            ...extendsBlockAttrs(),
          },
          parseDOM: [
            {
              tag: 'ul',
              getAttrs: (el) => {
                return el instanceof HTMLElement
                  ? {
                      ...getBlockAttrsFromElement(el),
                    }
                  : {}
              },
            },
          ],
          toDOM(node) {
            return [
              'ul',
              {
                [HETERO_BLOCK_NODE_DATA_TAG]:
                  HETERO_BLOCK_NODE_TYPE_DATA_BULLET_LIST,
                ...blockIdDataAttrAtDOM(node),
              },
              0,
            ]
          },
        },
      },
    }
  }

  commands: () => BulletListCommandsDefs = () => {
    return {
      toggleBulletList:
        () =>
        ({ commands }) => {
          return commands.toggleList({
            listTypeOrName: EXTENSION_NAMES.BULLET_LIST,
            itemTypeOrName: EXTENSION_NAMES.LIST_ITEM,
          })
        },
    }
  }

  inputRules: () => PatternRule[] = () => {
    const bulletListTypeNodeType = getNodeType(this.name, this.core.schema)
    const bulletListRule = wrappingInputRule({
      find: bulletListRegExp,
      type: bulletListTypeNodeType,
    })

    return [bulletListRule]
  }

  keymaps: () => Record<string, KeyboardShortcutCommand> = () => {
    return {
      'Mod-Shift-8': () => this.core.commands.toggleBulletList(),
    }
  }
}
