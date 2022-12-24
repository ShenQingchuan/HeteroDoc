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

const runInputFastPath = (runActions: (...args: any) => void) => (...args: Parameters<typeof runActions>) => {
  runActions(...args)
  editorStore.setShowInputFastpath(false)
  editorCore?.value.view.focus()
  editorCore?.value.emit(
    'deactivateInputFastPath',
    { isContentChanged: true },
  )
}
const onClickHeadingFastpath = runInputFastPath((level: number) => {
  editorCore?.value.cmdManager
    .chain.toggleHeading({ level }).run()
})
const onClickQuoteFastpath = runInputFastPath(() => {
  editorCore?.value.commands.setBlockquote()
})
const onClickCodeblockFastpath = runInputFastPath(() => {
  editorCore?.value.commands.setCodeblock({ params: 'plaintext' })
})
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
          bg="neutral-100 dark:neutral-900/80"
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
            :class="`hetero-editor__input-fastpath-option heading-${i}`"
            editor-input-fastpath-option
            @click="onClickHeadingFastpath(i)"
          >
            <i
              class="label-icon" m="r0.5" v-bind="{
                [`i-ci:heading-h${i}`]: '',
              }"
              editor-input-fastpath-icon
            />
            <span select-none ml="1.2">{{ t('editor.menu.fastpath-option-heading', { level: i }) }}</span>
          </div>
          <div
            class="hetero-editor__input-fastpath-option quote"
            editor-input-fastpath-option
            @click="onClickQuoteFastpath"
          >
            <i class="label-icon" m="r0.5" i-tabler:blockquote editor-input-fastpath-icon />
            <span select-none ml="1.2">{{ t('editor.menu.fastpath-option-quote') }}</span>
          </div>
          <div
            class="hetero-editor__input-fastpath-option codeBlock"
            editor-input-fastpath-option
            @click="onClickCodeblockFastpath"
          >
            <i class="label-icon" m="r0.5" i-tabler:code editor-input-fastpath-icon />
            <span select-none ml="1.2">{{ t('editor.menu.fastpath-option-code-block') }}</span>
          </div>
        </div>
      </transition>
    </OnClickOutside>
  </teleport>
</template>
