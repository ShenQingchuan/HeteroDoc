<script lang="ts" setup>
import type { EditorCore } from '@hetero/editor'
import HdFloatMenu from './hdFloatMenu.vue'
import HdEditorLinkEdit from './hdEditorLinkEdit.vue'

defineProps<{
  editorCore?: EditorCore
}>()
</script>

<template>
  <div class="hetero-editor__context-container">
    <slot name="default"></slot>
    <HdFloatMenu :editor-core="editorCore" />
    <HdEditorLinkEdit :editor-core="editorCore" />
  </div>
</template>
