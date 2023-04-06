<script setup lang="ts">
import { editorEventBus } from '../../eventBus'

const editorStore = useEditorStore()
const isShowDropCursor = ref(false)
const dropCursorWidth = ref(0)
const dropCursorClientX = ref(0)
const dropCursorClientY = ref(0)

const setRectForDropCursor = (rect: DOMRect, isAppend?: boolean) => {
  const { left, top, width, height } = rect
  dropCursorWidth.value = width
  dropCursorClientX.value = left
  dropCursorClientY.value = isAppend ? top + height : top
}

editorEventBus.on('editorMounted', ({ core }) => {
  core.on('dragBlock', ({ hoverBlockRect }) => {
    isShowDropCursor.value = true
    setRectForDropCursor(hoverBlockRect)
  })
  core.on('dragMoving', ({ hoverElement, isAppend = false }) => {
    editorStore.setDropToAppend(isAppend)
    if (hoverElement) {
      editorStore.setDraggingOverElement(hoverElement)
      setRectForDropCursor(hoverElement.getBoundingClientRect(), isAppend)
    }
  })
})
editorEventBus.on('dropEnd', () => {
  isShowDropCursor.value = false
  editorStore.setDraggingOverElement(null)
})
</script>

<template>
  <teleport to="body">
    <div
      v-show="isShowDropCursor"
      class="heterodoc-drop-cursor h2px"
      :style="{
        width: `${dropCursorWidth}px`,
        left: `${dropCursorClientX}px`,
        top: `${dropCursorClientY}px`,
      }"
    />
  </teleport>
</template>

<style scoped>
.heterodoc-drop-cursor {
  background: var(--heterodoc-drop-cursor-color);
  position: absolute;
  z-index: 9999;
  transform: 'translate(-50%, -50%)';
  pointer-events: 'none';
  transition: all 0.2s ease-in-out;
}
</style>
