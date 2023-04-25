import type { HyperlinkAttrs } from '@hetero/editor'
import type { EditorFloatMenuAction } from '../constants/editor'

interface EditorStoreState {
  menuActiveState: {
    bold: boolean
    italic: boolean
    underline: boolean
    code: boolean
    deleteLine: boolean
  }
  menuAvailableState: {
    hyperlink: boolean
  }
  prevLinkAttrs: HyperlinkAttrs | undefined
  linkEditURL: string
  linkEditText: string
  floatMenuByAction: EditorFloatMenuAction | undefined
  floatTargetNodeLeft: number
  floatTargetNodeRight: number
  floatTargetNodeTop: number
  isShowCodeblockLangSelector: boolean
  isShowInputFastpath: boolean
  isShowEditorMenu: boolean
  isShowLinkEdit: boolean
  isShowFontFancyPicker: boolean
  isDropToAppend: boolean
  draggingOverElement: HTMLElement | undefined
  fastpathParams:
    | {
        isNeedAppend?: boolean
      }
    | undefined
}

const createInitEditorStoreState = (): EditorStoreState => {
  return {
    menuActiveState: {
      bold: false,
      italic: false,
      underline: false,
      code: false,
      deleteLine: false,
    },
    menuAvailableState: {
      hyperlink: false,
    },
    prevLinkAttrs: undefined,
    linkEditURL: '',
    linkEditText: '',
    floatMenuByAction: undefined,
    floatTargetNodeLeft: Number.NaN,
    floatTargetNodeRight: Number.NaN,
    floatTargetNodeTop: Number.NaN,
    isShowCodeblockLangSelector: false,
    isShowInputFastpath: false,
    isShowEditorMenu: false,
    isShowLinkEdit: false,
    isShowFontFancyPicker: false,
    isDropToAppend: false,
    draggingOverElement: undefined,
    fastpathParams: undefined,
  }
}

export const useEditorStore = defineStore('editor', {
  state: () => {
    return createInitEditorStoreState()
  },
  getters: {
    popoverTop: (state) => {
      return state.floatTargetNodeTop + 30
    },
    isFastpathAppend: (state) => {
      return state.fastpathParams?.isNeedAppend ?? false
    },
  },
  actions: {
    setPrevLinkAttrs() {
      this.prevLinkAttrs = {
        url: this.linkEditURL,
      }
      return this
    },
    setLinkEditURL(url: string) {
      this.linkEditURL = url
      return this
    },
    setLinkEditText(text: string) {
      this.linkEditText = text
      return this
    },
    setShowInputFastpath(value: boolean) {
      this.isShowInputFastpath = value
      return this
    },
    setShowEditorMenu(value: boolean) {
      this.isShowEditorMenu = value
      this.resetFloatMenuPos()
      return this
    },
    setShowFontFancyPicker(value: boolean) {
      this.isShowFontFancyPicker = value
      return this
    },
    setShowCodeBlockLangSelector(value: boolean) {
      this.isShowCodeblockLangSelector = value
      return this
    },
    setShowLinkEdit(value: boolean) {
      this.isShowLinkEdit = value
      if (!value) {
        this.prevLinkAttrs = undefined
      }
      return this
    },
    setFloatMenuPosition(
      pos: Partial<{ left: number; top: number; right: number }>,
      action: EditorFloatMenuAction
    ) {
      const { left, right, top } = pos
      this.floatTargetNodeLeft = left ?? Number.NaN
      this.floatTargetNodeRight = right ?? Number.NaN
      this.floatTargetNodeTop = top ?? Number.NaN
      this.floatMenuByAction = action
      return this
    },
    resetFloatMenuPos() {
      this.floatMenuByAction = undefined
      this.floatTargetNodeLeft = Number.NaN
      this.floatTargetNodeTop = Number.NaN
      return this
    },
    resetLinkEdit() {
      this.linkEditURL = ''
      this.linkEditText = ''
      return this
    },
    setDraggingOverElement(el: HTMLElement | undefined) {
      this.draggingOverElement = el
      return this
    },
    setDropToAppend(value: boolean) {
      this.isDropToAppend = value
      return this
    },
    setFastpathParams(params: EditorStoreState['fastpathParams']) {
      this.fastpathParams = params
      return this
    },
  },
})
