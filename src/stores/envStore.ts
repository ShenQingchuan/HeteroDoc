import { defineStore } from 'pinia'
import { darkModeCacheKey } from '../constants/keys'

export const useEnvStore = defineStore('env', {
  state: () => {
    const isDark = useDark()
    const darkModeCache = useStorage(darkModeCacheKey, `${isDark}`)
    return {
      isDark,
      darkModeCache,
    }
  },
  actions: {
    toggleDark() {
      this.isDark = !this.isDark
      this.darkModeCache = `${this.isDark}`
    },
  },
})
