<script setup lang="ts">
const { t } = useI18n()
const envStore = useEnvStore()
const themeModeText = useThemeModeText()
</script>

<template>
  <div
    class="hd-common-header__container"
    py2 px4 flex-items-center z-2 border-b="gray-200/80 1 solid" bg-base
  >
    <div class="hd-common-header__hero" flex-items-center>
      <div i-twemoji-sheaf-of-rice text-10 />
      <span ml1 my0 text-6 font-medium txt-color-base select-none>
        HeteroDocs
      </span>
    </div>

    <div class="hd-common-header__menu" flex-items-center ml-auto>
      <n-button type="default" quaternary mx-2>
        <i i-carbon-login text-6 mr2 font-light txt-color-base />
        <span txt-color-base font-bold>
          {{ t('common-header.menu.action-login') }}
          <span mx1 font-light>│</span>
          {{ t('common-header.menu.action-sign-up') }}
        </span>
      </n-button>
      <n-button type="default" quaternary mx-2 @click="envStore.toggleDark()">
        <i v-if="envStore.isDark" i-carbon-light text-6 mr2 font-light txt-color-base />
        <i v-else i-carbon-moon text-6 mr2 font-light txt-color-base />
        <span txt-color-base font-bold>{{ themeModeText }}</span>
      </n-button>
    </div>
  </div>
</template>
