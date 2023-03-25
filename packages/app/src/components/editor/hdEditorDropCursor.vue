<script setup lang="ts">
import { editorEventBus } from '../../eventBus'

const isShowDropCursor = ref(false)
const dropCursorWidth = ref(0)
const dropCursorClientX = ref(0)
const dropCursorClientY = ref(0)

editorEventBus.on('editorMounted', ({ core, editorDOM }) => {
  core.on('dragBlock', () => {
    isShowDropCursor.value = true
  })
  core.on('dropBlock', () => {
    isShowDropCursor.value = false
  })
  core.on('dragMoving', ({ hoverElement, hoverNodePos }) => {
    if (hoverElement) {
      const { left, top, width } = hoverElement.getBoundingClientRect()
      dropCursorWidth.value = width
      dropCursorClientX.value = left
      dropCursorClientY.value = top
    }
  })
})
</script>

<template>
  <teleport to="body">
    <div
      v-show="isShowDropCursor" class="heterodoc-drop-cursor h2px" :style="{
        width: `${dropCursorWidth}px`,
        left: `${dropCursorClientX}px`,
        top: `${dropCursorClientY}px`,
      }"
    />
  </teleport>
</template>

<style scoped>
.heterodoc-drop-cursor {
  background: rgb(221, 238, 255);
  position: absolute;
  z-index: 9999;
  transform: 'translate(-50%, -50%)';
  pointer-events: 'none';
  transition: all 0.2s ease-in-out;
}
</style>
