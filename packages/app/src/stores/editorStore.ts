import type { HyperlinkAttrs } from '@hetero/editor'
import type { EditorFloatMenuAction } from '../constants/editor'

interface EditorStoreState {
  prevLinkAttrs: HyperlinkAttrs | null
  linkEditURL: string
  linkEditText: string
  floatMenuByAction: EditorFloatMenuAction | null
  floatTargetNodeLeft: number
  floatTargetNodeTop: number
  isShowEditorMenu: boolean
  isShowLinkEdit: boolean
}

const createInitEditorStoreState = (): EditorStoreState => {
  return {
    prevLinkAttrs: null,
    linkEditURL: '',
    linkEditText: '',
    floatMenuByAction: null,
    floatTargetNodeLeft: Number.NaN,
    floatTargetNodeTop: Number.NaN,
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
    setShowEditorMenu(value: boolean) {
      this.isShowEditorMenu = value
      return this
    },
    setShowLinkEdit(value: boolean) {
      this.isShowLinkEdit = value
      if (!value) {
        this.prevLinkAttrs = null
      }
      return this
    },
    setFloatMenuPosition(pos: { left: number; top: number }, action: EditorFloatMenuAction) {
      const { left, top } = pos
      this.floatTargetNodeLeft = left
      this.floatTargetNodeTop = top
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
