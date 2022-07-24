<script lang="ts" setup>
import type { EditorCore } from '@hetero/editor'
import {
  EditorFloatMenuAction,
  FloatMenuShowTimingGap,
  FloatMenuZIndex,
} from '../../constants/editor'

const props = defineProps<{
  editorCore?: EditorCore
}>()

const editorStore = useEditorStore()
const { selection, rects, text } = useTextSelection()
const isHyperlinkActive = ref(false)

const onHyperlinkBtnClick = () => {
  const left = rects.value[0]!.left
  const top = rects.value[0]!.top
  editorStore
    .setFloatMenuPosition(
      { left, top },
      EditorFloatMenuAction.BySelection,
    )
    .setLinkEditText(text.value)
    .setShowLinkEdit(true)
}
const openEditorMenu = useDebounceFn((pos: { left: number; top: number }) => {
  editorStore.setFloatMenuPosition(pos, EditorFloatMenuAction.BySelection)
  nextTick(() => {
    editorStore
      .setShowLinkEdit(false)
      .setShowEditorMenu(true)
  })
}, FloatMenuShowTimingGap)
const computeIsHyperlinkActive = () => {
  isHyperlinkActive.value = Boolean(props.editorCore?.activeManager.isHyperlinkActive())
}

watch(
  reactive({ selection, rects }),
  ({ selection, rects }) => {
    const nothingSelected = selection?.isCollapsed
    if (nothingSelected) {
      editorStore.isShowEditorMenu && editorStore.setShowEditorMenu(false)
    }
    else {
      openEditorMenu({
        left: rects[0]!.left,
        top: rects[0]!.top,
      })
    }
  },
)
</script>

<template>
  <teleport to="body">
    <transition
      name="float-slide-fade"
      @before-enter="isHyperlinkActive = Boolean(props.editorCore?.activeManager.isHyperlinkActive())"
    >
      <div
        v-show="editorStore.isShowEditorMenu"
        class="hetero-editor__float-menu"
        :style="{
          position: 'absolute',
          left: `${editorStore.floatTargetNodeLeft}px`,
          top: `${editorStore.popoverTop}px`,
          zIndex: FloatMenuZIndex,
        }"
        flex-items-center justify-center py1 px2 border-base bg-base border-round
      >
        <hdEditorHeadingsSubMenu @compute-is-hyperlink-active="computeIsHyperlinkActive" />
        <n-divider vertical />
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
        <n-button
          class="hetero-editor__float-menu-item hyperlink" quaternary p-x-1
          :disabled="!isHyperlinkActive"
          @click="onHyperlinkBtnClick"
        >
          <template #icon>
            <n-icon><div i-ic:round-link mr1 /></n-icon>
          </template>
        </n-button>
      </div>
    </transition>
  </teleport>
</template>
