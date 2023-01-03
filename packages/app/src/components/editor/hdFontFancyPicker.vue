<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components'
const { t } = useI18n()

const editorCore = useEditorCoreInject()
const editorStore = useEditorStore()
const {
  rerenderKey,
  fontFancyBtnRef,
  fontFancyBtnBounding,
  fontColorSetByTheme,
  fontBgColorSetByTheme,
  getMenuIconStyleFromActiveFontFancy,
} = useFontFancyPicker()
</script>

<template>
  <n-button
    ref="fontFancyBtnRef"
    :key="rerenderKey"
    class="hetero-editor__float-menu-item fontColor"
    px1 mx0.25 quaternary
    @click="() => editorStore.setShowFontFancyPicker(true)"
  >
    <div p0.25 :style="getMenuIconStyleFromActiveFontFancy(editorCore)">
      <div i-gridicons:text-color text-4 />
    </div>
  </n-button>
  <teleport to="body">
    <transition
      name="float-slide-fade"
    >
      <div
        v-show="editorStore.isShowFontFancyPicker"
        v-on-click-outside="() => editorStore.setShowFontFancyPicker(false)"
        class="hetero-editor__font-fancy-picker"
        absolute border="1 neutral-700/50 rounded"
        editor-float-card z-99 py1 px2
        :style="{
          left: `${fontFancyBtnBounding.left.value + 4}px`,
          top: `${fontFancyBtnBounding.bottom.value + 4}px`,
        }"
      >
        <p text="yellow-600 dark:yellow-400" text-2 border-b="1 solid neutral-300" mb2 pb1>
          TIPS: {{ t('editor.menu.fontfancy-picker-title-tips') }}
        </p>
        <div text-2 mb1 text="neutral-600 dark:neutral-300">
          {{ t('editor.menu.fontfancy-picker-title-textcolor') }}
        </div>
        <div class="hetero-editor__font-fancy-picker-text-color-grid" mb2>
          <n-button
            v-for="(fontColor, i) in fontColorSetByTheme"
            :key="fontColor" p0 w24px h24px
            size="tiny" mr1 mb1 bg="white dark:black"
            @click="() => {
              editorCore?.commands.setFontColor({ colorIndex: i })
              editorStore
                .setShowFontFancyPicker(false)
                .setShowEditorMenu(false)
            }"
          >
            <template #icon>
              <n-icon size="16">
                <div i-icomoon-free:text-color :style="{ color: fontColor }" />
              </n-icon>
            </template>
          </n-button>
        </div>
        <div text-2 mb1 text="neutral-600 dark:neutral-300">
          {{ t('editor.menu.fontfancy-picker-title-bgcolor') }}
        </div>
        <div class="hetero-editor__font-fancy-picker-text-color-grid" mb2>
          <n-button
            v-for="(bgColor, i) in fontBgColorSetByTheme"
            :key="bgColor" p0 w24px h24px
            size="tiny" mr1 mb1 bg="white dark:black"
            :style="{ backgroundColor: bgColor }"
            @click="() => {
              editorCore?.commands.setFontBgColor({ bgColorIndex: i })
              editorStore
                .setShowFontFancyPicker(false)
                .setShowEditorMenu(false)
            }"
          >
            <template #icon>
              <n-icon size="16">
                <div i-icomoon-free:text-color />
              </n-icon>
            </template>
          </n-button>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped lang="less">
.hetero-editor__font-fancy-picker {
  &-text-color-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(2, 1fr);
  }
}
</style>
