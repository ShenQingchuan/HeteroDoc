<script setup lang="ts">
import { darkTheme, lightTheme } from 'naive-ui'
import { naiveUILocale } from './constants/locales'

const { locale } = useI18n()
const envStore = useEnvStore()
const isDark = useDark()
const naiveUITheme = ref(isDark ? darkTheme : lightTheme)

envStore.$subscribe((_, state) => {
  naiveUITheme.value = state.isDark
    ? darkTheme
    : lightTheme
})
</script>

<template>
  <n-config-provider
    :theme="naiveUITheme"
    :locale="naiveUILocale[locale]"
  >
    <router-view />
  </n-config-provider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
