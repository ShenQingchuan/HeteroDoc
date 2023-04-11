<script setup lang="ts">
import { naiveUILocale } from '../../constants/locales'

const { locale } = useI18n()
const naiveUITheme = useNaiveThemeSetup()
</script>

<template>
  <n-config-provider
    :theme="naiveUITheme"
    :locale="naiveUILocale[locale.value]"
  >
    <n-message-provider>
      <slot name="default" />
    </n-message-provider>
  </n-config-provider>
</template>
