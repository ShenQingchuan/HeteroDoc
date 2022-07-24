import type { Node } from 'prosemirror-model'
import type { EditorCore } from './index'

export class ActiveManager {
  constructor(private core: EditorCore) {}

  isHyperlinkActive(): boolean {
    const { selection, doc } = this.core.view.state
    const { from, to, empty } = selection
    if (empty) {
      return false
    }
    const collectRangeNodes: Node[] = []
    doc.nodesBetween(from, to, (node) => {
      collectRangeNodes.push(node)
    })
    return !collectRangeNodes.find(n => n.type.name === 'heading')
      && collectRangeNodes.filter(n => n.type.isText).length === 1
  }
}
