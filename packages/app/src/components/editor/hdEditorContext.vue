<script lang="ts" setup>
import HdEditorFloatMenu from './hdEditorFloatMenu.vue'
import HdEditorLinkEdit from './hdEditorLinkEdit.vue'
import HdEditorInputFastpath from './hdEditorInputFastpath.vue'
import HdEditorLangSelect from './hdEditorLangSelect.vue'
import HdEditorSideTool from './hdEditorSideTool.vue'
</script>

<template>
  <div class="hetero-editor__context-container">
    <slot name="default"></slot>
    <HdEditorFloatMenu />
    <HdEditorLinkEdit />
    <HdEditorInputFastpath />
    <HdEditorLangSelect />
    <HdEditorSideTool />
  </div>
</template>
