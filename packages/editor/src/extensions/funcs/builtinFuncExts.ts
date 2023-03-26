import type { EditorCore } from '../../core'
import { BaseKeymap } from './baseKeymap'
import { Blockify } from './blockify'
import { DragAndDrop } from './dragAndDrop'
import { TextAlign } from './textAlign'
import { TextIdent } from './textIndent'

export const createBuiltinFuncExts = (core: EditorCore) => [
  new BaseKeymap(core),
  new TextAlign(core),
  new TextIdent(core),
  new DragAndDrop(core),
  new Blockify(core),
]
