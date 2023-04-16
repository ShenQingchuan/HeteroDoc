import { Plugin } from 'prosemirror-state'
import {
  EXTENSION_NAMES,
  HETERODOC_LIST_ITEM_CONTENT_CLASS_NAME,
  HETERODOC_LIST_ITEM_MARKER_CLASS_NAME,
  HETERODOC_LIST_ITEM_MARKER_SYMBOL_CLASS_NAME,
  HETERODOC_LIST_SPINE_CLASS_NAME,
  HETERO_BLOCK_NODE_DATA_TAG,
} from '../../constants'
import { ExtensionType } from '../../types'
import {
  blockIdDataAttrAtDOM,
  extendsBlockAttrs,
  getBlockAttrsFromElement,
} from '../../utils/blockSchema'
import { createElement } from '../../utils/createElement'
import type { Node as ProsemirrorNode } from 'prosemirror-model'
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
          defining: true,
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
          toDOM() {
            return [EXTENSION_NAMES.LIST_ITEM, 0]
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

  getProseMirrorPlugin: () => Plugin[] = () => {
    return [
      new Plugin({
        props: {
          nodeViews: {
            [EXTENSION_NAMES.LIST_ITEM]: (node) => {
              const dom = createElement('li', {
                [HETERO_BLOCK_NODE_DATA_TAG]: EXTENSION_NAMES.LIST_ITEM,
                ...blockIdDataAttrAtDOM(node),
              })
              dom.setAttribute(
                HETERO_BLOCK_NODE_DATA_TAG,
                EXTENSION_NAMES.LIST_ITEM
              )
              const listItemMarker = document.createElement('label')
              listItemMarker.contentEditable = 'false'
              listItemMarker.classList.add(
                HETERODOC_LIST_ITEM_MARKER_CLASS_NAME
              )
              const listItemMarkerSymbol = document.createElement('div')
              listItemMarkerSymbol.contentEditable = 'false'
              listItemMarkerSymbol.classList.add(
                HETERODOC_LIST_ITEM_MARKER_SYMBOL_CLASS_NAME
              )
              listItemMarker.append(listItemMarkerSymbol)
              const contentDOM = document.createElement('div')
              contentDOM.classList.add(HETERODOC_LIST_ITEM_CONTENT_CLASS_NAME)
              const update = (newNode: ProsemirrorNode): boolean => {
                if (newNode.type !== node.type) {
                  return false
                }
                if (
                  newNode.childCount > 1 &&
                  !dom.querySelector(`.${HETERODOC_LIST_SPINE_CLASS_NAME}`)
                ) {
                  const spine = createElement('div')
                  spine.contentEditable = 'false'
                  spine.classList.add(HETERODOC_LIST_SPINE_CLASS_NAME)
                  dom.append(spine)
                } else if (newNode.childCount === 1) {
                  dom
                    .querySelector(`.${HETERODOC_LIST_SPINE_CLASS_NAME}`)
                    ?.remove()
                }
                return true
              }
              update(node)
              dom.append(listItemMarker, contentDOM)
              return {
                dom,
                contentDOM,
                update,
              }
            },
          },
        },
      }),
    ]
  }
}
