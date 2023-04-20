import { activateInputFastPath } from './activateInputFastpath'
import { activateSideBtns } from './activateSideBtns'
import { canDeleteFirstLine } from './canDeleteFirstLine'
import { clickEditorDOMCloseSelection } from './clickEditorDomCloseSelection'
import { placeholderPlugin } from './placeholder'
import { pluginResetStoredMarksOnDeleted } from './resetStoredMarksOnDeleted'
import type { EditorCore } from '../core'
import type { Plugin } from 'prosemirror-state'

type builtinPluginConstructor = (core: EditorCore) => Plugin

export const builtinPluginConstructors: builtinPluginConstructor[] = [
  pluginResetStoredMarksOnDeleted,
  activateInputFastPath,
  activateSideBtns,
  canDeleteFirstLine,
  clickEditorDOMCloseSelection,
  placeholderPlugin,
]

export const getAllBuiltinPlugins = (core: EditorCore) => {
  return builtinPluginConstructors.map((constructor) => constructor(core))
}
