import { defineStore } from 'pinia'

export const useEnvStore = defineStore('env', {
  state: () => {
    const isDark = useDark()
    return {
      isDark,
    }
  },
  actions: {
    toggleDark() {
      this.isDark = !this.isDark
    },
  },
})
