import type { EditorCore, FontFancyAttrs } from '@hetero/editor'
import { uniqueId } from 'lodash'
import type { CSSProperties } from 'vue'
import { fontBgColorDarkSet, fontBgColorLightSet, fontColorDarkSet, fontColorLightSet } from '../constants/fontFancy'

export const useFontFancyPicker = () => {
  const editorStore = useEditorStore()
  const envStore = useEnvStore()
  const rerenderKey = ref(uniqueId())
  const fontFancyBtnRef = ref<HTMLElement | null>(null)
  const fontFancyBtnBounding = useElementBounding(fontFancyBtnRef)
  const fontFancySet = computed(() => {
    return envStore.isDark
      ? { textColorSet: fontColorDarkSet, bgColorSet: fontBgColorDarkSet }
      : { textColorSet: fontColorLightSet, bgColorSet: fontBgColorLightSet }
  })
  const getStyleFromFancyAttrs = (fontFancyAttrs: FontFancyAttrs | null | undefined) => {
    if (!fontFancyAttrs)
      return {}
    const { color, bgColor } = fontFancyAttrs
    const style: CSSProperties = {}
    if (color)
      style.color = color
    if (bgColor)
      style.backgroundColor = bgColor
    return style
  }
  const getStyleFromActiveFontFancy = (core: EditorCore | undefined) => {
    const isFontFancyActive = core?.activeManager.isFontFancyActive()
    if (!isFontFancyActive)
      return {}
    const gotStyle = getStyleFromFancyAttrs(isFontFancyActive)
    return gotStyle
  }

  watch(() => editorStore.isShowEditorMenu, (
    isShowEditorMenu,
    prevIsShowEditorMenu,
  ) => {
    if (isShowEditorMenu && !prevIsShowEditorMenu) {
      rerenderKey.value = uniqueId()
    }
  })

  return {
    rerenderKey,
    fontFancyBtnRef,
    fontFancyBtnBounding,
    fontFancySet,
    getStyleFromActiveFontFancy,
  }
}
