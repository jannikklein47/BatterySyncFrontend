import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'src/boot/axios'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    dataObject: {},
  }),

  getters: {
    data: (state) => {
      return state.dataObject
    },
  },

  actions: {
    async loadData(timeframe = '1 day', interval = '30', key = 'none') {
      try {
        const result = await api.get(
          '/metrics?timeframe=' + timeframe + '&intervalMinutes=' + interval + '&key=' + key,
        )

        if (result.status !== 200) return false

        this.dataObject = result.data
        return true
      } catch {
        return false
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAdminStore, import.meta.hot))
}
