import type { Node, Slice } from 'prosemirror-model'
import { NodeSelection } from 'prosemirror-state'
import { findParentNodeClosestToPos } from 'prosemirror-utils'
import { EXTENSION_NAMES } from '../../constants'
import type { EditorCore } from '../../core'
import type { IEditorExtension } from '../../types'
import { ExtensionType } from '../../types'

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
      const { pos: dropAreaClosetBlockPos, node: dropAreaClosetBlockNode } = dropAreaClosetBlock
      const { tr, doc } = core.view.state
      // Switch the dragging node and the closet block node
      // 1. Save the closet block node to a slice
      const closetBlockSlice = NodeSelection.create(doc, dropAreaClosetBlockPos).content()
      // 2. replace the drop area closet block node with the dragging node
      tr.replace(dropAreaClosetBlockPos, dropAreaClosetBlockPos + dropAreaClosetBlockNode.nodeSize, this.draggingSlice)
      // 3. replace the dragging node original area with the drop area closet block node
      // before replacing, we need to get the new pos of the dragging node
      // because the dragging node has been replaced by the closet block node
      // and the doc structure has been changed.
      const newDraggingNodePos = tr.mapping.map(this.draggingPos)
      tr.replace(newDraggingNodePos, newDraggingNodePos + this.draggingNode.nodeSize, closetBlockSlice)
      // 4. clear the dragging status
      this.clearDraggingStatus()
      // 5. set the dragging meta to prevent `selectionChange` event
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
}
