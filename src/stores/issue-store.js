import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'src/boot/axios'

export const useIssueStore = defineStore('issue', {
  state: () => ({
    issuesArray: [],
  }),

  getters: {
    issues: (state) => {
      return state.issuesArray
    },
  },

  actions: {
    async loadIssues() {
      const result = await api.get('/issue')

      this.issuesArray = result.data

      return result.data
    },

    async changeStatus(id, status) {
      const result = await api.patch('/issue', { id: id, status: status })

      return result.data
    },

    async delete(id) {
      const result = await api.delete('/issue?id=' + id)
      const idx = this.issuesArray.findIndex((val) => val.id === id)
      this.issuesArray.splice(idx, 1)
      return result
    },

    async create(data) {
      const result = await api.post('/issue', data)
      this.issuesArray.unshift(result.data)
      return result
    },

    async update(data) {
      const result = await api.patch('/issue', data)
      return result
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useIssueStore, import.meta.hot))
}
