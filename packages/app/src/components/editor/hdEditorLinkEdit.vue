<script lang="ts" setup>
import type { EditorCore, HyperlinkAttrs } from '@hetero/editor'
import { EditorFloatMenuAction } from '../../constants/editor'
import { URLRegExp } from '../../constants/regExp'

const props = defineProps<{
  editorCore?: EditorCore
}>()

const { t } = useI18n()
const editorStore = useEditorStore()
const linkEditRef = ref<HTMLElement>()
const isEditLinkValid = computed(() => URLRegExp.test(editorStore.linkEditURL))

const confirmHyperlinkMark = () => {
  props.editorCore?.commands.updateHyperlink({
    current: {
      url: editorStore.linkEditURL,
    },
    prev: editorStore.prevLinkAttrs!,
    linkText: editorStore.linkEditText,
  })
  editorStore.setShowLinkEdit(false)
}
const openLink = () => {
  window.open(editorStore.linkEditURL, '__blank')
  window.opener = null // SAFETY
}
watch(
  () => editorStore.isShowLinkEdit,
  (isNowShowLinkEdit) => {
    if (!isNowShowLinkEdit) {
      return
    }
    editorStore.setPrevLinkAttrs()
    if (editorStore.floatMenuByAction === EditorFloatMenuAction.BySelection && props.editorCore) {
      const { url } = props.editorCore.helpers.getMarkAttrs<HyperlinkAttrs>('hyperlink')
      editorStore.setLinkEditURL(url)
    }
  },
)
</script>

<template>
  <teleport to="body">
    <transition name="float-slide-fade">
      <div
        v-show="editorStore.isShowLinkEdit"
        ref="linkEditRef"
        class="hetero-editor__link-edit"
        :style="{
          position: 'absolute',
          left: `${editorStore.floatTargetNodeLeft}px`,
          top: `${editorStore.popoverTop}px`,
          zIndex: 99,
        }"
        flex-col items-start p-y-2 p-x-2 border-base bg-base border-round
      >
        <div class="hetero-editor__link-edit edit-link" flex-items-center p-x-1 min-w-320px mb2>
          <span whitespace-nowrap txt-color-base mr3>{{ t('editor.popover.edit-link-url-label') }}</span>
          <n-input
            v-model:value="editorStore.linkEditURL"
            autofocus type="text"
            :status="isEditLinkValid ? 'success' : undefined"
            :placeholder="t('editor.popover.edit-link-url-placeholder')" mr2
          />
          <i i-ri:close-circle-line text-6 cursor-pointer txt-color-base hover:text-emerald-600 @click="editorStore.setShowLinkEdit(false)" />
        </div>
        <div class="hetero-editor__link-edit edit-text" flex-items-center p-x-1 min-w-320px>
          <span whitespace-nowrap txt-color-base mr3>{{ t('editor.popover.edit-link-text-label') }}</span>
          <n-input v-model:value="editorStore.linkEditText" type="text" :placeholder="t('editor.popover.edit-link-text-placeholder')" mr3 />
          <n-button
            mr3 class="hetero-editor__link-edit confirm"
            :disabled="!isEditLinkValid"
            @click="confirmHyperlinkMark"
          >
            {{ t('editor.popover.edit-link-confirm') }}
          </n-button>
          <n-button
            v-show="isEditLinkValid"
            quaternary class="hetero-editor__link-edit open-link"
            @click="openLink"
          >
            <template #icon>
              <i i-carbon:link text-6 cursor-pointer txt-color-base hover:text-emerald-600 @click="editorStore.setShowLinkEdit(false)" />
            </template>
          </n-button>
        </div>
      </div>
    </transition>
  </teleport>
</template>
