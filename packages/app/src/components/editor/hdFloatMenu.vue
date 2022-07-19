<script lang="ts" setup>
import type { EditorCore } from '@hetero/editor'

defineProps<{
  editorCore?: EditorCore
}>()

const { selection, rects } = useTextSelection()
const isSomethingSelected = ref(false)
const selectionNodeLeft = ref(0)
const selectionNodeTop = ref(0)
watch(
  reactive({ selection, rects }),
  ({ selection: nowSelection, rects: nowRects }) => {
    const nothingSelected = nowSelection?.isCollapsed
    if (nothingSelected) {
      isSomethingSelected.value = false
    }
    else {
      selectionNodeLeft.value = nowRects[0]!.left
      selectionNodeTop.value = nowRects[0]!.top
      nextTick(() => {
        isSomethingSelected.value = true
      })
    }
  },
)
</script>

<template>
  <teleport to="body">
    <transition name="editor-float-menu-slide-fade">
      <div
        v-show="isSomethingSelected"
        class="hetero-editor__float-menu"
        :style="{ position: 'absolute', left: `${selectionNodeLeft}px`, top: `${selectionNodeTop + 30}px`, zIndex: 99 }"
        flex-items-center justify-center p-y-1 p-x-2 border-base bg-base border-round
      >
        <n-button class="hetero-editor__float-menu-item bold" quaternary p-x-1 @click="editorCore?.cmdManager.chain.focus().toggleBold().run()">
          <template #icon>
            <n-icon><div i-ic:round-format-bold mr1 /></n-icon>
          </template>
        </n-button>
        <n-button class="hetero-editor__float-menu-item italic" quaternary p-x-1 @click="editorCore?.cmdManager.chain.focus().toggleItalic().run()">
          <template #icon>
            <n-icon><div i-ic:round-format-italic mr1 /></n-icon>
          </template>
        </n-button>
        <n-button class="hetero-editor__float-menu-item code" quaternary p-x-1 @click="editorCore?.cmdManager.chain.focus().toggleCode().run()">
          <template #icon>
            <n-icon><div i-ic:round-code mr1 /></n-icon>
          </template>
        </n-button>
        <n-button class="hetero-editor__float-menu-item underline" quaternary p-x-1 @click="editorCore?.cmdManager.chain.focus().toggleUnderline().run()">
          <template #icon>
            <n-icon><div i-ic:round-format-underlined mr1 /></n-icon>
          </template>
        </n-button>
        <n-button class="hetero-editor__float-menu-item deleteLine" quaternary p-x-1 @click="editorCore?.cmdManager.chain.focus().toggleDeleteLine().run()">
          <template #icon>
            <n-icon><div i-ic:round-format-strikethrough mr1 /></n-icon>
          </template>
        </n-button>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.editor-float-menu-slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.editor-float-menu-slide-fade-leave-active {
  transition: all 0.3s ease-out;
}
.editor-float-menu-slide-fade-enter-from,
.editor-float-menu-slide-fade-leave-to {
  transform: translateY(4px);
  opacity: 0;
}
</style>
