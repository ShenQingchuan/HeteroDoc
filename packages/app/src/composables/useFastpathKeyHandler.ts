type FastpathKey = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'quote' | 'codeblock'
type FastPathKeyMap = Record<FastpathKey, (...args: any) => void>

export function useFastpathHandler() {
  const editorCore = useEditorCoreInject()
  const editorStore = useEditorStore()
  const activeOption = ref<FastpathKey | '' | undefined>()

  const runInputFastPath = (runActions: (...args: any) => void) => (...args: Parameters<typeof runActions>) => {
    runActions(...args)
    editorStore.setShowInputFastpath(false)
    editorCore?.value.view.focus()
    editorCore?.value.emit(
      'deactivateInputFastPath',
      { isContentChanged: true },
    )
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

  const fastPathHandlerMap = {
    ...Array.from({ length: 5 }, (_, i) => i + 1).reduce((acc, level) => {
      acc[`h${level}`] = () => onClickHeadingFastpath(level)
      return acc
    }, {} as Record<string, (...args: any) => void>),
    quote: onClickQuoteFastpath,
    codeblock: onClickCodeblockFastpath,
  } as FastPathKeyMap

  const onFastpathActionKey = (event: KeyboardEvent) => {
    if (!editorStore.isShowInputFastpath) {
      return
    }
    // check arrow up & down
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      event.stopPropagation()

      const options: FastpathKey[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'quote', 'codeblock']
      const activeIndex = activeOption.value ? options.indexOf(activeOption.value) : -1
      if (activeIndex === -1) {
        activeOption.value = options[0]
      }
      else if (event.key === 'ArrowUp') {
        activeOption.value = options[activeIndex - 1] ?? options[options.length - 1]
      }
      else if (event.key === 'ArrowDown') {
        activeOption.value = options[activeIndex + 1] ?? options[0]
      }
    }
    else if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()

      if (activeOption.value) {
        fastPathHandlerMap[activeOption.value]()
      }
      editorStore.setShowInputFastpath(false)
    }
  }

  return {
    activeOption,
    onFastpathActionKey,
    onClickHeadingFastpath,
    onClickQuoteFastpath,
    onClickCodeblockFastpath,
  }
}

