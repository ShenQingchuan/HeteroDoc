<script setup lang="ts">
import { naiveUILocale } from './constants/locales'

const { locale } = useI18n()
const naiveUITheme = useNaiveThemeSetup()
</script>

<template>
  <n-config-provider
    :theme="naiveUITheme"
    :locale="naiveUILocale[locale.value]"
  >
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
