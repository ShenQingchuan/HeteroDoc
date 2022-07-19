export const useEditorStore = defineStore('editor', {
  state: () => {
    return {
      selectionNodeLeft: 0,
      selectionNodeTop: 0,
      isShowEditorMenu: false,
      isShowLinkEdit: false,
    }
  },
  getters: {
    popoverTop: (state) => {
      return state.selectionNodeTop + 30
    },
  },
  actions: {
    setShowEditorMenu(value: boolean) {
      this.isShowEditorMenu = value
    },
    setShowLinkEdit(value: boolean) {
      this.isShowLinkEdit = value
    },
    setSelectionPosition(left: number, top: number) {
      this.selectionNodeLeft = left
      this.selectionNodeTop = top
    },
  },
})
