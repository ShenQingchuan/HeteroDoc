import type { Node } from 'prosemirror-model'
import { isActive } from './helpers/isActive'
import type { EditorCore } from './index'

export class ActiveManager {
  constructor(private core: EditorCore) {}

  /**
   * Returns if the currently selected node or mark is active.
   *
   * @param name Name of the node or mark
   * @param attributes Attributes of the node or mark
   */
  public isActive(name: string, attributes?: {}): boolean
  public isActive(attributes: {}): boolean
  public isActive(nameOrAttributes: string, attributesOrUndefined?: {}): boolean {
    const name = typeof nameOrAttributes === 'string'
      ? nameOrAttributes
      : null

    const attributes = typeof nameOrAttributes === 'string'
      ? attributesOrUndefined
      : nameOrAttributes

    return isActive(this.core.view.state, name, attributes)
  }

  isHyperlinkAvailable(): boolean {
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
