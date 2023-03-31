import { fontBgColorSet, fontColorSet } from '@hetero/editor'
import { editorEventBus } from '../eventBus'
import type { EditorCore, FontFancyAttrs } from '@hetero/editor'
import type { CSSProperties } from 'vue'

export function useFontFancyPicker() {
  const editorStore = useEditorStore()
  const envStore = useEnvStore()
  const rerenderKey = ref(0)
  const fontFancyBtnRef = ref<HTMLElement>()
  const fontFancyBtnBounding = useElementBounding(fontFancyBtnRef)
  const getStyleFromFancyAttrs = (
    fontFancyAttrs: FontFancyAttrs | null | undefined
  ) => {
    if (!fontFancyAttrs) return {}
    const { colorIndex, bgColorIndex } = fontFancyAttrs
    const style: CSSProperties = {}
    const isDarkMode = envStore.isDark
    if (colorIndex)
      style.color = isDarkMode
        ? fontColorSet[colorIndex]![1]
        : fontColorSet[colorIndex]![0]
    if (bgColorIndex)
      style.backgroundColor = isDarkMode
        ? fontBgColorSet[bgColorIndex]![1]
        : fontBgColorSet[bgColorIndex]![0]
    return style
  }
  const getMenuIconStyleFromActiveFontFancy = (
    core: EditorCore | undefined
  ) => {
    const isFontFancyActive = core?.activeManager.isFontFancyActive()
    if (!isFontFancyActive) return {}
    const gotStyle = getStyleFromFancyAttrs(isFontFancyActive)
    return gotStyle
  }

  const fontColorSetByTheme = computed(() => {
    return fontColorSet.map((color) => {
      return envStore.isDark ? color[1] : color[0]
    })
  })
  const fontBgColorSetByTheme = computed(() => {
    return fontBgColorSet.map((color) => {
      return envStore.isDark ? color[1] : color[0]
    })
  })

  watch(
    () => editorStore.isShowEditorMenu,
    (isShowEditorMenu, prevIsShowEditorMenu) => {
      if (isShowEditorMenu && !prevIsShowEditorMenu) {
        rerenderKey.value += 1
      }
    }
  )
  editorEventBus.on('editorMounted', ({ core }) => {
    watch(
      () => envStore.isDark,
      (nowIsDark, preIsDark) => {
        if (nowIsDark !== preIsDark) {
          core.emit('changeTheme', { theme: nowIsDark ? 'dark' : 'light' })
        }
      }
    )
  })

  return {
    rerenderKey,
    fontFancyBtnRef,
    fontFancyBtnBounding,
    fontColorSetByTheme,
    fontBgColorSetByTheme,
    getMenuIconStyleFromActiveFontFancy,
  }
}
