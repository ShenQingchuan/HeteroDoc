<script lang="ts" setup>
import type { EditorCore } from '@hetero/editor'
import {
  EditorFloatMenuAction,
  FloatMenuShowTimingGap,
  FloatMenuZIndex,
} from '../../constants/editor'

defineProps<{
  editorCore?: EditorCore
}>()

const editorStore = useEditorStore()
const { selection, rects, text } = useTextSelection()

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
        <hdEditorHeadingsSubMenu />
        <n-divider vertical />
        <n-button
          class="hetero-editor__float-menu-item bold" quaternary px1 mx1 :class="{ active: editorStore.menuActiveState.bold }"
          @click="editorCore?.cmdManager.chain.focus().toggleBold().run()"
        >
          <template #icon>
            <n-icon><div i-ic:round-format-bold mr1 /></n-icon>
          </template>
        </n-button>
        <n-button
          class="hetero-editor__float-menu-item italic" quaternary px1 mx1 :class="{ active: editorStore.menuActiveState.italic }"
          @click="editorCore?.cmdManager.chain.focus().toggleItalic().run()"
        >
          <template #icon>
            <n-icon><div i-ic:round-format-italic mr1 /></n-icon>
          </template>
        </n-button>
        <n-button
          class="hetero-editor__float-menu-item code" quaternary px1 mx1 :class="{ active: editorStore.menuActiveState.code }"
          @click="editorCore?.cmdManager.chain.focus().toggleCode().run()"
        >
          <template #icon>
            <n-icon><div i-ic:round-code mr1 /></n-icon>
          </template>
        </n-button>
        <n-button
          class="hetero-editor__float-menu-item underline" quaternary px1 mx1 :class="{ active: editorStore.menuActiveState.underline }"
          @click="editorCore?.cmdManager.chain.focus().toggleUnderline().run()"
        >
          <template #icon>
            <n-icon><div i-ic:round-format-underlined mr1 /></n-icon>
          </template>
        </n-button>
        <n-button
          class="hetero-editor__float-menu-item deleteLine" quaternary px1 mx1 :class="{ active: editorStore.menuActiveState.deleteLine }"
          @click="editorCore?.cmdManager.chain.focus().toggleDeleteLine().run()"
        >
          <template #icon>
            <n-icon><div i-ic:round-format-strikethrough mr1 /></n-icon>
          </template>
        </n-button>
        <n-divider vertical />
        <n-button
          class="hetero-editor__float-menu-item hyperlink" quaternary px1 mx1
          :disabled="!editorStore.menuAvailableState.hyperlink"
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

<style>
.hetero-editor__float-menu-item.active {
  background-color: rgba(46, 51, 56, 0.09);
}
.dark .hetero-editor__float-menu-item.active {
  background-color: rgba(255, 255, 255, 0.12);
}
</style>
