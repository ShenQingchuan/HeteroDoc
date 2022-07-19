<script lang="ts" setup>
import type { EditorCore } from '@hetero/editor'

defineProps<{
  editorCore?: EditorCore
}>()

const editorStore = useEditorStore()
const { selection, rects } = useTextSelection()
watch(
  reactive({ selection, rects }),
  ({ selection, rects }) => {
    const nothingSelected = selection?.isCollapsed
    if (nothingSelected) {
      editorStore.setShowEditorMenu(false)
    }
    else {
      editorStore.setSelectionPosition(
        rects[0]!.left,
        rects[0]!.top,
      )
      nextTick(() => {
        editorStore.setShowEditorMenu(true)
      })
    }
  },
)
</script>

<template>
  <teleport to="body">
    <transition name="float-slide-fade">
      <div
        v-show="editorStore.isShowEditorMenu"
        class="hetero-editor__float-menu"
        :style="{
          position: 'absolute',
          left: `${editorStore.selectionNodeLeft}px`,
          top: `${editorStore.popoverTop}px`,
          zIndex: 99,
        }"
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
        <n-divider vertical />
        <n-button class="hetero-editor__float-menu-item hyperlink" quaternary p-x-1 @click="editorStore.setShowLinkEdit(true)">
          <template #icon>
            <n-icon><div i-ic:round-link mr1 /></n-icon>
          </template>
        </n-button>
      </div>
    </transition>
  </teleport>
</template>
