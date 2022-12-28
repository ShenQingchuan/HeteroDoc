type SideMenuAction = 'insert-before' | 'insert-after'
interface SideMenuOption {
  key: SideMenuAction
  label: string
  icon: string
}

export function useSideToolMenu() {
  const { t } = useI18n()
  const editor = useEditorCoreInject()
  const isSideToolBtnShow = ref(false)
  const sideToolBtnTop = ref(0)
  const sideToolBtnLeft = ref(0)
  const isSideToolMenuShow = ref(false)
  const hoverNodePos = ref(0)

  const menuOptions = computed<SideMenuOption[]>(() => {
    return [
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
  })

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
    isSideToolMenuShow.value = false
  }

  return {
    isSideToolBtnShow,
    sideToolBtnTop,
    sideToolBtnLeft,
    isSideToolMenuShow,
    hoverNodePos,
    menuOptions,
    handleMenuClick,
  }
}
