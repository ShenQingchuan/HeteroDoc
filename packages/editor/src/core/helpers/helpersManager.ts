import { getMarkAttrs } from './getMarkAttrs'
import type { MarkType } from 'prosemirror-model'
import type { EditorCore } from '../index'

export class HelpersManager {
  core: EditorCore

  constructor(core: EditorCore) {
    this.core = core
  }

  public getMarkAttrs<T extends Record<string, any>>(
    typeOrName: string | MarkType
  ) {
    return getMarkAttrs(this.core.view.state, typeOrName) as T
  }
}
