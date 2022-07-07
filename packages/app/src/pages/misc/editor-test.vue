<script lang="ts" setup>
import type { EditorCore } from '@hetero/editor'
import { useHeteroEditor } from '../../composables/useHeteroEditor'

const { t } = useI18n()
const envStore = useEnvStore()
const themeModeText = useThemeModeText()
const editorRef = templateRef<HTMLElement | null>('editor')
const editor = ref<EditorCore>()

onMounted(() => {
  const editorMountPoint = editorRef.value
  if (editorMountPoint) {
    editor.value = useHeteroEditor({
      container: editorMountPoint,
      isReadOnly: false,
      autofocus: true,
    }, {
      fromKeys: ['bold', 'italic'],
    })
  }
})
</script>

<template>
  <div
    class="page-misc__editor-test"
    bg-base flex-col items-center justify-center
    w100vw min-h-100vh p-y-10
  >
    <div
      class="page-misc__editor-test__settings"
      flex-items-center justify-center m-y-4
    >
      <n-button m-x-4 @click="envStore.toggleDark()">
        <div v-if="envStore.isDark" i-carbon-moon text-6 mr2 font-light />
        <div v-else i-carbon-light text-6 mr2 font-light />
        <span>{{ themeModeText }}</span>
      </n-button>
      <n-button quaternary p-x-1 @click="editor?.cmdManager.chain.focus().toggleBold().run()">
        <template #icon>
          <n-icon><div i-ic:round-format-bold mr1 /></n-icon>
        </template>
      </n-button>
      <n-button quaternary p-x-1 @click="editor?.cmdManager.chain.focus().toggleItalic().run()">
        <template #icon>
          <n-icon><div i-ic:round-format-italic mr1 /></n-icon>
        </template>
      </n-button>
    </div>
    <div
      class="page-misc__editor-test-container"
      w80vw m-x-auto
      border-base border-rounded
    >
      <div
        ref="editor"
        class="page-misc__editor-test-mount-point"
        p-12 bg="neutral-200/50 dark:neutral-600/70"
      />
    </div>
  </div>
</template>

<style lang="less">
:root {
  --heterodoc-editor-color: rgba(0,0,0,0.85);
  --heterodoc-caret-color: rgba(0,0,0,0.85);
}
:root.dark {
  --heterodoc-editor-color: rgba(255,255,255,0.85);
  --heterodoc-caret-color: rgba(255,255,255,0.85);
}

.ProseMirror {
  min-height: 600px;
  outline: none;
  @media screen and (max-width: 768px) {
    min-height: 300px;
  }

  color: var(--heterodoc-editor-color);
  caret-color: var(--heterodoc-caret-color);
}
</style>
