<script lang="ts" setup>
import HdEditorFloatMenu from './hdEditorFloatMenu.vue'
import HdEditorLinkEdit from './hdEditorLinkEdit.vue'
import HdEditorInputFastpath from './hdEditorInputFastpath.vue'
import HdEditorCodeLangSelect from './hdEditorCodeLangSelect.vue'
import HdEditorSideTool from './hdEditorSideTool.vue'
import HdEditorDropCursor from './hdEditorDropCursor.vue'
import HdEditorSearchAndReplace from './hdEditorSearchAndReplace.vue'
</script>

<template>
  <div class="hetero-editor__context-container">
    <slot name="default"></slot>
    <HdEditorFloatMenu />
    <HdEditorLinkEdit />
    <HdEditorInputFastpath />
    <HdEditorCodeLangSelect />
    <HdEditorSideTool />
    <HdEditorDropCursor />
    <HdEditorSearchAndReplace />
  </div>
</template>
