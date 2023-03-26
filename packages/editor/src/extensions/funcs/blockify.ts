import type { Node } from 'prosemirror-model'
import { Plugin, PluginKey } from 'prosemirror-state'
import { EXTENSION_NAMES } from '../../constants'
import type { EditorCore } from '../../core'
import type { IEditorExtension } from '../../types'
import { ExtensionType } from '../../types'
import { getUUID } from '../../utils/getUUID'

const isBlock = (node: Node) => (node.type.isBlock)
const isNodeHasAttribute = (node: Node, attrName: string) => Boolean(node.attrs && node.attrs[attrName])

export class Blockify implements IEditorExtension {
  type = ExtensionType.func
  name = EXTENSION_NAMES.DRAG_AND_DROP
  options = {}

  constructor(public core: EditorCore) {}

  getProseMirrorPlugin: () => Plugin[] = () => {
    return [
      new Plugin({
        key: new PluginKey('blockify'),
        appendTransaction: (transactions, prevState, nextState) => {
          const tr = nextState.tr
          let modified = false
          if (transactions.some(transaction => transaction.docChanged)) {
            // Adds a unique id to a node
            const attrName = 'blockId'
            nextState.doc.descendants((node, pos) => {
              if (isBlock(node) && !isNodeHasAttribute(node, attrName)) {
                const attrs = node.attrs
                tr.setNodeMarkup(pos, undefined, { ...attrs, [attrName]: getUUID() })
                modified = true
              }
            })
          }

          return modified ? tr : null
        },
      }),
    ]
  }
}
