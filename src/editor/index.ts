import type { EditorOptions } from './core'
import type { IEditorExtension } from './extensions'
import { EditorCore } from './core'

export {
  EditorCore,
} from './core'
export type {
  EditorCoreEvent,
  EditorOptions,
} from './core'

export type {
  IEditorExtension,
} from './extensions'

export function useHeteroEditor(options: EditorOptions, extensions: IEditorExtension[] = []) {
  // TODO: more configuration on creating an editor core.
  const editorCore = new EditorCore(options, extensions)
  Object.assign(window, { editorCore })
  return editorCore
}
