import type { EditorCore } from '../../core'
import { BaseKeymap } from './baseKeymap'
import { TextAlign } from './textAlign'

export const createBuiltinFuncExts = (core: EditorCore) => [
  new BaseKeymap(core),
  new TextAlign(core),
]
