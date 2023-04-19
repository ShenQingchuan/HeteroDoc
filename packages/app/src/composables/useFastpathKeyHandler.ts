const FastpathKeyOptions = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'quote',
  'codeblock',
  'horizontal',
  'bulletList',
  'orderedList',
] as const

type FastPathKeyMap = Record<FastpathKey, (...args: any) => void>
type FastpathKey = (typeof FastpathKeyOptions)[number]

export function useFastpathHandler() {
  const editorCore = useEditorCoreInject()
  const editorStore = useEditorStore()
  const activeOption = ref<FastpathKey | '' | undefined>()

  const runInputFastPath =
    (runActions: (...args: any) => void) =>
    (...args: Parameters<typeof runActions>) => {
      runActions(...args)
      editorStore.setShowInputFastpath(false)
      editorCore?.value.view.focus()
      editorCore?.value.emit('deactivateInputFastPath', {
        isContentChanged: true,
      })
    }
  const onClickHeadingFastpath = runInputFastPath((level: number) => {
    editorCore?.value.commands.toggleHeading({ level })
  })
  const onClickQuoteFastpath = runInputFastPath(() => {
    editorCore?.value.commands.setBlockquote()
  })
  const onClickCodeblockFastpath = runInputFastPath(() => {
    editorCore?.value.commands.setCodeblock({ params: 'plaintext' })
  })
  const onClickHorizontalFastpath = runInputFastPath(() => {
    editorCore?.value.commands.setHorizontal()
  })
  const onClickBulletListFastpath = runInputFastPath(() => {
    editorCore?.value.commands.toggleBulletList()
  })
  const onClickOrderedListFastpath = runInputFastPath(() => {
    editorCore?.value.commands.toggleOrderedList()
  })

  const fastPathHandlerMap = {
    ...Array.from({ length: 5 }, (_, i) => i + 1).reduce((acc, level) => {
      acc[`h${level}`] = () => onClickHeadingFastpath(level)
      return acc
    }, {} as Record<string, (...args: any) => void>),
    quote: onClickQuoteFastpath,
    codeblock: onClickCodeblockFastpath,
    horizontal: onClickHorizontalFastpath,
    bulletList: onClickBulletListFastpath,
    orderedList: onClickOrderedListFastpath,
  } as FastPathKeyMap

  const onFastpathTrigger = (clickParams?: { option: FastpathKey }) => {
    // If there is `clickParams` passed in, it means that's triggered by click
    if (clickParams) {
      activeOption.value = clickParams.option
    }
    if (activeOption.value) {
      fastPathHandlerMap[activeOption.value]?.()
    }
    editorStore.setShowInputFastpath(false)
  }

  const onFastpathActionKey = (event: KeyboardEvent) => {
    if (!editorStore.isShowInputFastpath) {
      return
    }
    // check arrow up & down
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      event.stopPropagation()

      const activeIndex = activeOption.value
        ? FastpathKeyOptions.indexOf(activeOption.value)
        : -1
      if (activeIndex === -1) {
        activeOption.value = FastpathKeyOptions[0]
      } else if (event.key === 'ArrowUp') {
        activeOption.value =
          FastpathKeyOptions[activeIndex - 1] ??
          FastpathKeyOptions[FastpathKeyOptions.length - 1]
      } else if (event.key === 'ArrowDown') {
        activeOption.value =
          FastpathKeyOptions[activeIndex + 1] ?? FastpathKeyOptions[0]
      }
    } else if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      onFastpathTrigger()
    }
  }

  return {
    activeOption,
    onFastpathActionKey,
    onFastpathTrigger,
  }
}
