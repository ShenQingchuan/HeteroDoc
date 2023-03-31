<script setup lang="ts">
import { NInput } from 'naive-ui'
import { editorEventBus } from '../../eventBus'

const { t } = useI18n()
const showSearchAndReplace = ref(false)
const searchPattern = ref('')
const replacePattern = ref('')
const showReplace = ref(false)
const searchResultIndex = ref(0)
const searchResultTotal = ref(0)
const searchViewClientX = ref(0)
const searchViewClientY = ref(0)
const searchInputRef = ref<InstanceType<typeof NInput>>()
const editorCore = useEditorCoreInject()

const editorRealDOM = shallowRef<HTMLElement>()

const editorDOMRect = useElementBounding(editorRealDOM)
watchEffect(() => {
  searchViewClientX.value = editorDOMRect.right.value - 30
  searchViewClientY.value = editorDOMRect.top.value + 30
})

useEventListener(document, 'keydown', (e: KeyboardEvent) => {
  // If the user press 'Esc' key, we will close the search dialog
  if (showSearchAndReplace.value && e.key === 'Escape') {
    e.preventDefault()
    editorCore?.value?.emit('toggleSearchView', { state: 'off' })
  }
  // If the user press 'Enter' key, we will search the next match
  else if (showSearchAndReplace.value && e.key === 'Enter') {
    e.preventDefault()
    editorCore?.value?.emit('search', { pattern: searchPattern.value })
  }
})

editorEventBus.on('editorMounted', ({ editorDOM, core }) => {
  editorRealDOM.value = editorDOM
  core.on('toggleSearchView', async ({ state }) => {
    showSearchAndReplace.value = state === 'on'

    if (state === 'on') {
      await nextTick()
      searchInputRef.value?.focus()
    } else {
      core.view.focus()
    }
  })
})
</script>

<template>
  <teleport to="body">
    <transition name="float-slide">
      <div
        v-show="showSearchAndReplace"
        class="hetero-editor__search-and-replace"
        position-absolute
        flex-col
        w-fit
        max-w-600px
        translate-x="-100%"
        :style="{
          left: `${searchViewClientX}px`,
          top: `${searchViewClientY}px`,
        }"
      >
        <div class="hetero-editor__search-input" flex w-fit>
          <n-input
            ref="searchInputRef"
            v-model:value="searchPattern"
            size="small"
            type="text"
            :placeholder="t('editor.search-and-replace.search-placeholder')"
          >
            <template #prefix>
              <n-button text mr1>
                <template #icon>
                  <n-icon text-14px>
                    <div i-carbon:search />
                  </n-icon>
                </template>
              </n-button>
            </template>
            <template #suffix>
              <span class="hetero-editor__search-result" w-fit txt-color-base>
                {{ searchResultIndex }} / {{ searchResultTotal }}
              </span>
            </template>
          </n-input>
        </div>
        <div v-show="showReplace" class="hetero-editor__replace-input">
          <n-input
            v-model:value="replacePattern"
            size="small"
            type="text"
            :placeholder="t('editor.search-and-replace.replace-placeholder')"
          />
          <n-button>{{
            t('editor.search-and-replace.replace-button')
          }}</n-button>
          <n-button>{{
            t('editor.search-and-replace.replace-all-button')
          }}</n-button>
        </div>
      </div>
    </transition>
  </teleport>
</template>
