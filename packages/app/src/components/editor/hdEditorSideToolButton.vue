<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components'
import { editorEventBus } from '../../eventBus'

const sideToolBtn = ref<HTMLElement | null>(null)

const {
  isSideToolBtnShow,
  sideToolBtnTop,
  sideToolBtnLeft,
  isSideToolMenuShow,
  hoverNodePos,
  menuOptions,
  handleMenuClick,
} = useSideToolMenu()

const onSideToolBtnHover = () => {
  isSideToolBtnShow.value = true
}
const hideSideToolBtn = () => {
  isSideToolBtnShow.value = false
}
useEventListener(sideToolBtn, 'mouseover', onSideToolBtnHover)
editorEventBus.on('editorMounted', ({ core, editorDOM }) => {
  core.on('activateSideToolBtn', ({ left, top, pos }) => {
    isSideToolBtnShow.value = true
    hoverNodePos.value = pos
    sideToolBtnLeft.value = left
    sideToolBtnTop.value = top
  })
  core.on('beforeDispatchTransaction', ({ tr }) => {
    if (tr.getMeta('pointer') === true) {
      return
    }
    hideSideToolBtn()
  })
  useEventListener(editorDOM, 'mouseleave', hideSideToolBtn)
})
</script>

<template>
  <teleport to="body">
    <transition name="float-slide-fade">
      <n-button
        v-show="isSideToolBtnShow"
        ref="sideToolBtn"
        circle
        secondary bg="cool-gray-300/50 dark:cool-gray-500/50"
        border="neutral-400/50 solid 1px"
        class="hetero-editor__side-toolbar-btn"
        :style="{
          top: `${sideToolBtnTop}px`,
          left: `${sideToolBtnLeft}px`,
        }"
        @click="isSideToolMenuShow = true"
      >
        <template #icon>
          <n-icon size="24">
            <div i-carbon:add />
          </n-icon>
        </template>
      </n-button>
    </transition>
  </teleport>
  <!-- show menu contains input-fastpath but with more actions -->
  <teleport to="body">
    <transition name="float-slide-fade">
      <div
        v-show="isSideToolMenuShow" v-on-click-outside="() => {
          isSideToolMenuShow = false
        }"
        border="1px solid neutral-400/50"
        bg="neutral-100 dark:neutral-700"
        border-rounded w140px
        :style="{
          top: `${sideToolBtnTop}px`,
          left: `${sideToolBtnLeft}px`,
        }"
        class="hetero-editor__side-toolbar-menu"
      >
        <div
          v-for="option in menuOptions"
          :key="option.key"
          class="hetero-editor__side-toolbar-menu-item" flex="~ items-center"
          cursor-pointer mx1 my1.5 px3 pt1.5 pb2 border-rounded text="dark:white"
          hover="bg-neutral-400/40"
          @click="() => {
            handleMenuClick(option.key);
          }"
        >
          <div :class="option.icon" text-5 />
          <div ml-2>
            {{ option.label }}
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped lang="less">
.hetero-editor__side-toolbar-btn {
  position: absolute;
  width: 24px;
  height: 24px;
  transform: translateX(-150%);
  transition: all 0.1s ease;
}
.hetero-editor__side-toolbar-menu {
  position: absolute;
  width: 200px;
  transition: all 0.1s ease;

  .hetero-editor__side-toolbar-menu-item:first-child {
    margin-bottom: 0;
  }
  .hetero-editor__side-toolbar-menu-item:last-child {
    margin-top: 0;
  }
}
</style>
