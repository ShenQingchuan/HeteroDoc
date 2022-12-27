<script setup lang="ts">
import { editorEventBus } from '../../eventBus'

const isSideToolbarShow = ref(false)
const sideToolBtnTop = ref(0)
const sideToolBtnLeft = ref(0)
const sideToolBtn = ref<HTMLElement | null>(null)

const onSideToolBtnHover = () => {
  isSideToolbarShow.value = true
}
const hideSideToolBtn = () => {
  isSideToolbarShow.value = false
}
useEventListener(sideToolBtn, 'mouseover', onSideToolBtnHover)
editorEventBus.on('editorMounted', ({ core, editorDOM }) => {
  core.on('activateSideToolBtn', ({ left, top }) => {
    isSideToolbarShow.value = true
    sideToolBtnLeft.value = left
    sideToolBtnTop.value = top
  })
  useEventListener(editorDOM, 'mouseleave', hideSideToolBtn)
})
</script>

<template>
  <teleport to="body">
    <transition name="float-slide-fade">
      <n-button
        v-show="isSideToolbarShow"
        ref="sideToolBtn"
        circle
        secondary bg="cool-gray-300/50 dark:cool-gray-500/50"
        border="neutral-400/50 solid 1px"
        class="hetero-editor__side-toolbar-btn"
        :style="{
          top: `${sideToolBtnTop}px`,
          left: `${sideToolBtnLeft}px`,
        }"
      >
        <template #icon>
          <n-icon size="24">
            <div i-carbon:add />
          </n-icon>
        </template>
      </n-button>
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
</style>
