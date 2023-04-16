<script setup lang="ts">
import { SIDE_BTN_OFFSET } from '../../constants/editor'
import { editorEventBus } from '../../eventBus'

const {
  sideDragBtn,
  sideToolMenu,
  isDisableSideBtnMoving,
  isSideToolBtnShow,
  isSideToolMenuShow,
  sideToolBtnTop,
  sideToolBtnLeft,
  hoverNodePos,
  hoveringBlockElement,
  hoveringBlockElementRect,
  hoveringLayerWidth,
  menuOptions,
  handleMenuClick,
  controlSideToolStatusForEditorDOMArea,
} = useSideToolMenu()

editorEventBus.on('editorMounted', ({ core, editorDOM }) => {
  core.on(
    'activateSideBtns',
    async ({ left, width, hoverCtx: { pos, hoveredBlockElement } }) => {
      if (isDisableSideBtnMoving.value) {
        return
      }
      isSideToolBtnShow.value = true
      hoverNodePos.value = pos
      hoveringBlockElement.value = hoveredBlockElement
      await nextTick()
      hoveringLayerWidth.value = width
      sideToolBtnLeft.value = left
    }
  )
  controlSideToolStatusForEditorDOMArea(editorDOM)
})
</script>

<template>
  <teleport to="body">
    <transition name="float-slide-fade">
      <div v-show="isSideToolBtnShow" class="flex items-center">
        <n-button
          ref="sideDragBtn"
          quaternary
          bg="hover:cool-gray-300/50 hover:dark:cool-gray-500/50"
          border-none
          class="hetero-editor__side-btn"
          :style="{
            top: `${sideToolBtnTop}px`,
            left: `calc(${sideToolBtnLeft}px + ${SIDE_BTN_OFFSET}px)`,
          }"
        >
          <template #icon>
            <n-icon size="24">
              <div i-fluent:re-order-dots-vertical-20-filled />
            </n-icon>
          </template>
        </n-button>
      </div>
    </transition>
  </teleport>
  <!-- show menu contains input-fastpath but with more actions -->
  <teleport to="body">
    <transition name="float-slide-fade">
      <div
        v-show="isSideToolMenuShow"
        ref="sideToolMenu"
        border="1px solid neutral-400/50"
        editor-float-card
        border-rounded
        w-auto
        :style="{
          top: `${sideToolBtnTop}px`,
          left: `${sideToolBtnLeft}px`,
        }"
        class="hetero-editor__side-toolbar-menu"
      >
        <div
          v-for="option in menuOptions"
          :key="option.key"
          class="hetero-editor__side-toolbar-menu-item"
          flex="~ items-center"
          cursor-pointer
          mx1
          px3
          my="1"
          pt="1.5"
          pb1
          border-rounded
          text="dark:white"
          hover="bg-neutral-400/40"
          @click="
            () => {
              handleMenuClick(option.key)
            }
          "
        >
          <div :class="option.icon" text-4 />
          <div ml-2>
            {{ option.label }}
          </div>
        </div>
      </div>
    </transition>
  </teleport>
  <!-- show a highlight layer over the side tool target element -->
  <teleport to="body">
    <div
      v-if="hoveringBlockElementRect"
      class="hetero-editor__side-tool-target-bounding"
      pointer-events-none
      fixed
      border-rounded
      border="1 sky-700/50"
      bg="sky-200/50"
      :style="{
        display: isSideToolMenuShow ? 'block' : 'none',
        width: `${hoveringLayerWidth + 8}px`,
        height: `${hoveringBlockElementRect.height + 2}px`,
        left: `${hoveringBlockElementRect.x - 2}px`,
        top: `${hoveringBlockElementRect.y - 1}px`,
      }"
    />
  </teleport>
</template>

<style scoped lang="less">
.hetero-editor__side-btn {
  position: absolute;
  width: 18px;
  height: 24px;
  transform: translateX(-50%);
  transition: all 0.1s ease;
  padding: 0 !important;
}
.hetero-editor__side-toolbar-menu {
  position: absolute;
  width: auto;
  transition: all 0.1s ease;
  z-index: 99;
  transform: translateX(-120%);

  .hetero-editor__side-toolbar-menu-item:first-child {
    margin-bottom: 0;
  }
  .hetero-editor__side-toolbar-menu-item:last-child {
    margin-top: 0;
  }
}
.hetero-editor__side-tool-target-bounding {
  z-index: 9;
}
</style>
