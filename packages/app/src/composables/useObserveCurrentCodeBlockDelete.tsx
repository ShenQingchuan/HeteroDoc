export function useObserveCurrentCodeBlockDelete(
  mutationCallback: MutationCallback,
) {
  const currentCodeBlockElement = ref<HTMLElement>()
  const observeForCurrentCodeBlockElement = new MutationObserver((...args) => {
    if (currentCodeBlockElement.value === undefined) {
      return
    }
    if (!document.body.contains(currentCodeBlockElement.value)) {
      mutationCallback(...args)
    }
  })
  observeForCurrentCodeBlockElement.observe(document.body, {
    childList: true,
    subtree: true,
  })

  return {
    currentCodeBlockElement,
  }
}
