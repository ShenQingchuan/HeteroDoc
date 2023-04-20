import { Decoration, DecorationSet } from 'prosemirror-view'
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state'
import { findParentNodeClosestToPos, flatten } from 'prosemirror-utils'
import { HETERODOC_PLACEHOLER_CLASS_NAME } from '../constants'
import { applyTrToView } from '../utils/applyTrToView'
import type { Node } from 'prosemirror-model'
import type { EditorCore } from '../core'
import type { EditorState } from 'prosemirror-state'

function createPlaceholderDecorationSet(
  doc: Node,
  pos: number,
  placeholderElement: HTMLElement
) {
  return DecorationSet.create(doc, [Decoration.widget(pos, placeholderElement)])
}

function createPlaceholderElement(text: string) {
  const placeholderElement = document.createElement('span')
  placeholderElement.classList.add(HETERODOC_PLACEHOLER_CLASS_NAME)
  placeholderElement.textContent = text
  return placeholderElement
}

function getTailPlaceholderInsertPos(doc: Node) {
  const docChildren = flatten(doc, false)
  const docLastChildWithPos = docChildren.at(-1)
  if (docChildren.length === 0 || !docLastChildWithPos) {
    return 1
  }
  const { node: docLastChild, pos } = docLastChildWithPos
  if (docChildren.length === 1 && docLastChild.textContent.length === 0) {
    return 1
  }
  if (docLastChild.textContent.length === 0) {
    return pos + 1 // +1 means inserting inside the block node
  }
  const insertPlaceholderPos = Math.min(
    doc.nodeSize - 1,
    pos + docLastChild.nodeSize
  )
  return insertPlaceholderPos
}

export function placeholderPlugin(core: EditorCore) {
  const pluginKey = new PluginKey('placeholder')
  const updatePlaceholder = (state: EditorState) =>
    createPlaceholderDecorationSet(
      state.doc,
      getTailPlaceholderInsertPos(state.doc),
      createPlaceholderElement(core.i18nTr('editor.placeholder'))
    )

  return new Plugin({
    key: pluginKey,
    state: {
      init(_, state) {
        return updatePlaceholder(state)
      },
      apply(tr, decorationSet, oldState, newState) {
        if (tr.docChanged || tr.selectionSet) {
          return updatePlaceholder(newState)
        }
        return decorationSet
      },
    },
    props: {
      handleDOMEvents: {
        mousedown(view, event) {
          const { doc } = view.state
          if (doc.textContent.length === 0) {
            return
          }

          const placeholderElement = view.dom.querySelector(
            `.${HETERODOC_PLACEHOLER_CLASS_NAME}`
          )
          if (
            !placeholderElement ||
            !(placeholderElement instanceof HTMLElement)
          ) {
            return
          }
          const { left, top } = placeholderElement.getBoundingClientRect()
          const { x, y } = event
          // if click on placeholder
          // 1. placeholder is already inside an empty block,
          //   then we need to move selection cursor into the block and focus the editor
          const posAtMouseDownPoint = view.posAtCoords({ left: x, top: y })
          if (!posAtMouseDownPoint) {
            return
          }
          const parentBlock = findParentNodeClosestToPos(
            doc.resolve(posAtMouseDownPoint.pos),
            (node) => node.isBlock
          )
          if (parentBlock && parentBlock.node.textContent.length === 0) {
            event.preventDefault()
            event.stopPropagation()
            applyTrToView(view, (tr) => {
              tr.setSelection(TextSelection.create(tr.doc, parentBlock.pos + 1))
            })
            view.focus()
            return true
          }

          // 2. Otherwise, insert a new block to the last position
          if (
            x >= left &&
            x <= left + placeholderElement.offsetWidth &&
            y >= top &&
            y <= top + placeholderElement.offsetHeight
          ) {
            event.preventDefault()
            event.stopPropagation()
            const insertPlaceholderPos = getTailPlaceholderInsertPos(doc)
            applyTrToView(view, (tr) => {
              tr.insert(
                insertPlaceholderPos,
                core.schema.nodes.paragraph!.create()
              )
            })
            // Move selection cursor into the new block
            applyTrToView(view, (tr) => {
              tr.setSelection(
                TextSelection.create(tr.doc, insertPlaceholderPos + 1)
              )
            })
            view.focus()
            return true
          }
        },
      },
      decorations(state) {
        return this.getState(state)
      },
    },
  })
}
