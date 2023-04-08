<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { useCodeBlockLangSearchOptions } from '../../composables/useCodeblockLangSelectorSearch'
import {
  EditorCodeBlockCopyBtnClassName,
  EditorCodeBlockLangBtnClassName,
  EditorFloatMenuAction,
} from '../../constants/editor'
import { editorEventBus } from '../../eventBus'

const langSelectorDropdownClassName =
  'hetero-editor__code-block-selector-dropdown'

const { t } = useI18n()
const message = useMessage()
const editorCore = useEditorCoreInject()
const editorStore = useEditorStore()
const langSelectorDropdownRef = ref<HTMLElement>()
const currentCodeBlockElement = ref<HTMLElement>()
const { searchWord, filteredOptions, langNameToLangIdAliasMap } =
  useCodeBlockLangSearchOptions()

const handleSelectLangText = (langName: string) => {
  const alias =
    langName === 'plaintext'
      ? t('editor.menu.code-block-lang-text-placeholder')
      : langName
  const langId = langNameToLangIdAliasMap[langName] ?? langName
  editorCore?.value.emit('updateCodeBlock', {
    codeBlockDOM: currentCodeBlockElement.value!,
    langId,
    alias,
  })
  editorStore.setShowCodeBlockLangSelector(false)
  currentCodeBlockElement.value = undefined
}
const hideLangSelectorDropdown = () => {
  editorStore.setShowCodeBlockLangSelector(false)
  searchWord.value = ''
}
const showLangSelectorDropdown = (
  pos: Parameters<typeof editorStore.setFloatMenuPosition>[0]
) => {
  editorStore.setFloatMenuPosition(pos, EditorFloatMenuAction.ByUIEvent)
  editorStore.setShowCodeBlockLangSelector(true)
  searchWord.value = ''
}
const handleClickDropdownOutside = () => {
  hideLangSelectorDropdown()
}

editorEventBus.on('editorMounted', ({ editorDOM }) => {
  const closetCodeBlockSelector = 'pre.hljs[data-hetero-block="true"]'
  editorDOM.addEventListener('click', (e) => {
    if (e.target instanceof HTMLDivElement) {
      if (e.target.classList.contains(EditorCodeBlockLangBtnClassName)) {
        const codeBlockElement = e.target.closest<HTMLPreElement>(
          closetCodeBlockSelector
        )!
        currentCodeBlockElement.value = codeBlockElement
        const { x, y } = e.target.getBoundingClientRect()
        showLangSelectorDropdown({
          right: x,
          top: y + 30,
        })
      } else if (e.target.closest(`.${EditorCodeBlockCopyBtnClassName}`)) {
        const codeBlockElement = e.target.closest<HTMLPreElement>(
          closetCodeBlockSelector
        )!
        currentCodeBlockElement.value = codeBlockElement
        if (codeBlockElement.textContent) {
          navigator.clipboard
            .writeText(codeBlockElement.textContent)
            .then(() => {
              message.success(t('editor.tips.code-block-copy-success'))
            })
        }
      }
    }
  })
})
</script>

<template>
  <n-dropdown
    ref="langSelectorDropdownRef"
    trigger="manual"
    size="small"
    :class="langSelectorDropdownClassName"
    :show="editorStore.isShowCodeblockLangSelector"
    :options="filteredOptions"
    :x="editorStore.floatTargetNodeRight"
    :y="editorStore.floatTargetNodeTop"
    :style="{
      padding: '6px',
      maxHeight: '300px',
      overflowY: 'auto',
    }"
    @select="handleSelectLangText"
    @clickoutside="handleClickDropdownOutside"
  />
</template>
