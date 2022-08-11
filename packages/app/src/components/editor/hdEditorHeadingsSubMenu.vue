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
  editorCore?.value.commands.toggleHeading({ level })
}
</script>

<template>
  <n-config-provider :theme="naiveUITheme" abstract>
    <n-tooltip :show-arrow="false" trigger="hover" placement="bottom" :style="headingSubMenuStyle">
      <template #trigger>
        <n-button class="hetero-editor__float-menu-item heading" quaternary px1>
          <template #icon>
            <n-icon><div i-ci:heading mr1 /></n-icon>
          </template>
        </n-button>
      </template>
      <div flex-items-center p1 bg-base>
        <n-button class="hetero-editor__float-menu-item paragraph" quaternary m="r0.5" p1 @click="runToggleHeading(0)">
          <template #icon>
            <n-icon><div i-ci:paragraph txt-color-base /></n-icon>
          </template>
        </n-button>
        <n-button class="hetero-editor__float-menu-item heading-1" quaternary m="r0.5" p1 @click="runToggleHeading(1)">
          <template #icon>
            <n-icon><div i-ci:heading-h1 txt-color-base /></n-icon>
          </template>
        </n-button>
        <n-button class="hetero-editor__float-menu-item heading-2" quaternary m="r0.5" p1 @click="runToggleHeading(2)">
          <template #icon>
            <n-icon><div i-ci:heading-h2 txt-color-base /></n-icon>
          </template>
        </n-button>
        <n-button class="hetero-editor__float-menu-item heading-3" quaternary m="r0.5" p1 @click="runToggleHeading(3)">
          <template #icon>
            <n-icon><div i-ci:heading-h3 txt-color-base /></n-icon>
          </template>
        </n-button>
        <n-button class="hetero-editor__float-menu-item heading-4" quaternary m="r0.5" p1 @click="runToggleHeading(4)">
          <template #icon>
            <n-icon><div i-ci:heading-h4 txt-color-base /></n-icon>
          </template>
        </n-button>
        <n-button class="hetero-editor__float-menu-item heading-5" quaternary m="r0.5" p1 @click="runToggleHeading(5)">
          <template #icon>
            <n-icon><div i-ci:heading-h5 txt-color-base /></n-icon>
          </template>
        </n-button>
      </div>
    </n-tooltip>
  </n-config-provider>
</template>
