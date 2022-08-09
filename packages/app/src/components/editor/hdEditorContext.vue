<script lang="ts" setup>
import HdFloatMenu from './hdFloatMenu.vue'
import HdEditorLinkEdit from './hdEditorLinkEdit.vue'
</script>

<template>
  <div class="hetero-editor__context-container">
    <slot name="default"></slot>
    <HdFloatMenu />
    <HdEditorLinkEdit />
  </div>
</template>
