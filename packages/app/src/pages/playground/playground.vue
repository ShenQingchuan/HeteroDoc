<script lang="ts" setup>
import { EditorProvideKey } from '../../constants/editor'
import { editorEventBus } from '../../eventBus'
import { composeExtensions } from './composeExtensions'
import type { EditorCore } from '@hetero/editor'

const props = defineProps<{ mockData?: any }>()
const { t, locale } = useI18n()
const envStore = useEnvStore()
const themeModeText = useThemeModeText()
const editorRef = ref<HTMLElement>()
const editorCore = shallowRef<EditorCore>()

const switchLocale = () => {
  locale.value = locale.value === 'zhCN' ? 'enUS' : 'zhCN'
}

useTitle(t('pages.playground.title'))

provide(EditorProvideKey, editorCore)
onMounted(() => {
  const container = editorRef.value!
  editorCore.value = createHeteroEditor(
    {
      doc: props.mockData,
      container,
      isReadOnly: false,
      autofocus: true,
      isOffline: true,
    },
    {
      themeMode: envStore.isDark ? 'dark' : 'light',
      i18nTr: t,
      extensions: (core: EditorCore) => composeExtensions(core),
    }
  )
  container.querySelector('.ProseMirror')?.setAttribute('spellcheck', 'false')
  editorEventBus.emit('editorMounted', {
    core: editorCore.value!,
    editorDOM: editorRef.value!,
  })
  startReflectActiveState(editorCore.value)
})
</script>

<template>
  <HdEditorContext>
    <div
      class="page-misc__editor-test"
      bg-base
      flex-col
      items-center
      justify-center
      w100vw
      min-h-100vh
      p-y-10
    >
      <div
        class="page-misc__editor-test__settings"
        flex-items-center
        justify-center
        m-y-4
      >
        <n-button text mr4 @click="envStore.toggleDark()">
          <div v-if="envStore.isDark" i-carbon-light text-6 mr2 font-light />
          <div v-else i-carbon-moon text-6 mr2 font-light />
          <span>{{ themeModeText }}</span>
        </n-button>
        <n-button text mr4 @click="switchLocale">
          <template #icon>
            <n-icon>
              <div i-carbon:language />
            </n-icon>
          </template>
          <span>{{ t('locale.name') }}</span>
        </n-button>
        <a
          color-inherit
          decoration-none
          target="_blank"
          href="https://github.com/ShenQingchuan/HeteroDoc"
          mr4
        >
          <n-button text>
            <template #icon>
              <n-icon>
                <div i-carbon:logo-github />
              </n-icon>
            </template>
            <span>{{ t('playground.navigate-github-link') }}</span>
          </n-button>
        </a>
      </div>
      <div
        class="page-misc__editor-test-container"
        w70vw
        m-x-auto
        border-base
        border-rounded
      >
        <div
          ref="editorRef"
          class="page-misc__editor-test-mount-point heterodoc-editor"
        />
      </div>
    </div>
  </HdEditorContext>
</template>
