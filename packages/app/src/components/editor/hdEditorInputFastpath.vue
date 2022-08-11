<script setup lang="ts">
import { OnClickOutside } from '@vueuse/components'
import { EditorFloatMenuAction, FloatMenuZIndex } from '../../constants/editor'
import { editorEventBus } from '../../eventBus'

const editorCore = useEditorCoreInject()
const editorStore = useEditorStore()
const { t } = useI18n()

editorEventBus.on('editorMounted', ({ core }) => {
  core.on('activateInputFastPath', (pos) => {
    editorStore.setFloatMenuPosition(pos, EditorFloatMenuAction.ByInputFastpath)
    editorStore.setShowInputFastpath(true)
  })
  core.on('deactivateInputFastPath', () => {
    editorStore.setShowInputFastpath(false)
  })
})

const onClickHeadingFastpath = (level: number) => {
  editorCore?.value.cmdManager
    .chain.toggleHeading({ level }).run()
  editorStore.setShowInputFastpath(false)
  editorCore?.value.view.focus()
  editorCore?.value.emit(
    'deactivateInputFastPath',
    { isContentChanged: true },
  )
}
const onClickOutside = () => {
  if (editorStore.isShowInputFastpath) {
    editorStore.setShowInputFastpath(false)
  }
}
</script>

<template>
  <teleport to="body">
    <OnClickOutside @trigger="onClickOutside">
      <transition name="float-slide-fade">
        <div
          v-show="editorStore.isShowInputFastpath"
          w300px max-h-400px overflow-y-auto
          flex-col items-center p2 border-rounded
          bg="neutral-400/20 dark:neutral-900/80"
          text="dark:neutral-100"
          border="1 neutral-900/20 dark:neutral-50/50"
          class="hetero-editor__input-fastpath"
          :style="{
            position: 'absolute',
            left: `${editorStore.floatTargetNodeLeft}px`,
            top: `${editorStore.popoverTop}px`,
            zIndex: FloatMenuZIndex,
          }"
        >
          <div
            text="3 neutral-600/80 dark:neutral-50/80" px="1.2"
            class="hetero-editor__input-fastpath-options-title-basic-textblocks"
          >
            {{ t('editor.menu.fastpath-options-title-basic-textblocks') }}
          </div>
          <div
            v-for="i in 5"
            :key="`heading-${i}`"
            class="hetero-editor__input-fastpath-option"
            flex items-center m="0.5" p="y0.5 x1"
            cursor-pointer
            hover:bg="neutral-400/30"
            @click="onClickHeadingFastpath(i)"
          >
            <i
              class="label-icon" m="r0.5" v-bind="{
                [`i-ci:heading-h${i}`]: '',
              }"
              text="4 neutral-700/60 dark:neutral-100/60"
            />
            <span ml="1.2">{{ t('editor.menu.fastpath-option-heading', { level: i }) }}</span>
          </div>
        </div>
      </transition>
    </OnClickOutside>
  </teleport>
</template>
