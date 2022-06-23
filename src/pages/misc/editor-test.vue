<script lang="ts" setup>
import { useHeteroEditor } from '../../editor'

const editorRef = templateRef<HTMLElement | null>('editor')

onMounted(() => {
  const editorMountPoint = editorRef.value
  if (editorMountPoint) {
    useHeteroEditor({
      container: editorMountPoint,
      isReadOnly: false,
      autofocus: true,
    })
  }
})
</script>

<template>
  <div class="page-misc__editor-test" flex-col items-center justify-center w100vw>
    <div class="page-misc__editor-test-container" w1000px m-x-auto m-t-20>
      <div ref="editor" class="page-misc__editor-test-mount-point" p-12 min-h-1000px />
    </div>
  </div>
</template>

<style lang="less">
.page-misc__editor-test {
  &-container {
    background-color: #fafafa;
    border: 1px solid #e5e5e5;
  }

  &-mount-point {
    .ProseMirror {
      height: 100%;
      outline: none;
    }
  }
}
</style>
