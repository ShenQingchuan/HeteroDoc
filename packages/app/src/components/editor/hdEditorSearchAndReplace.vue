<script setup lang="ts">
import { NInput } from 'naive-ui'
import { editorEventBus } from '../../eventBus'

const { t } = useI18n()
const showSearchAndReplace = ref(false)
const searchTerm = ref('')
const replaceTerm = ref('')
const isCaseSensitive = ref(false)
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

const updateSearchReplace = () => {
  if (!editorCore || !editorCore.value) return
  editorCore.value.commands.setSearchTerm({ searchTerm: searchTerm.value })
  editorCore.value.commands.setReplaceTerm({ replaceTerm: replaceTerm.value })
  searchResultTotal.value =
    editorCore.value.getExtension('searchAndReplace').storage.results.length
}
const clearTerms = () => {
  searchTerm.value = ''
  searchResultTotal.value = 0
  editorCore?.value.commands.clearSearch()
}
const replace = () => editorCore?.value.commands.replace()
const replaceAll = () => editorCore?.value.commands.replaceAll()
const toggleCaseSensitive = () => {
  if (!editorCore || !editorCore.value) return
  const searchAndReplace = editorCore.value.getExtension('searchAndReplace')
  const nextValue = !searchAndReplace.options.caseSensitive
  searchAndReplace.options.caseSensitive = nextValue
  isCaseSensitive.value = nextValue
}

useEventListener(document, 'keydown', (e: KeyboardEvent) => {
  // If the user press 'Esc' key, we will close the search dialog
  if (showSearchAndReplace.value && e.key === 'Escape') {
    e.preventDefault()
    editorCore?.value?.emit('toggleSearchView', { state: 'off' })
    clearTerms()
  }
})

watch(
  [() => searchTerm.value.trim(), () => replaceTerm.value.trim()],
  ([searchVal, replaceVal], [oldSearchVal, oldReplaceVal]) => {
    if (!searchVal) clearTerms()
    else if (searchVal !== oldSearchVal || replaceVal !== oldReplaceVal)
      updateSearchReplace()
  }
)

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
        min-w-250px
        max-w-660px
        translate-x="-100%"
        :style="{
          left: `${searchViewClientX}px`,
          top: `${searchViewClientY}px`,
        }"
      >
        <div class="hetero-editor__search-input" flex w-fit>
          <n-input
            ref="searchInputRef"
            v-model:value="searchTerm"
            size="small"
            type="text"
            :placeholder="t('editor.search-and-replace.search-placeholder')"
          >
            <template #prefix>
              <n-button
                text
                mr1
                pointer-events-none
                cursor-default
                tabindex="-1"
              >
                <template #icon>
                  <n-icon text-14px>
                    <div i-carbon:search />
                  </n-icon>
                </template>
              </n-button>
            </template>
            <template #suffix>
              <div class="hetero-editor__search-result" w-fit txt-color-base>
                <span>{{ t('editor.search-and-replace.total-label') }}</span>
                <span ml1>{{ searchResultTotal }}</span>
              </div>
              <n-divider vertical />
              <n-tooltip trigger="hover">
                {{ t('editor.search-and-replace.case-sensitive-tooltip') }}
                <template #trigger>
                  <n-button
                    text
                    class="hetero-editor__case-sensitive"
                    :class="{
                      active: isCaseSensitive,
                    }"
                    @click="toggleCaseSensitive"
                  >
                    <template #icon>
                      <n-icon text-18px>
                        <div i-carbon:letter-aa />
                      </n-icon>
                    </template>
                  </n-button>
                </template>
              </n-tooltip>
            </template>
          </n-input>
        </div>
        <div class="hetero-editor__replace-input" mt2>
          <n-input
            v-model:value="replaceTerm"
            size="small"
            type="text"
            :placeholder="t('editor.search-and-replace.replace-placeholder')"
            @keydown.enter="replace"
          >
            <template #prefix>
              <n-button
                text
                mr1
                pointer-events-none
                cursor-default
                tabindex="-1"
              >
                <template #icon>
                  <n-icon text-14px>
                    <div i-material-symbols:find-replace />
                  </n-icon>
                </template>
              </n-button>
            </template>
            <template #suffix>
              <n-button text @click="replace">{{
                t('editor.search-and-replace.replace-button')
              }}</n-button>
              <n-button text ml2 @click="replaceAll">{{
                t('editor.search-and-replace.replace-all-button')
              }}</n-button>
            </template>
          </n-input>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style lang="less">
@import '../../styles/utils.less';

.hetero-editor__case-sensitive {
  .active-text-btn;
}
</style>
