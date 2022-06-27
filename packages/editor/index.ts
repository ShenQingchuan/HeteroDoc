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

export function useHeteroEditor(...args: ConstructorParameters<typeof EditorCore>) {
  // TODO: more configuration on creating an editor core.
  const editorCore = new EditorCore(...args)
  Object.assign(window, { editorCore })
  return editorCore
}
