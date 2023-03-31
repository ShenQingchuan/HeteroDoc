import { darkTheme, lightTheme } from 'naive-ui'

export function useNaiveThemeSetup() {
  const envStore = useEnvStore()
  const naiveUITheme = ref(envStore.isDark ? darkTheme : lightTheme)

  envStore.$subscribe((_, state) => {
    naiveUITheme.value = state.isDark ? darkTheme : lightTheme
  })

  return naiveUITheme
}
