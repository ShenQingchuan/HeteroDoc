<script lang="ts" setup>
import type { EditorCore } from '@hetero/editor'
import { EditorProvideKey } from '../../constants/editor'
import { composeExtensions } from './composeExtensions'

const naiveUITheme = useNaiveThemeSetup()
const envStore = useEnvStore()
const themeModeText = useThemeModeText()
const editorRef = templateRef<HTMLElement | null>('editor')
const editorCore = shallowRef<EditorCore>()

provide(EditorProvideKey, editorCore)

onMounted(() => {
  const container = editorRef.value!
  editorCore.value = useHeteroEditor({
    container,
    isReadOnly: false,
    autofocus: true,
  }, {
    extensions: core => composeExtensions(core),
  })
  container
    .querySelector('.ProseMirror')
    ?.setAttribute('spellcheck', 'false')
})
</script>

<template>
  <n-config-provider :theme="naiveUITheme">
    <HdEditorContext :editor-core="editorCore">
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
            <div v-if="envStore.isDark" i-carbon-light text-6 mr2 font-light />
            <div v-else i-carbon-moon text-6 mr2 font-light />
            <span>{{ themeModeText }}</span>
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
    </HdEditorContext>
    <div class="heterodoc-teleport-mount-point" />
  </n-config-provider>
</template>

<style lang="less">
:root {
  --heterodoc-editor-color: rgba(0,0,0,0.85);
  --heterodoc-link-color: rgb(15,156,115,85%);
  --heterodoc-caret-color: rgba(0,0,0,0.85);
  --heterodoc-inline-code-color: #4a84d3;
  --heterodoc-inline-code-bg-color: rgba(138, 152, 158, 0.2);
  --heterodoc-inline-code-font: 'Fira Code', Menlo, Monaco, Consolas, 'DejaVu Sans Mono', 'Courier New', Courier, monospace;
  --heterodoc-link-bottom-color: #70ceab;
}
:root.dark {
  --heterodoc-editor-color: rgba(255,255,255,0.85);
  --heterodoc-link-color: rgb(174,248,206,85%);
  --heterodoc-caret-color: rgba(255,255,255,0.85);
  --heterodoc-inline-code-color: #b4d4ff;
  --heterodoc-inline-code-bg-color: rgba(245, 245, 245, 0.2);
  --heterodoc-link-bottom-color: rgb(189,255,234,25%);
}

.ProseMirror {
  min-height: 600px;
  outline: none;
  @media screen and (max-width: 768px) {
    min-height: 300px;
  }

  color: var(--heterodoc-editor-color);
  caret-color: var(--heterodoc-caret-color);

  code {
    margin: 0 2px;
    padding: 2px 0.4em;
    border-radius: 6px;
    font-size: 95%;
    font-family: var(--heterodoc-inline-code-font);
    color: var(--heterodoc-inline-code-color);
    background-color: var(--heterodoc-inline-code-bg-color);
  }

  a.hyperlink {
    text-decoration: none;
    border-bottom: 1px solid var(--heterodoc-link-bottom-color);
    color: var(--heterodoc-link-color);
    margin: 0 4px;
    cursor: pointer;
  }
}
</style>
