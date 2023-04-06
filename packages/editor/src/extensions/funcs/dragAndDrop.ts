import { NodeSelection, Plugin, PluginKey } from 'prosemirror-state'
import { findParentNodeClosestToPos } from 'prosemirror-utils'
import { EXTENSION_NAMES, HETERO_BLOCK_NODE_DATA_TAG } from '../../constants'
import { ExtensionType } from '../../types'
import { isHeteroBlock } from '../../utils/isSomewhat'
import { isListItem } from '../../core/helpers/isListItem'
import { isList } from '../../core/helpers/isList'
import type { EditorCore } from '../../core'
import type { IEditorExtension } from '../../types'
import type { Node, ResolvedPos, Slice } from 'prosemirror-model'

export class DragAndDrop implements IEditorExtension {
  type = ExtensionType.func
  name = EXTENSION_NAMES.DRAG_AND_DROP
  options = {}
  draggingPos = Number.NaN
  draggingNode: Node | null = null
  draggingSlice: Slice | null = null

  constructor(public core: EditorCore) {
    core.on('dragBlock', ({ hoverNodePos }) => {
      core.status.isDragging = true
      // -1 is because the pos value we got is actually inside the node,
      // this is in order to get the node outter left point
      const dragResolvedPos = core.view.state.doc.resolve(hoverNodePos)
      const draggingTarget = this.findMouseActionClosetTarget(dragResolvedPos)
      if (!draggingTarget) {
        return
      }
      this.draggingNode = draggingTarget.node
      this.draggingPos = draggingTarget.pos
      core.logger.debug('dragging: ', {
        draggingPos: this.draggingPos,
        draggingNodeType: this.draggingNode?.type.name,
        draggingNodeText: this.draggingNode?.textContent,
      })
      const { doc } = core.view.state
      this.draggingSlice = NodeSelection.create(
        doc,
        draggingTarget.pos
      ).content()
    })

    core.on('dropBlock', ({ dropPos, isAppend = false }) => {
      if (!this.draggingNode || !this.draggingSlice) {
        return
      }
      const dropResolvedPos = core.view.state.doc.resolve(dropPos)
      const dropAreaClosetTarget =
        this.findMouseActionClosetTarget(dropResolvedPos)
      if (!dropAreaClosetTarget) {
        return this.clearDraggingStatus()
      }

      core.logger.debug('drop: ', {
        dropOnBlockPos: dropAreaClosetTarget.pos,
        dropOnBlockNodeType: dropAreaClosetTarget.node.type.name,
        dropOnBlockNodeText: dropAreaClosetTarget.node.textContent,
      })
      core.logger.debug('dragging slice', this.draggingSlice)
      const { pos: dropAreaClosetTargetPos, node: dropAreaClosetTargetNode } =
        dropAreaClosetTarget
      const { tr } = core.view.state
      const isDraggingListItem = isListItem(dropAreaClosetTargetNode.type)
      // 1. Insert the dragging node before the drop area's closet block
      tr.insert(
        isAppend
          ? dropAreaClosetTargetPos + dropAreaClosetTargetNode.nodeSize
          : dropAreaClosetTargetPos,
        this.draggingNode
      )
      // 2. Removing the dragging node original position
      // before removing the dragging node, we need to re-compute the `draggingPos` by `tr.map`
      // because the `draggingPos` is based on the original document

      // 2.1 If the dragging node is a list item, and the item is the only one in the list,
      // we need to remove the list node as well
      let deleteStartBeforeMapping = this.draggingPos
      let deleteSize = this.draggingNode.nodeSize
      if (isDraggingListItem) {
        const draggingListNode = findParentNodeClosestToPos(
          tr.doc.resolve(this.draggingPos),
          (node) => isList(node.type.name, core)
        )
        if (draggingListNode) {
          const { pos: draggingListNodePos } = draggingListNode
          deleteStartBeforeMapping = draggingListNodePos
          deleteSize = draggingListNode.node.nodeSize
        }
      }

      const draggingPosAfterInsert = tr.mapping.map(deleteStartBeforeMapping)
      tr.delete(draggingPosAfterInsert, draggingPosAfterInsert + deleteSize)

      // Set the dragging meta to prevent `selectionChange` event
      // because this case is special and handled by this extension
      tr.setMeta('dragging', true)
      core.view.dispatch(tr)
      core.view.focus()

      // Clear the dragging status
      this.clearDraggingStatus()
    })
  }

  findMouseActionClosetTarget(resolvedPos: ResolvedPos) {
    // 1. Find the closet list item
    const dropAreaClosetListItem = findParentNodeClosestToPos(
      resolvedPos,
      (node) => isListItem(node.type)
    )
    if (dropAreaClosetListItem) {
      return dropAreaClosetListItem
    }
    // 2. Find the closet block
    return findParentNodeClosestToPos(resolvedPos, (node) => node.isBlock)
  }

  clearDraggingStatus() {
    this.draggingPos = Number.NaN
    this.draggingNode = null
    this.draggingSlice = null
    this.core.status.isDragging = true
  }

  getProseMirrorPlugin: () => Plugin[] = () => {
    return [
      new Plugin({
        key: new PluginKey('dragMoving'),
        props: {
          handleDOMEvents: {
            mouseover: (view, event) => {
              if (!this.core.status.isDragging) {
                return false
              }
              // For drag moving, we need to select the hovered DOM element from mouseover event.
              // It could be done by `event.target` as HTMLElement
              const hoverElement = event.target
              const { x, y } = event
              const lastHeteroBlock = Array.from(
                view.dom.querySelectorAll<HTMLElement>(
                  `[${HETERO_BLOCK_NODE_DATA_TAG}]`
                )
              ).at(-1)
              if (
                lastHeteroBlock &&
                y > lastHeteroBlock.getBoundingClientRect().bottom
              ) {
                this.core.emit('dragMoving', {
                  hoverElement: lastHeteroBlock,
                  isAppend: true,
                  x,
                  y,
                })
                return true
              }

              // Only emit dragMoving event on:
              // 1. on dragging
              // 2. when the `hoverElement` is a hetero block
              const isHoveringHeteroBlock = isHeteroBlock(hoverElement)
              if (isHoveringHeteroBlock) {
                this.core.emit('dragMoving', { hoverElement, x, y })
              }
              return true
            },
          },
        },
      }),
    ]
  }
}
