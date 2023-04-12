import { EXTENSION_NAMES, HETERO_BLOCK_NODE_DATA_TAG } from '../../constants'
import { ExtensionType } from '../../types'
import {
  blockIdDataAttrAtDOM,
  extendsBlockAttrs,
  getBlockAttrsFromElement,
} from '../../utils/blockSchema'
import type { EditorCore } from '../../core'
import type {
  AddNodesSchema,
  IEditorExtension,
  KeyboardShortcutCommand,
} from '../../types'

export class ListItemExtension implements IEditorExtension {
  name = EXTENSION_NAMES.LIST_ITEM
  type = ExtensionType.node
  options = {}

  constructor(public core: EditorCore) {}

  schemaSpec: () => AddNodesSchema<EXTENSION_NAMES.LIST_ITEM> = () => {
    return {
      nodes: {
        [EXTENSION_NAMES.LIST_ITEM]: {
          attrs: {
            ...extendsBlockAttrs(),
          },
          group: 'block can_inside_quote_block',
          content: 'paragraph block*',
          parseDOM: [
            {
              tag: 'li',
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
              'li',
              {
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

  keymaps: () => Record<string, KeyboardShortcutCommand> = () => {
    return {
      Enter: () => this.core.commands.splitListItem({ typeOrName: this.name }),
      Tab: () => this.core.commands.sinkListItem({ typeOrName: this.name }),
      'Shift-Tab': () =>
        this.core.commands.liftListItem({ typeOrName: this.name }),
    }
  }
}
