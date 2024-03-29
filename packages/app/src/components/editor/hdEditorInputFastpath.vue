<script setup lang="ts">
import { OnClickOutside } from '@vueuse/components'
import { EditorFloatMenuAction, FloatMenuZIndex } from '../../constants/editor'
import { editorEventBus } from '../../eventBus'

const editorStore = useEditorStore()
const { t } = useI18n()
const { activeOption, onFastpathActionKey, onFastpathTrigger } =
  useFastpathHandler()

const onClickOutside = () => {
  if (editorStore.isShowInputFastpath) {
    editorStore.setShowInputFastpath(false)
  }
}
const getActiveClassByOption = (option: string) => {
  return activeOption.value === option ? 'active' : ''
}

editorEventBus.on('editorMounted', ({ core }) => {
  core.on('activateInputFastPath', ({ left, top, params }) => {
    editorStore
      .setFloatMenuPosition(
        { left, top },
        EditorFloatMenuAction.ByInputFastpath
      )
      .setShowInputFastpath(true)
      .setFastpathParams(params)
  })
  core.on('deactivateInputFastPath', () => {
    editorStore.setShowInputFastpath(false)
  })
  core.on('fastpathActionKey', ({ event }) => {
    onFastpathActionKey(event)
  })
})
watch(
  () => editorStore.isShowInputFastpath,
  (isShow) => {
    if (isShow) {
      activeOption.value = ''
    }
  }
)
</script>

<template>
  <teleport to="body">
    <OnClickOutside @trigger="onClickOutside">
      <transition name="float-slide-fade">
        <div
          v-show="editorStore.isShowInputFastpath"
          w300px
          max-h-400px
          overflow-y-auto
          flex-col
          items-center
          p2
          border-rounded
          editor-float-card
          text="dark:neutral-100"
          class="hetero-editor__input-fastpath"
          :style="{
            position: 'absolute',
            left: `${editorStore.floatTargetNodeLeft}px`,
            top: `${editorStore.popoverTop}px`,
            zIndex: FloatMenuZIndex,
          }"
        >
          <div
            text="3 neutral-600/80 dark:neutral-50/80"
            px="1.2"
            class="hetero-editor__input-fastpath-options-title-basic-textblocks"
          >
            {{ t('editor.menu.fastpath-options-title-basic-textblocks') }}
          </div>
          <div
            v-for="i in [1, 2, 3, 4, 5] as const"
            :key="`heading-${i}`"
            :class="`hetero-editor__input-fastpath-option heading-${i} ${getActiveClassByOption(
              `h${i}`
            )}`"
            editor-input-fastpath-option
            @click="
              onFastpathTrigger({
                option: `h${i}` satisfies `h${1 | 2 | 3 | 4 | 5}`,
              })
            "
          >
            <i
              class="label-icon"
              m="r0.5"
              v-bind="{
                [`i-ci:heading-h${i}`]: '',
              }"
              editor-input-fastpath-icon
            />
            <span select-none ml="1.2">{{
              t('editor.menu.fastpath-option-heading', { level: i })
            }}</span>
          </div>
          <div
            class="hetero-editor__input-fastpath-option blockquote"
            :class="`${getActiveClassByOption('blockquote')}`"
            editor-input-fastpath-option
            @click="onFastpathTrigger({ option: 'blockquote' })"
          >
            <i
              class="label-icon"
              m="r0.5"
              i-tabler:blockquote
              editor-input-fastpath-icon
            />
            <span select-none ml="1.2">{{
              t('editor.menu.fastpath-option-quote')
            }}</span>
          </div>
          <div
            class="hetero-editor__input-fastpath-option codeBlock"
            :class="`${getActiveClassByOption('codeBlock')}`"
            editor-input-fastpath-option
            @click="onFastpathTrigger({ option: 'codeBlock' })"
          >
            <i
              class="label-icon"
              m="r0.5"
              i-tabler:code
              editor-input-fastpath-icon
            />
            <span select-none ml="1.2">{{
              t('editor.menu.fastpath-option-code-block')
            }}</span>
          </div>
          <div
            class="hetero-editor__input-fastpath-option horizontalLine"
            :class="`${getActiveClassByOption('horizontalLine')}`"
            editor-input-fastpath-option
            @click="onFastpathTrigger({ option: 'horizontalLine' })"
          >
            <i
              class="label-icon"
              m="r0.5"
              i-octicon:horizontal-rule-24
              editor-input-fastpath-icon
            />
            <span select-none ml="1.2">{{
              t('editor.menu.fastpath-option-horizontal')
            }}</span>
          </div>
          <div
            class="hetero-editor__input-fastpath-option bulletList"
            :class="`${getActiveClassByOption('bulletList')}`"
            editor-input-fastpath-option
            @click="onFastpathTrigger({ option: 'bulletList' })"
          >
            <i
              class="label-icon"
              m="r0.5"
              i-octicon:list-unordered
              editor-input-fastpath-icon
            />
            <span select-none ml="1.2">{{
              t('editor.menu.fastpath-option-bullet-list')
            }}</span>
          </div>
          <div
            class="hetero-editor__input-fastpath-option orderedList"
            :class="`${getActiveClassByOption('orderedList')}`"
            editor-input-fastpath-option
            @click="onFastpathTrigger({ option: 'orderedList' })"
          >
            <i
              class="label-icon"
              m="r0.5"
              i-octicon:list-ordered
              editor-input-fastpath-icon
            />
            <span select-none ml="1.2">{{
              t('editor.menu.fastpath-option-ordered-list')
            }}</span>
          </div>
        </div>
      </transition>
    </OnClickOutside>
  </teleport>
</template>

<style>
.hetero-editor__input-fastpath-option.active {
  --at-apply: bg-neutral-400/30;
}
</style>
