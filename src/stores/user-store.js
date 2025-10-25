import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'src/boot/axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    userObject: {},
  }),

  getters: {
    user: (state) => {
      return state.userObject
    },
    loggedIn: (state) => {
      return state.userObject.email ? true : false
    },
  },

  actions: {
    async login(email, password) {
      try {
        const result = await api.post('/login', { email: email, password: password })

        if (result.status === 200) {
          const token = result.data

          localStorage.setItem('accessToken', token)

          this.userObject = { email: email, token: token }
          return true
        } else {
          return result.status
        }
      } catch (error) {
        return error.response?.data || error.message
      }
    },
    async auth(token) {
      const result = await api.get('/auth', { headers: { Authorization: token } })

      if (result.status === 200) {
        const email = result.data
        this.userObject = { email: email, token: token }

        return true
      } else {
        return false
      }
    },
    logout() {
      localStorage.removeItem('accessToken')
      this.userObject = {}
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
