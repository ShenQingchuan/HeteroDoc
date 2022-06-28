import { EditorCore } from '@hetero/editor'

export function useHeteroEditor(...args: ConstructorParameters<typeof EditorCore>) {
  // TODO: more configuration on creating an editor core.
  const editorCore = new EditorCore(...args)
  Object.assign(window, { editorCore })
  return editorCore
}
