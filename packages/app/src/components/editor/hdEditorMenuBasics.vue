<script setup lang="ts">
import HdFontFancyPicker from './hdFontFancyPicker.vue'

const editorCore = useEditorCoreInject()
const editorStore = useEditorStore()
</script>

<template>
  <n-button
    class="hetero-editor__float-menu-item bold" quaternary px1 m="x0.25"
    :class="{ active: editorStore.menuActiveState.bold }"
    @click="editorCore?.cmdManager.chain.focus().toggleBold().run()"
  >
    <template #icon>
      <n-icon><div i-ic:round-format-bold mr1 /></n-icon>
    </template>
  </n-button>
  <n-button
    class="hetero-editor__float-menu-item italic" quaternary px1 m="x0.25"
    :class="{ active: editorStore.menuActiveState.italic }"
    @click="editorCore?.cmdManager.chain.focus().toggleItalic().run()"
  >
    <template #icon>
      <n-icon><div i-ic:round-format-italic mr1 /></n-icon>
    </template>
  </n-button>
  <n-button
    class="hetero-editor__float-menu-item code" quaternary px1 m="x0.25"
    :class="{ active: editorStore.menuActiveState.code }"
    @click="editorCore?.cmdManager.chain.focus().toggleCode().run()"
  >
    <template #icon>
      <n-icon><div i-ic:round-code mr1 /></n-icon>
    </template>
  </n-button>
  <n-button
    class="hetero-editor__float-menu-item underline" quaternary px1 m="x0.25"
    :class="{ active: editorStore.menuActiveState.underline }"
    @click="editorCore?.cmdManager.chain.focus().toggleUnderline().run()"
  >
    <template #icon>
      <n-icon><div i-ic:round-format-underlined mr1 /></n-icon>
    </template>
  </n-button>
  <n-button
    class="hetero-editor__float-menu-item deleteLine" quaternary px1 m="x0.25"
    :class="{ active: editorStore.menuActiveState.deleteLine }"
    @click="editorCore?.cmdManager.chain.focus().toggleDeleteLine().run()"
  >
    <template #icon>
      <n-icon><div i-ic:round-format-strikethrough mr1 /></n-icon>
    </template>
  </n-button>
  <HdFontFancyPicker />
</template>
