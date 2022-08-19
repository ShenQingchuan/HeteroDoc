<script setup lang="tsx">
import { NButton } from 'naive-ui'
import { EditorFloatMenuAction } from '../../constants/editor'
import { editorEventBus } from '../../eventBus'
import { useCodeBlockLangSearchOptions } from '../../composables/useCodeblockLangSelectorSearch'
import { useObserveCurrentCodeBlockDelete } from '../../composables/useObserveCurrentCodeBlockDelete'

const langSelectorDropdownClassName = 'hetero-editor__code-block-selector-dropdown'
const langSelectorBtnClassName = 'hetero-editor__code-block-selector-btn'

const { t } = useI18n()
const editorCore = useEditorCoreInject()
const editorStore = useEditorStore()
const { currentCodeBlockElement } = useObserveCurrentCodeBlockDelete(() => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  hideLangSelector()
})
const codeBlockLangSelectorRef = ref<InstanceType<typeof NButton>>()
const langSelectorDropdownRef = ref<HTMLElement>()
const isDropdownShow = ref(false)
const isKeepLangSelectorShow = ref(false)
const {
  searchWord,
  filteredOptions,
  langNameToLangIdAliasMap,
  langIdToLangNameAliasMap,
} = useCodeBlockLangSearchOptions()
const langAliasName = computed(
  () => {
    const langId = editorStore.codeBlockLangText
    return (
      langIdToLangNameAliasMap[langId] ?? langId
    ) || t('editor.menu.code-block-lang-text-placeholder')
  },
)

const showLangSelector = (
  pos: Parameters<typeof editorStore.setFloatMenuPosition>[0],
  text: string,
) => {
  editorStore.setFloatMenuPosition(pos, EditorFloatMenuAction.ByUIEvent)
  editorStore.setCodeBlockLangText(text)
  editorStore.setShowCodeBlockLangSelector(true)
}
const hideLangSelector = () => {
  editorStore.setShowCodeBlockLangSelector(false)
  editorStore.setFloatMenuPosition({}, EditorFloatMenuAction.ByUIEvent)
  currentCodeBlockElement.value = undefined
  searchWord.value = ''
  isKeepLangSelectorShow.value = false
}
const handleSelectLangText = (langName: string) => {
  editorStore.setCodeBlockLangText(langName)
  editorCore?.value.emit('updateCodeBlock', {
    codeBlockDOM: currentCodeBlockElement.value!,
    langName: langNameToLangIdAliasMap[langName] ?? langName,
  })
  isDropdownShow.value = false
  hideLangSelector()
}
const handleCodeBlockLangSelectorBtnClick = () => {
  isDropdownShow.value = !isDropdownShow.value
  isKeepLangSelectorShow.value = true
}
const handleClickDropdownOutside = (e: MouseEvent) => {
  const isClickPointStillInsideCodeBlock = e.target instanceof HTMLElement && e.target.classList.contains('hljs')
  const isClickSelectorBtn = e.target instanceof HTMLElement && !codeBlockLangSelectorRef.value?.$el.contains(e.relatedTarget)
  if (!isClickPointStillInsideCodeBlock && !isClickSelectorBtn) {
    hideLangSelector()
  }
  isDropdownShow.value = false
  isKeepLangSelectorShow.value = false
}

editorEventBus.on('editorMounted', ({ editorDOM }) => {
  editorDOM.addEventListener('mouseover', (e) => {
    if (e.target instanceof HTMLElement && e.target.classList.contains('hljs')) {
      const codeBlockElement = e.target as HTMLElement
      currentCodeBlockElement.value = codeBlockElement
      const { left, width } = codeBlockElement.getBoundingClientRect()
      showLangSelector(
        {
          right: document.body.clientWidth - (left + width) + 10,
          top: codeBlockElement.getBoundingClientRect().top + 6,
        },
        codeBlockElement.dataset.params ?? t('editor.menu.code-block-lang-text-placeholder'),
      )
    }
  })
  editorDOM.addEventListener('mouseout', (e) => {
    if (isKeepLangSelectorShow.value) {
      return
    }
    if (
      e.target instanceof HTMLElement
      && e.target.classList.contains('hljs')
      && e.relatedTarget instanceof HTMLElement
      && !codeBlockLangSelectorRef.value?.$el.contains(e.relatedTarget)
    ) {
      hideLangSelector()
    }
  })
})
</script>

<template>
  <teleport to="body">
    <transition name="float-slide-fade">
      <div
        v-show="editorStore.isShowCodeblockLangSelector"
        class="hetero-editor__code-block-selector"
        :style="{
          position: 'absolute',
          right: `${editorStore.floatTargetNodeRight}px`,
          top: `${editorStore.floatTargetNodeTop}px`,
        }"
      >
        <n-dropdown
          ref="langSelectorDropdownRef"
          size="small"
          :class="langSelectorDropdownClassName"
          :show="isDropdownShow"
          :options="filteredOptions"
          :style="{
            padding: '6px',
            maxHeight: '300px',
            overflowY: 'auto',
          }"
          @select="handleSelectLangText"
          @clickoutside="handleClickDropdownOutside"
        >
          <n-button
            ref="codeBlockLangSelectorRef"
            :class="langSelectorBtnClassName"
            secondary size="tiny"
            @click="handleCodeBlockLangSelectorBtnClick"
          >
            {{ langAliasName }}
          </n-button>
        </n-dropdown>
      </div>
    </transition>
  </teleport>
</template>
