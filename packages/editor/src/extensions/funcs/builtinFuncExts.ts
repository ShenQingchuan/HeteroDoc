import { BaseKeymap } from './baseKeymap'
import { Blockify } from './blockify'
import { DragAndDrop } from './dragAndDrop'
import { SearchAndReplaceExtension } from './searchAndRelace'
import { TextAlign } from './textAlign'
import { TextIdent } from './textIndent'
import type { EditorCore } from '../../core'

export const createBuiltinFuncExts = (core: EditorCore) => [
  new BaseKeymap(core),
  new TextAlign(core),
  new TextIdent(core),
  new DragAndDrop(core),
  new Blockify(core),
  new SearchAndReplaceExtension(core),
]
