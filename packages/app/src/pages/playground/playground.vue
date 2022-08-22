<script lang="ts" setup>
import type { EditorCore } from '@hetero/editor'
import { EditorProvideKey } from '../../constants/editor'
import { editorEventBus } from '../../eventBus'
import { composeExtensions } from './composeExtensions'

const naiveUITheme = useNaiveThemeSetup()
const envStore = useEnvStore()
const themeModeText = useThemeModeText()
const editorRef = ref<HTMLElement>()
const editorCore = shallowRef<EditorCore>()

provide(EditorProvideKey, editorCore)
onMounted(() => {
  const container = editorRef.value!
  editorCore.value = useHeteroEditor({
    container,
    isReadOnly: false,
    autofocus: true,
    isOffline: true,
  }, {
    extensions: core => composeExtensions(core),
  })
  container
    .querySelector('.ProseMirror')
    ?.setAttribute('spellcheck', 'false')
  editorEventBus.emit('editorMounted', {
    core: editorCore.value,
    editorDOM: editorRef.value!,
  })
  startReflectActiveState(editorCore.value)
})
</script>

<template>
  <n-config-provider :theme="naiveUITheme">
    <HdEditorContext>
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
            ref="editorRef"
            class="page-misc__editor-test-mount-point"
            p-10 bg="neutral-200/40 dark:neutral-600/70"
          />
        </div>
      </div>
    </HdEditorContext>
  </n-config-provider>
</template>
