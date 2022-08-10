import { EditorCore } from '@hetero/editor'
import type { Ref } from 'vue'
import { EditorProvideKey } from '../constants/editor'

export function useHeteroEditor(...args: ConstructorParameters<typeof EditorCore>) {
  const editorStore = useEditorStore()

  // TODO: more configuration on creating an editor core.
  const editorCore = new EditorCore(...args)
  Object.assign(window, { editorCore }) // for dev test

  const computeActiveState = () => {
    Object.keys(editorStore.menuActiveState).forEach((key) => {
      const markName = key as keyof typeof editorStore.menuActiveState
      editorStore.menuActiveState[markName]
        = Boolean(editorCore.activeManager.isActive(markName))
    })
  }
  const computeAvailableState = () => {
    editorStore.menuAvailableState.hyperlink = editorCore.activeManager.isHyperlinkAvailable()
  }
  editorCore.on('dispatchedTransaction', () => {
    computeActiveState()
    computeAvailableState()
  })

  return editorCore
}

export function useEditorCoreInject() {
  const editorCore = inject<Ref<EditorCore>>(EditorProvideKey)
  return editorCore
}
