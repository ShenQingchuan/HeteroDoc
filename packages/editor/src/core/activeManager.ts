import { EXTENSION_NAMES } from '../constants'
import { isActive } from './helpers/isActive'
import { isFontFancyActive as _isFontFancyActive } from './helpers/isFontFancyActive'
import type { Node } from 'prosemirror-model'
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
  public isActive(
    nameOrAttributes: string,
    attributesOrUndefined?: {}
  ): boolean {
    const name = typeof nameOrAttributes === 'string' ? nameOrAttributes : null

    const attributes =
      typeof nameOrAttributes === 'string'
        ? attributesOrUndefined
        : nameOrAttributes

    return isActive(this.core.view.state, name, attributes)
  }

  public isFontFancyActive() {
    return _isFontFancyActive(this.core.view.state)
  }

  public isMenuAvailable(): boolean {
    const { doc } = this.core.view.state
    if (this.core.view.state.selection.empty) {
      return false
    }
    const collectRangeNodes: Node[] = []
    doc.nodesBetween(
      this.core.view.state.selection.from,
      this.core.view.state.selection.to,
      (node) => {
        collectRangeNodes.push(node)
      }
    )
    if (
      // shouldn't display menu in some text block
      collectRangeNodes.some((n) =>
        ([EXTENSION_NAMES.CODE_BLOCK] as string[]).includes(n.type.name)
      )
    ) {
      return false
    }

    return true
  }

  public isHyperlinkAvailable(): boolean {
    const { selection, doc } = this.core.view.state
    const { from, to, empty } = selection
    if (empty) {
      return false
    }
    const collectRangeNodes: Node[] = []
    doc.nodesBetween(from, to, (node) => {
      collectRangeNodes.push(node)
    })
    return (
      !collectRangeNodes.some((n) =>
        (
          [EXTENSION_NAMES.HEADING, EXTENSION_NAMES.CODE_BLOCK] as string[]
        ).includes(n.type.name)
      ) && collectRangeNodes.filter((n) => n.type.isText).length === 1
    )
  }
}
