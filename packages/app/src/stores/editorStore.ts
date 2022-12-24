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
  prevLinkAttrs: HyperlinkAttrs | null
  linkEditURL: string
  linkEditText: string
  floatMenuByAction: EditorFloatMenuAction | null
  floatTargetNodeLeft: number
  floatTargetNodeRight: number
  floatTargetNodeTop: number
  isShowCodeblockLangSelector: boolean
  isShowInputFastpath: boolean
  isShowEditorMenu: boolean
  isShowLinkEdit: boolean
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
    prevLinkAttrs: null,
    linkEditURL: '',
    linkEditText: '',
    floatMenuByAction: null,
    floatTargetNodeLeft: Number.NaN,
    floatTargetNodeRight: Number.NaN,
    floatTargetNodeTop: Number.NaN,
    isShowCodeblockLangSelector: false,
    isShowInputFastpath: false,
    isShowEditorMenu: false,
    isShowLinkEdit: false,
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
      return this
    },
    setShowCodeBlockLangSelector(value: boolean) {
      this.isShowCodeblockLangSelector = value
      return this
    },
    setShowLinkEdit(value: boolean) {
      this.isShowLinkEdit = value
      if (!value) {
        this.prevLinkAttrs = null
      }
      return this
    },
    setFloatMenuPosition(
      pos: Partial<{ left: number; top: number; right: number }>,
      action: EditorFloatMenuAction,
    ) {
      const { left, right, top } = pos
      this.floatTargetNodeLeft = left ?? Number.NaN
      this.floatTargetNodeRight = right ?? Number.NaN
      this.floatTargetNodeTop = top ?? Number.NaN
      this.floatMenuByAction = action
      return this
    },
    resetFloatMenuPos() {
      this.floatMenuByAction = null
      this.floatTargetNodeLeft = Number.NaN
      this.floatTargetNodeTop = Number.NaN
      return this
    },
    resetLinkEdit() {
      this.linkEditURL = ''
      this.linkEditText = ''
      return this
    },
  },
})
