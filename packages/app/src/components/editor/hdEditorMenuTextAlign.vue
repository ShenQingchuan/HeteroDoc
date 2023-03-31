<script setup lang="ts">
const editorCore = useEditorCoreInject()
const setTextAlign = (alignment: 'left' | 'center' | 'right' | 'justify') => {
  editorCore?.value?.commands.setTextAlign({ alignment })
}
</script>

<template>
  <n-button
    class="hetero-editor__float-menu-item align-left"
    quaternary
    px1
    m="x0.25"
    @click="setTextAlign('left')"
  >
    <template #icon>
      <n-icon><div i-ic:round-format-align-left mr1 /></n-icon>
    </template>
  </n-button>
  <n-button
    class="hetero-editor__float-menu-item align-center"
    quaternary
    px1
    m="x0.25"
    @click="setTextAlign('center')"
  >
    <template #icon>
      <n-icon><div i-ic:round-format-align-center mr1 /></n-icon>
    </template>
  </n-button>
  <n-button
    class="hetero-editor__float-menu-item align-right"
    quaternary
    px1
    m="x0.25"
    @click="setTextAlign('right')"
  >
    <template #icon>
      <n-icon><div i-ic:round-format-align-right mr1 /></n-icon>
    </template>
  </n-button>
  <n-button
    class="hetero-editor__float-menu-item align-justify"
    quaternary
    px1
    m="x0.25"
    @click="setTextAlign('justify')"
  >
    <template #icon>
      <n-icon><div i-ic:round-format-align-justify mr1 /></n-icon>
    </template>
  </n-button>
</template>
