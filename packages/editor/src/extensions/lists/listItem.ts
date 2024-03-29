import { Plugin } from 'prosemirror-state'
import {
  findChildrenByType,
  findParentNodeClosestToPos,
} from 'prosemirror-utils'
import {
  EXTENSION_NAMES,
  HETERODOC_LIST_ITEM_CONTENT_CLASS_NAME,
  HETERODOC_LIST_ITEM_MARKER_CLASS_NAME,
  HETERODOC_LIST_ITEM_MARKER_COUNT_CLASS_NAME,
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

const useListItemMarker = () => {
  const listItemMarker = createElement('label')
  listItemMarker.contentEditable = 'false'
  listItemMarker.classList.add(HETERODOC_LIST_ITEM_MARKER_CLASS_NAME)

  // ListItemMarkerSymbol is for bullet list
  const listItemMarkerSymbol = createElement('div')
  listItemMarkerSymbol.contentEditable = 'false'
  listItemMarkerSymbol.classList.add(
    HETERODOC_LIST_ITEM_MARKER_SYMBOL_CLASS_NAME
  )

  // ListItemMarkerCount is for ordered list
  const listItemMarkerCount = createElement('div')
  listItemMarkerCount.contentEditable = 'false'
  listItemMarkerCount.classList.add(HETERODOC_LIST_ITEM_MARKER_COUNT_CLASS_NAME)

  const clearMarker = () => {
    listItemMarkerSymbol.remove()
    listItemMarkerCount.remove()
  }
  const updateMarker = (
    listNode: ProsemirrorNode,
  ) => {
    clearMarker()
    switch (listNode.type.name) {
      case EXTENSION_NAMES.BULLET_LIST:
        listItemMarker.append(listItemMarkerSymbol)
        break
      case EXTENSION_NAMES.ORDERED_LIST: 
        listItemMarker.append(listItemMarkerCount)
        break
      case EXTENSION_NAMES.TASK_LIST:
        // Todo: ...
        break
    }
  }

  return {
    listItemMarker,
    updateMarker,
  }
}

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
            [EXTENSION_NAMES.LIST_ITEM]: (node, view, getPos) => {
              const dom = createElement('li', {
                [HETERO_BLOCK_NODE_DATA_TAG]: EXTENSION_NAMES.LIST_ITEM,
                ...blockIdDataAttrAtDOM(node),
              })
              dom.setAttribute(
                HETERO_BLOCK_NODE_DATA_TAG,
                EXTENSION_NAMES.LIST_ITEM
              )
              const contentDOM = document.createElement('div')
              contentDOM.classList.add(HETERODOC_LIST_ITEM_CONTENT_CLASS_NAME)

              const { listItemMarker, updateMarker } = useListItemMarker()

              const updateListItemNodeView = (
                newNode: ProsemirrorNode
              ): boolean => {
                if (newNode.type !== node.type) {
                  return false
                }

                const $pos = view.state.doc.resolve(getPos() as number)
                const foundListTypeParent = findParentNodeClosestToPos(
                  $pos,
                  (node) => Boolean(node.type.spec.group?.includes('list'))
                )
                if (foundListTypeParent) {
                  const { node: foundParentListTypeNode } = foundListTypeParent
                  updateMarker(foundParentListTypeNode)
                }

                // Add spine line for nested sub-list items
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

              updateListItemNodeView(node)
              dom.append(listItemMarker, contentDOM)
              return {
                dom,
                contentDOM,
                update: updateListItemNodeView,
              }
            },
          },
        },
      }),
    ]
  }
}
