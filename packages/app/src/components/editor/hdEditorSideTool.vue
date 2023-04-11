<script setup lang="ts">
import { SIDE_BTN_GAP } from '../../constants/editor'
import { editorEventBus } from '../../eventBus'

const {
  sideDragBtn,
  sideToolMenu,
  isDisableSideBtnMoving,
  isShowHoverElementBouding,
  isSideToolBtnShow,
  isSideToolMenuShow,
  sideToolBtnTop,
  sideToolBtnLeft,
  hoverNodePos,
  hoveringBlockElement,
  hoveringBlockElementRect,
  hoveringLayerWidth,
  hoveringLayerExtraWidth,
  menuOptions,
  handleMenuClick,
  controlSideToolStatusForEditorDOMArea,
} = useSideToolMenu()

editorEventBus.on('editorMounted', ({ core, editorDOM }) => {
  core.on(
    'activateSideBtns',
    ({ left, width, hoverCtx: { pos, hoveredBlockElement } }) => {
      if (isDisableSideBtnMoving.value) {
        return
      }

      const hoverBlockRect = hoveredBlockElement.getBoundingClientRect()
      isSideToolBtnShow.value = true
      hoverNodePos.value = pos
      hoveringBlockElement.value = hoveredBlockElement
      hoveringBlockElementRect.value = hoverBlockRect
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
            left: `${sideToolBtnLeft + SIDE_BTN_GAP}px`,
          }"
        >
          <template #icon>
            <n-icon size="24">
              <div i-ph:dots-six-vertical-bold />
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
        display: isShowHoverElementBouding ? 'block' : 'none',
        width: `calc(${hoveringLayerWidth + 8}px ${
          hoveringLayerExtraWidth ?? ''
        })`,
        height: `${hoveringBlockElementRect.height + 4}px`,
        transform: hoveringLayerExtraWidth
          ? `translateX(-${hoveringLayerExtraWidth})`
          : undefined,
        left: `${hoveringBlockElementRect.x - 4}px`,
        top: `${hoveringBlockElementRect.y - 2}px`,
      }"
    />
  </teleport>
</template>

<style scoped lang="less">
.hetero-editor__side-btn {
  position: absolute;
  width: 18px;
  height: 24px;
  transform: translateX(-3.5rem);
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
