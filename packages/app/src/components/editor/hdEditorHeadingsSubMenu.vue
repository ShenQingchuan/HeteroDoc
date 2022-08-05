<script lang="ts" setup>
import type { EditorCore } from '@hetero/editor'
import type { ShallowRef } from 'vue'
import { EditorProvideKey, FloatMenuHeadingSubMenuStyleDark, FloatMenuHeadingSubMenuStyleLight } from '../../constants/editor'

const naiveUITheme = useNaiveThemeSetup()
const env = useEnvStore()
const editorCore = inject<ShallowRef<EditorCore>>(EditorProvideKey)
const headingSubMenuStyle = computed((): Partial<CSSStyleDeclaration> => {
  return {
    padding: '0',
    ...env.isDark
      ? FloatMenuHeadingSubMenuStyleLight
      : FloatMenuHeadingSubMenuStyleDark,
  }
})
const runToggleHeading = (level: number) => {
  editorCore?.value.cmdManager.chain.focus().toggleHeading({ level }).run()
}
</script>

<template>
  <n-config-provider :theme="naiveUITheme" abstract>
    <n-tooltip :show-arrow="false" trigger="hover" :style="headingSubMenuStyle">
      <template #trigger>
        <n-button class="hetero-editor__float-menu-item heading" quaternary p-x-1>
          <template #icon>
            <n-icon><div i-gridicons:heading mr1 /></n-icon>
          </template>
        </n-button>
      </template>
      <div flex-items-center p1 bg-base>
        <n-button class="hetero-editor__float-menu-item heading-1" quaternary mr2 p1 @click="runToggleHeading(1)">
          <template #icon>
            <n-icon><div i-gridicons:heading-h1 txt-color-base /></n-icon>
          </template>
        </n-button>
        <n-button class="hetero-editor__float-menu-item heading-2" quaternary mr2 p1 @click="runToggleHeading(2)">
          <template #icon>
            <n-icon><div i-gridicons:heading-h2 txt-color-base /></n-icon>
          </template>
        </n-button>
        <n-button class="hetero-editor__float-menu-item heading-3" quaternary mr2 p1 @click="runToggleHeading(3)">
          <template #icon>
            <n-icon><div i-gridicons:heading-h3 txt-color-base /></n-icon>
          </template>
        </n-button>
        <n-button class="hetero-editor__float-menu-item heading-4" quaternary mr2 p1 @click="runToggleHeading(4)">
          <template #icon>
            <n-icon><div i-gridicons:heading-h4 txt-color-base /></n-icon>
          </template>
        </n-button>
        <n-button class="hetero-editor__float-menu-item heading-5" quaternary mr2 p1 @click="runToggleHeading(5)">
          <template #icon>
            <n-icon><div i-gridicons:heading-h5 txt-color-base /></n-icon>
          </template>
        </n-button>
      </div>
    </n-tooltip>
  </n-config-provider>
</template>
