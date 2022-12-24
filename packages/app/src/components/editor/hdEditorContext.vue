<script lang="ts" setup>
import HdFloatMenu from './hdFloatMenu.vue'
import HdEditorLinkEdit from './hdEditorLinkEdit.vue'
import HdEditorInputFastpath from './hdEditorInputFastpath.vue'
import HdEditorLangSelect from './hdEditorLangSelect.vue'
</script>

<template>
  <div class="hetero-editor__context-container">
    <slot name="default"></slot>
    <HdFloatMenu />
    <HdEditorLinkEdit />
    <HdEditorInputFastpath />
    <HdEditorLangSelect />
  </div>
</template>
