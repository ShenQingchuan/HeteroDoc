<script lang="ts" setup>
import HdFloatMenu from './hdFloatMenu.vue'
import HdEditorLinkEdit from './hdEditorLinkEdit.vue'
import HdEditorInputFastpath from './hdEditorInputFastpath.vue'
import HdEditorLangSelect from './hdEditorLangSelect.vue'
import HdEditorSideToolButton from './hdEditorSideToolButton.vue'
</script>

<template>
  <div class="hetero-editor__context-container">
    <slot name="default"></slot>
    <HdFloatMenu />
    <HdEditorLinkEdit />
    <HdEditorInputFastpath />
    <HdEditorLangSelect />
    <HdEditorSideToolButton />
  </div>
</template>
