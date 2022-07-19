<script lang="ts" setup>
import type { EditorCore, HyperlinkAttrs } from '@hetero/editor'
import { OnClickOutside } from '@vueuse/components'

const props = defineProps<{
  editorCore?: EditorCore
}>()

const { t } = useI18n()
const editorStore = useEditorStore()
const txtSelectionState = useTextSelection()
const isUpdate = ref(false)
const linkURL = ref('')
const linkText = ref('')

const clearLinkEditForm = () => {
  linkURL.value = ''
  linkText.value = ''
}

watch(
  () => editorStore.isShowLinkEdit,
  (nowIsShowLinkEdit) => {
    const nothingSelected = txtSelectionState.selection.value?.isCollapsed
    if (nothingSelected) {
      editorStore.setShowLinkEdit(false)
    }
    else if (nowIsShowLinkEdit) {
      editorStore.setSelectionPosition(
        txtSelectionState.rects.value[0]!.left,
        txtSelectionState.rects.value[0]!.top,
      )
      nextTick(() => {
        editorStore.setShowEditorMenu(false)
        editorStore.setShowLinkEdit(true)
        if (props.editorCore) {
          const { url, text } = props.editorCore.getMarkAttrsFromSelection<HyperlinkAttrs>('hyperlink')
          linkURL.value = url ?? ''
          linkText.value = text ?? txtSelectionState.text.value
        }
      })
    }
  },
)

const toggleHyperlinkMark = () => {
  props.editorCore?.commands.toggleHyperlink({ url: linkURL.value, text: linkText.value })
  editorStore.setShowLinkEdit(false)
  clearLinkEditForm()
}
</script>

<template>
  <teleport to="body">
    <transition name="float-slide-fade">
      <on-click-outside @trigger="editorStore.setShowLinkEdit(false); clearLinkEditForm()">
        <div
          v-show="editorStore.isShowLinkEdit"
          class="hetero-editor__link-edit"
          :style="{
            position: 'absolute',
            left: `${editorStore.selectionNodeLeft}px`,
            top: `${editorStore.popoverTop}px`,
            zIndex: 99,
          }"
          flex-col flex-items-center p-y-2 p-x-2 border-base bg-base border-round
        >
          <div class="hetero-editor__link-edit edit-link" flex-items-center p-x-1 min-w-320px m-b-2>
            <span whitespace-nowrap txt-color-base mr3>{{ t('editor.popover.edit-link-url-label') }}</span>
            <n-input v-model:value="linkURL" autofocus type="text" :placeholder="t('editor.popover.edit-link-url-placeholder')" />
          </div>
          <div v-show="!isUpdate" class="hetero-editor__link-edit edit-text" flex-items-center p-x-1 min-w-320px>
            <span whitespace-nowrap txt-color-base mr3>{{ t('editor.popover.edit-link-text-label') }}</span>
            <n-input v-model:value="linkText" type="text" :placeholder="t('editor.popover.edit-link-text-placeholder')" mr3 />
            <n-button class="hetero-editor__link-edit confirm" @click="toggleHyperlinkMark">
              {{ t('editor.popover.edit-link-confirm') }}
            </n-button>
          </div>
        </div>
      </on-click-outside>
    </transition>
  </teleport>
</template>
