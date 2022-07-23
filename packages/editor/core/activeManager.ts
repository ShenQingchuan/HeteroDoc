import type { Node } from 'prosemirror-model'
import type { EditorCore } from './index'

export class ActiveManager {
  core: EditorCore

  constructor(core: EditorCore) {
    this.core = core
  }

  isHyperlinkActive(): boolean {
    const { selection, doc } = this.core.view.state
    const { from, to, empty } = selection
    if (empty) {
      return false
    }
    const collectRangeNodes: Node[] = []
    doc.nodesBetween(from, to, (node) => {
      if (node.type.name === 'text') {
        collectRangeNodes.push(node)
      }
    })
    return collectRangeNodes.length === 1
  }
}
