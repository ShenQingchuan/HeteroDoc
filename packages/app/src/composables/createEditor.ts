import { EditorCore } from '@hetero/editor'
import { EditorProvideKey } from '../constants/editor'
import type { Ref } from 'vue'

export function createHeteroEditor(
  ...args: ConstructorParameters<typeof EditorCore>
) {
  // TODO: more configuration on creating an editor core.
  const editorCore = new EditorCore(...args)
  Object.assign(window, { editorCore }) // for dev test

  return editorCore
}

export function useEditorCoreInject() {
  return inject<Ref<EditorCore>>(EditorProvideKey)
}

export function startReflectActiveState(editorCore: EditorCore) {
  const editorStore = useEditorStore()
  const computeActiveState = () => {
    Object.keys(editorStore.menuActiveState).forEach((key) => {
      const markName = key as keyof typeof editorStore.menuActiveState
      editorStore.menuActiveState[markName] =
        editorCore.activeManager.isActive(markName)
    })
  }
  const computeAvailableState = () => {
    editorStore.menuAvailableState.hyperlink = Boolean(
      editorCore.activeManager.isHyperlinkAvailable()
    )
  }
  editorCore.on('dispatchedTransaction', () => {
    computeActiveState()
    computeAvailableState()
  })
}
