export function useThemeModeText() {
  const { t } = useI18n()
  const env = useEnvStore()

  return computed(
    () =>
      `${
        env.isDark
          ? t('common-header.menu.theme-mode-light')
          : t('common-header.menu.theme-mode-dark')
      }${t('common-header.menu.theme-mode-text')}`
  )
}
