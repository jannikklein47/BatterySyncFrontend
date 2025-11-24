import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'src/boot/axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    userObject: {},
    admin: false,
  }),

  getters: {
    user: (state) => {
      return state.userObject
    },
    loggedIn: (state) => {
      return state.userObject.email ? true : false
    },
    isAdmin: (state) => {
      return state.admin
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
          await this.checkAdmin()
          return true
        } else {
          return result.status
        }
      } catch (error) {
        return error.response?.data || error.message
      }
    },
    async auth(token) {
      try {
        const result = await api.get('/login/auth', { headers: { Authorization: token } })

        if (result.status === 200) {
          const email = result.data
          this.userObject = { email: email, token: token }

          return true
        } else {
          return false
        }
      } catch {
        return false
      }
    },
    async checkAdmin() {
      try {
        const result = await api.get('/login/admin')

        if (result.status === 200) {
          const admin = result.data
          this.admin = admin

          return admin
        } else {
          return false
        }
      } catch {
        return false
      }
    },
    logout() {
      localStorage.removeItem('accessToken')
      this.userObject = {}
      this.admin = false
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
