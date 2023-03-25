import type { Node, Slice } from 'prosemirror-model'
import { NodeSelection, Plugin, PluginKey } from 'prosemirror-state'
import { findParentNodeClosestToPos } from 'prosemirror-utils'
import { EXTENSION_NAMES } from '../../constants'
import type { EditorCore } from '../../core'
import type { IEditorExtension } from '../../types'
import { ExtensionType } from '../../types'
import { isHeteroBlock } from '../../utils/isSomewhat'

export class DragAndDrop implements IEditorExtension {
  type = ExtensionType.func
  name = EXTENSION_NAMES.DRAG_AND_DROP
  options = {}
  draggingPos = Number.NaN
  draggingNode: Node | null = null
  draggingSlice: Slice | null = null

  constructor(public core: EditorCore) {
    core.on('dragBlock', ({ hoverNodePos }) => {
      // -1 is because the pos value we got is actually inside the node,
      // this is in order to get the node outter left point
      const dragNodePos = hoverNodePos - 1
      const draggingNode = core.view.state.doc.nodeAt(dragNodePos)
      if (!draggingNode) {
        return
      }
      this.draggingPos = dragNodePos
      this.draggingNode = draggingNode
      core.logger.debug({ draggingPos: this.draggingPos, draggingNodeType: this.draggingNode?.type.name })
      const { doc } = core.view.state
      this.draggingSlice = NodeSelection.create(doc, dragNodePos).content()
    })
    core.on('dropBlock', ({ dropPos }) => {
      if (!this.draggingNode || !this.draggingSlice) {
        return
      }
      const dropResolvedPos = core.view.state.doc.resolve(dropPos)
      const dropAreaClosetBlock = findParentNodeClosestToPos(dropResolvedPos, node => node.isBlock)
      if (!dropAreaClosetBlock) {
        return this.clearDraggingStatus()
      }
      core.logger.debug({ dropOnBlockPos: dropAreaClosetBlock.pos, dropOnBlockNodeType: dropAreaClosetBlock.node.type.name })
      core.logger.debug('dragging slice', this.draggingSlice)
      const { pos: dropAreaClosetBlockPos } = dropAreaClosetBlock
      const { tr } = core.view.state
      // 1. Insert the dragging node before the drop area's closet block
      tr.insert(dropAreaClosetBlockPos, this.draggingNode)
      // 2. Removing the dragging node original position
      // before removing the dragging node, we need to re-compute the `draggingPos` by `tr.map`
      // because the `draggingPos` is based on the original document
      const draggingPosAfterInsert = tr.mapping.map(this.draggingPos)
      tr.delete(draggingPosAfterInsert, draggingPosAfterInsert + this.draggingNode.nodeSize)

      // Clear the dragging status
      this.clearDraggingStatus()
      // Set the dragging meta to prevent `selectionChange` event
      // because this case is special and handled by this extension
      tr.setMeta('dragging', true)
      core.view.dispatch(tr)
    })
  }

  clearDraggingStatus() {
    this.draggingPos = Number.NaN
    this.draggingNode = null
    this.draggingSlice = null
  }

  getProseMirrorPlugin: () => Plugin[] = () => {
    return [
      new Plugin({
        key: new PluginKey('dragMoving'),
        props: {
          handleDOMEvents: {
            mouseover: (view, event) => {
              // For drag moving, we need to select the hovered DOM element from mouseover event.
              // It could be done by `event.target` as HTMLElement
              const hoverElement = event.target

              // Only emit dragMoving event when the `hoverElement` is a hetero block
              const isHoveringHeteroBlock = isHeteroBlock(hoverElement)
              if (isHoveringHeteroBlock) {
                this.core.emit('dragMoving', { hoverElement })
              }
            },
          },
        },
      }),
    ]
  }
}
