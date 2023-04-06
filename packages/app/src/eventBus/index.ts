import { TypeEvent } from '@hetero/shared'
import type { EditorCore } from '@hetero/editor'

export const editorEventBus = new TypeEvent<{
  editorMounted: {
    core: EditorCore
    editorDOM: HTMLElement
  }
  dragStart: null
  dropEnd: null
}>()
