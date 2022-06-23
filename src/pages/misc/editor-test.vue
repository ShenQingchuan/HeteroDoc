<script lang="ts" setup>
import { useHeteroEditor } from '../../editor'
import { BoldPlugin } from '../../editor/extensions'

const editorRef = templateRef<HTMLElement | null>('editor')

onMounted(() => {
  const editorMountPoint = editorRef.value
  if (editorMountPoint) {
    useHeteroEditor({
      container: editorMountPoint,
      isReadOnly: false,
      autofocus: true,
    }, {
      fromKeys: ['bold'],
    })
  }
})
</script>

<template>
  <div class="page-misc__editor-test" flex-col items-center justify-center w100vw>
    <div class="page-misc__editor-test-container" w80vw m-x-auto m-t-20>
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
      min-height: 900px;
      @media screen and (max-width: 768px) {
        min-height: 500px;
      }
      height: 100%;
      outline: none;
    }
  }
}
</style>
