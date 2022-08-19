import type { EditorCore } from '@hetero/editor'
import { TypeEvent } from '@hetero/shared'

export const editorEventBus = new TypeEvent<{
  editorMounted: {
    core: EditorCore
    editorDOM: HTMLElement
  }
}>()
