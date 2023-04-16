import { onClickOutside } from '@vueuse/core'
import { HETERO_BLOCK_NODE_DATA_TAG } from '@hetero/editor'
import { editorEventBus } from '../eventBus'
import { SIDE_BTN_HEIGHT } from '../constants/editor'

const listTypeTags = ['ul', 'ol', 'li']

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
  const editorStore = useEditorStore()
  const { width: winWidth, height: winHeight } = useWindowSize()
  const sideToolBtnLeft = ref(0)
  const hoverNodePos = ref(0)
  const hoveringBlockElement = shallowRef<HTMLElement>()
  const hoveringLayerWidth = ref(0)
  const sideDragBtn = shallowRef<HTMLElement>()
  const sideToolMenu = shallowRef<HTMLElement>()
  const isMousePressingDown = ref(false)
  const isMouseMoved = ref(false)
  const dragingMirror = shallowRef<HTMLElement>()
  const { isOutside: isNotHoveringSideToolMenu } =
    useMouseInElement(sideToolMenu)
  const isSideToolBtnShow = ref(false)
  const isSideToolMenuShow = ref(false)
  const { x: mouseX, y: mouseY } = useMouse()

  const hideSideToolBtn = () => {
    isSideToolBtnShow.value = false
  }
  const handleMenuClick = (action: SideMenuAction) => {
    switch (action) {
      case 'insert-before':
        editor?.value?.cmdManager.chain
          .insertBefore({ pos: hoverNodePos.value })
          .focus()
          .run()
        break
      case 'insert-after':
        editor?.value?.cmdManager.chain
          .insertAfter({ pos: hoverNodePos.value })
          .focus()
          .run()
        break
      default:
        break
    }
    isSideToolMenuShow.value = false
  }
  const controlSideToolStatusForEditorDOMArea = (editorDOM: HTMLElement) => {
    const { isOutside: isOutsideEditorDOM } = useMouseInElement(editorDOM)
    watch(
      [isOutsideEditorDOM, isNotHoveringSideToolMenu],
      ([isOutsideEditor, isNotHoveringMenu]) => {
        if (isOutsideEditor && isNotHoveringMenu) {
          hideSideToolBtn()
        }
      }
    )
  }
  const onSideBtnClick = () => {
    isSideToolMenuShow.value = true
  }
  const isDisableSideBtnMoving = computed(() => {
    return isMousePressingDown.value || isSideToolMenuShow.value
  })

  // Computed:
  const hoveringBlockElementRect = computed(() => {
    if (hoveringBlockElement.value) {
      return hoveringBlockElement.value.getBoundingClientRect()
    }
    return null
  })
  const sideToolBtnTop = computed(() => {
    if (!hoveringBlockElementRect.value) {
      return 0
    }
    const { height: hoverBlockRectHeight, top: hoverBlockRectTop } =
      hoveringBlockElementRect.value
    if (isHoveringListType.value) {
      return hoverBlockRectTop + 4
    }

    return (
      hoverBlockRectTop +
      window.scrollY +
      0.5 * hoverBlockRectHeight -
      0.5 * SIDE_BTN_HEIGHT
    )
  })
  const isHoveringListType = computed(() => {
    return (
      hoveringBlockElement.value &&
      listTypeTags.includes(hoveringBlockElement.value.tagName.toLowerCase())
    )
  })

  // ------ About Drag and Drop ---------
  const setDraggingMirrorWrapperStyle = (el: HTMLElement) => {
    el.style.position = 'fixed'
    el.style.zIndex = '9999'
    el.style.pointerEvents = 'none'
    el.style.opacity = '0.8'
    el.style.transform = `translateY(-50%)`
    // Add ProseMirror class to make it align with editor,
    // And append to body
    el.classList.add('ProseMirror')
    el.classList.add('hetero-drag-mirror')
  }
  const createDraggingMirror = (clonedDOM: HTMLElement) => {
    let clonedBlockWrapper = document.createElement('div') as HTMLElement

    if (hoveringBlockElement.value?.tagName.toLowerCase() === 'li') {
      const closetListContainer =
        hoveringBlockElement.value.closest<HTMLElement>('ul,ol')
      if (closetListContainer) {
        clonedBlockWrapper = document.createElement(
          closetListContainer.tagName.toLowerCase()
        )
        clonedBlockWrapper.setAttribute(
          HETERO_BLOCK_NODE_DATA_TAG,
          closetListContainer.getAttribute(HETERO_BLOCK_NODE_DATA_TAG) || 'true'
        )
      }
    }
    setDraggingMirrorWrapperStyle(clonedBlockWrapper)
    clonedBlockWrapper.append(clonedDOM)
    return clonedBlockWrapper
  }
  watchEffect(() => {
    if (!dragingMirror.value) {
      return
    }
    document.body.append(dragingMirror.value as HTMLElement)
  })
  const onMouseMove = () => {
    if (isMousePressingDown.value && !isMouseMoved.value) {
      if (!hoveringBlockElement.value) {
        // This also means hoverNodePos can't be 0,
        // because we don't want to drag the whole editor
        return
      }
      // Use VueUse's useMouse to get the position of the mouse,
      // set the x,y to the cloned block's position
      dragingMirror.value = createDraggingMirror(
        hoveringBlockElement.value.cloneNode(true) as HTMLElement
      )
      editor?.value.emit('dragBlock', {
        hoverNodePos: hoverNodePos.value,
        hoverBlockRect: hoveringBlockElement.value.getBoundingClientRect(),
      })
      isMouseMoved.value = true
    }
  }
  const onSideDragBtnMouseDown = () => {
    isMousePressingDown.value = true
  }
  const onMouseUp = () => {
    // Since 'click' event is triggered after 'mouseup' event,
    // So we can divide the logic into two parts:
    // 1. If the mouse is moved, we should do drag and drop
    // 2. If the mouse is not moved, we should do click
    if (isMouseMoved.value) {
      try {
        dragingMirror.value?.remove()
        // Get current position of the last hovered block
        // and find its position in the editor
        const lastHoveredBlock = editorStore.draggingOverElement
        if (!lastHoveredBlock) {
          return
        }
        const pos = editor?.value.view.posAtDOM(lastHoveredBlock, 0)
        if (pos === undefined) {
          return
        }
        editor?.value.emit('dropBlock', {
          dropPos: pos,
          isAppend: editorStore.isDropToAppend,
        })
      } finally {
        editorEventBus.emit('dropEnd', null)
      }
    } else {
      onSideBtnClick()
    }
    isMousePressingDown.value = false
    isMouseMoved.value = false
  }

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
  useEventListener(sideDragBtn, 'mousedown', onSideDragBtnMouseDown)
  useEventListener(document, 'mousemove', onMouseMove)
  useEventListener(document, 'mouseup', onMouseUp)
  onClickOutside(
    sideToolMenu,
    () => {
      if (isSideToolMenuShow.value) {
        isSideToolMenuShow.value = false
      }
    },
    {
      ignore: [sideDragBtn],
    }
  )

  return {
    isDisableSideBtnMoving,
    isSideToolMenuShow,
    hoverNodePos,
    hoveringBlockElement,
    hoveringBlockElementRect,
    hoveringLayerWidth,
    menuOptions,
    isSideToolBtnShow,
    sideDragBtn,
    sideToolBtnTop,
    sideToolBtnLeft,
    sideToolMenu,
    handleMenuClick,
    controlSideToolStatusForEditorDOMArea,
  }
}
