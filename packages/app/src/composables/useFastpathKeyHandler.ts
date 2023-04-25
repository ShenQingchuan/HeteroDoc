import type { CommandProps } from '@hetero/editor'

const FastpathKeyOptions = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'blockquote',
  'codeBlock',
  'horizontalLine',
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
      editorCore?.value.emit('deactivateInputFastPath', {
        isContentChanged: true,
        params: editorStore.fastpathParams,
      })
    }

  const deleteSlash = () =>
    editorCore?.value.commands.command({
      fn: ({ dispatch, tr }: CommandProps) => {
        const { from, empty } = tr.selection
        if (dispatch && empty) {
          tr.delete(from - 1, from)
        }
        return true
      },
    })
  const getFastpathCommandChain = () => {
    // delete the '/' first
    deleteSlash()
    return editorCore?.value.cmdManager.chain
  }

  const handleHeadingFastpath = runInputFastPath((level: number) => {
    const cmdChain = getFastpathCommandChain()
    if (editorStore.isFastpathAppend) {
      cmdChain
        ?.appendBlockNode({ nameOrType: 'heading' })
        .updateAnchorId()
        .run()
      return
    }
    cmdChain?.toggleHeading({ level }).run()
  })
  const handleQuoteFastpath = runInputFastPath(() => {
    const cmdChain = getFastpathCommandChain()
    if (editorStore.isFastpathAppend) {
      cmdChain?.appendBlockNode({ nameOrType: 'blockquote' }).run()
      return
    }
    cmdChain?.setBlockquote().run()
  })
  const handleCodeblockFastpath = runInputFastPath(() => {
    const cmdChain = getFastpathCommandChain()
    if (editorStore.isFastpathAppend) {
      cmdChain?.appendBlockNode({ nameOrType: 'codeBlock' }).run()
      return
    }
    cmdChain?.setCodeblock({ params: 'plaintext' }).run()
  })
  const handleHorizontalFastpath = runInputFastPath(() => {
    const cmdChain = getFastpathCommandChain()
    if (editorStore.isFastpathAppend) {
      cmdChain?.appendBlockNode({ nameOrType: 'horizontalLine' }).run()
      return
    }
    cmdChain?.setHorizontal().run()
  })
  const handleBulletListFastpath = runInputFastPath(() => {
    const cmdChain = getFastpathCommandChain()
    if (editorStore.isFastpathAppend) {
      cmdChain?.appendBlockNode({ nameOrType: 'bulletList' }).run()
      return
    }
    cmdChain?.toggleBulletList().run()
  })
  const handleOrderedListFastpath = runInputFastPath(() => {
    const cmdChain = getFastpathCommandChain()
    if (editorStore.isFastpathAppend) {
      cmdChain?.appendBlockNode({ nameOrType: 'orderedList' }).run()
      return
    }
    cmdChain?.toggleOrderedList().run()
  })

  const fastPathHandlerMap = {
    ...Array.from({ length: 5 }, (_, i) => i + 1).reduce((acc, level) => {
      acc[`h${level}`] = () => handleHeadingFastpath(level)
      return acc
    }, {} as Record<string, (...args: any) => void>),
    blockquote: handleQuoteFastpath,
    codeBlock: handleCodeblockFastpath,
    horizontalLine: handleHorizontalFastpath,
    bulletList: handleBulletListFastpath,
    orderedList: handleOrderedListFastpath,
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
