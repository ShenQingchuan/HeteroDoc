import type { Plugin } from 'prosemirror-state'
import type { EditorCore } from '../index'
import { activateInputFastPath } from './activateInputFastpath'
import { activateSideToolBtn } from './activateSideToolBtn'
import { canDeleteFirstLine } from './canDeleteFirstLine'
import { clickEditorDOMCloseSelection } from './clickEditorDomCloseSelection'
import { pluginResetStoredMarksOnDeleted } from './resetStoredMarksOnDeleted'

type builtinPluginConstructor = (core: EditorCore) => Plugin

export const builtinPluginConstructors: builtinPluginConstructor[] = [
  pluginResetStoredMarksOnDeleted,
  activateInputFastPath,
  activateSideToolBtn,
  canDeleteFirstLine,
  clickEditorDOMCloseSelection,
]

export const getAllBuiltinPlugins = (core: EditorCore) => {
  return builtinPluginConstructors.map(
    constructor => constructor(core),
  )
}
