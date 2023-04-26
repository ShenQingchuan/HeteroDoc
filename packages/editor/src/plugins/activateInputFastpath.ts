import { Plugin, PluginKey } from 'prosemirror-state'
import { findParentDomRef, findParentNode } from 'prosemirror-utils'
import { EXTENSION_NAMES, PARAGRAPH_SCHEMA_NODE_NAME } from '../constants'
import type { Node } from 'prosemirror-model'
import type { EditorCore } from '../core'

const pluginKey = new PluginKey('activateInputFastpath')

export const activateInputFastPath = (core: EditorCore) => {
  let isFastPathTriggered = false

  return new Plugin({
    key: pluginKey,
    props: {
      handleDOMEvents: {
        keydown(view, event) {
          const isActionKey =
            event.key === 'ArrowUp' ||
            event.key === 'ArrowDown' ||
            event.key === 'Enter'
          if (isActionKey && isFastPathTriggered) {
            core.emit('fastpathActionKey', { event })
          }
          return false // means didn't terminate by this plugin
        },
      },
      handleKeyDown(view, event) {
        if (event.key === '/') {
          const { state } = view
          const { selection } = state
          const { empty } = selection

          const paragraphPredicate = (node: Node) =>
            node.type.name === PARAGRAPH_SCHEMA_NODE_NAME
          const listItemPredicate = (node: Node) =>
            node.type.name === EXTENSION_NAMES.LIST_ITEM
          const parentParagraph = findParentNode(paragraphPredicate)(selection)
          const parentListItem = findParentNode(listItemPredicate)(selection)
          if (!empty || parentParagraph?.node.textContent !== '') {
            return
          }
          let isNeedAppend = false
          if (parentListItem) {
            // if the parent is list item, we can't toggle any node type directly,
            // we can just append a new line of that expected type
            isNeedAppend = true
          }
          const paragraphDOM = findParentDomRef(
            paragraphPredicate,
            view.domAtPos.bind(view)
          )(selection)
          if (paragraphDOM instanceof HTMLElement) {
            const { left, top } = paragraphDOM.getBoundingClientRect()
            core.emit('activateInputFastPath', {
              left,
              top,
              params: {
                isNeedAppend,
              },
            })
            isFastPathTriggered = true
          }
        }
        // other keys input
        else if (isFastPathTriggered) {
          core.emit('deactivateInputFastPath', { isContentChanged: false })
          isFastPathTriggered = false
        }
        return false
      },
    },
  })
}
