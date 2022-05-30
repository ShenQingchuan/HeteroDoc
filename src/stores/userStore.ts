import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      id: 0,
      token: '',
      description: '',
    }
  },
  getters: {
    idString: (state) => {
      return `0x${state.id.toString(16).padStart(0)}`
    },
  },
})
