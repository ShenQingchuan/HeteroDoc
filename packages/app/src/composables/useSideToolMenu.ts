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
  const hoveringBlockElement = ref<HTMLElement>()
  const hoveringTopBlockElement = ref<HTMLElement>()
  const hoveringBlockElementRect = ref<DOMRect>()
  const hoveringTopBlockElementRect = ref<DOMRect>()
  const isShowHoverElementBouding = ref(false)
  const sideToolBtn = ref<HTMLElement>()
  const sideDragBtn = ref<HTMLElement>()
  const sideToolMenu = ref<HTMLElement>()
  const dragingMirror = ref<HTMLElement>()
  const isDragging = ref(false)
  const { isOutside: isNotHoveringSideToolBtn } = useMouseInElement(sideToolBtn)
  const { isOutside: isNotHoveringSideDragBtn } = useMouseInElement(sideDragBtn)
  const { isOutside: isNotHoveringSideToolMenu } = useMouseInElement(sideToolMenu)
  const isSideToolBtnShow = ref(false)
  const isSideToolMenuShow = useDebounce(computed(() => {
    return !isNotHoveringSideToolBtn.value
      || !isNotHoveringSideToolMenu.value
  }), 160)
  const { x: mouseX, y: mouseY } = useMouse()

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
  const onSideBtnMouseOver = () => {
    isSideToolBtnShow.value = true
    isShowHoverElementBouding.value = true
  }

  // ------ About Drag and Drop ---------
  const createDraggingMirror = (clonedDOM: HTMLElement) => {
    const clonedBlockWrapper = document.createElement('div')
    clonedBlockWrapper.style.position = 'fixed'
    clonedBlockWrapper.style.zIndex = '9999'
    clonedBlockWrapper.style.pointerEvents = 'none'
    clonedBlockWrapper.style.opacity = '0.8'
    // Add ProseMirror class to make it align with editor,
    // And append to body
    clonedBlockWrapper.classList.add('ProseMirror')
    clonedBlockWrapper.appendChild(clonedDOM)
    return clonedBlockWrapper
  }
  watchEffect(() => {
    if (!dragingMirror.value) {
      return
    }
    document.body.appendChild(dragingMirror.value as HTMLElement)
  })
  const onSideDragBtnMouseDown = () => {
    if (!hoveringBlockElement.value) {
      // This also means hoverNodePos can't be 0,
      // because we don't want to drag the whole editor
      return
    }
    // Use VueUse's useMouse to get the position of the mouse,
    // set the x,y to the cloned block's position
    dragingMirror.value = createDraggingMirror(hoveringBlockElement.value.cloneNode(true) as HTMLElement)
    editor?.value.emit('dragBlock', {
      hoverNodePos: hoverNodePos.value,
      hoverBlockRect: hoveringBlockElement.value.getBoundingClientRect(),
    })
    isDragging.value = true
  }
  const onMouseUpForDrop = () => {
    if (!isDragging.value) {
      return
    }
    dragingMirror.value?.remove()
    // Get current position of the mouse
    // and find the hovering block in editor
    const { pos } = editor?.value.view.posAtCoords({
      left: mouseX.value,
      top: mouseY.value,
    }) || {}
    if (!pos) {
      return
    }
    editor?.value.emit('dropBlock', { dropPos: pos })
  }

  watch([isNotHoveringSideToolBtn, isNotHoveringSideDragBtn], ([isNotHoveringToolBtn, isNotHoveringDragBtn]) => {
    if (isNotHoveringToolBtn && isNotHoveringDragBtn) {
      isShowHoverElementBouding.value = false
    }
  })
  watch([winWidth, winHeight], () => {
    hideSideToolBtn()
  })
  watchEffect(() => {
    if (!dragingMirror.value) {
      return
    }
    dragingMirror.value.style.left = `${mouseX.value}px`
    dragingMirror.value.style.top = `${mouseY.value}px`
  })

  // Bind events
  useEventListener(sideToolBtn, 'mouseover', onSideBtnMouseOver)
  useEventListener(sideDragBtn, 'mouseover', onSideBtnMouseOver)
  useEventListener(sideDragBtn, 'mousedown', onSideDragBtnMouseDown)
  useEventListener(document, 'mouseup', onMouseUpForDrop)

  return {
    isSideToolBtnShow,
    sideToolBtnTop,
    sideToolBtnLeft,
    isSideToolMenuShow,
    hoverNodePos,
    hoveringBlockElement,
    hoveringBlockElementRect,
    hoveringTopBlockElementRect,
    hoveringTopBlockElement,
    menuOptions,
    isShowHoverElementBouding,
    sideToolBtn,
    sideDragBtn,
    sideToolMenu,
    handleMenuClick,
    hideSideToolBtn,
    controlSideToolStatusForEditorDOMArea,
  }
}
