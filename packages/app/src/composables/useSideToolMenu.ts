type SideMenuAction = 'insert-before' | 'insert-after'
interface SideMenuOption {
  key: SideMenuAction
  label: string
  icon: string
}

export function useSideToolMenu() {
  const { t } = useI18n()
  const menuOptions: SideMenuOption[] = [
    {
      key: 'insert-before',
      label: t('editor.menu.sidemenu-insert-before'),
      icon: 'i-gg:insert-before-o',
    },
    {
      key: 'insert-after',
      label: t('editor.menu.sidemenu-insert-after'),
      icon: 'i-gg:insert-after-o',
    },
  ]

  const editor = useEditorCoreInject()
  const { width: winWidth, height: winHeight } = useWindowSize()
  const sideToolBtnTop = ref(0)
  const sideToolBtnLeft = ref(0)
  const hoverNodePos = ref(0)
  const hoverElementRect = ref<DOMRect>()
  const isShowHoverElementBouding = ref(false)
  const sideToolBtn = ref<HTMLElement | null>(null)
  const sideToolMenu = ref<HTMLElement | null>(null)
  const { isOutside: isNotHoveringSideToolBtn } = useMouseInElement(sideToolBtn)
  const { isOutside: isNotHoveringSideToolMenu } = useMouseInElement(sideToolMenu)
  const { y: mouseY } = useMouse()
  const isMouseVerticalAlignWithHoverBlockElm = computed(() => {
    if (!hoverElementRect.value)
      return false
    const { top, bottom } = hoverElementRect.value
    return mouseY.value >= top && mouseY.value <= bottom
  })
  const isSideToolBtnShow = ref(false)
  const isSideToolMenuShow = useDebounce(computed(() => {
    return !isNotHoveringSideToolBtn.value
      || !isNotHoveringSideToolMenu.value
  }), 160)

  const hideSideToolBtn = () => {
    isSideToolBtnShow.value = false
  }
  const handleMenuClick = (action: SideMenuAction) => {
    switch (action) {
      case 'insert-before':
        editor?.value?.cmdManager.chain.insertBefore({ pos: hoverNodePos.value }).focus().run()
        break
      case 'insert-after':
        editor?.value?.cmdManager.chain.insertAfter({ pos: hoverNodePos.value }).focus().run()
        break
      default:
        break
    }
  }
  const controlSideToolStatusForEditorDOMArea = (editorDOM: HTMLElement) => {
    const { isOutside: isOutsideEditorDOM } = useMouseInElement(editorDOM)
    watch([isOutsideEditorDOM, isNotHoveringSideToolMenu], ([isOutsideEditor, isNotHoveringMenu]) => {
      if (isOutsideEditor && isNotHoveringMenu) {
        hideSideToolBtn()
      }
    })
  }

  watch(isNotHoveringSideToolBtn, (isNotHoveringBtn) => {
    if (isNotHoveringBtn) {
      isShowHoverElementBouding.value = false
    }
  })
  watch([isMouseVerticalAlignWithHoverBlockElm, isNotHoveringSideToolMenu], ([isAlign, isNotHoveringMenu]) => {
    if (!isAlign && isNotHoveringMenu) {
      hideSideToolBtn()
    }
  })
  watch([winWidth, winHeight], () => {
    hideSideToolBtn()
  })

  return {
    isSideToolBtnShow,
    sideToolBtnTop,
    sideToolBtnLeft,
    isSideToolMenuShow,
    hoverNodePos,
    hoverElementRect,
    menuOptions,
    isShowHoverElementBouding,
    sideToolBtn,
    sideToolMenu,
    handleMenuClick,
    hideSideToolBtn,
    controlSideToolStatusForEditorDOMArea,
  }
}
