import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'src/boot/axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    userObject: {},
    admin: false,
    tester: false,
    userIdValue: null,
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
    userId: (state) => {
      return state.userIdValue
    },
  },

  actions: {
    async login(email, password) {
      try {
        const result = await api.post('/login/web', { email: email, password: password })

        if (result.status === 200) {
          const token = result.data.token

          localStorage.setItem('accessToken', token)

          this.userObject = { email: email, token: token, data: result.data.data }
          await this.checkAdmin()
          await this.checkUserId()
          return true
        } else {
          return result.status
        }
      } catch (error) {
        return error.response?.data || error.message
      }
    },
    async register(email, password) {
      try {
        const result = await api.post('/login/register/web', { email: email, password: password })

        if (result.status === 200) {
          const token = result.data.token

          localStorage.setItem('accessToken', token)

          this.userObject = { email: email, token: token, data: result.data.data }
          await this.checkAdmin()
          await this.checkUserId()
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
        const result = await api.get('/login/auth/web', { headers: { Authorization: token } })

        if (result.status === 200) {
          const email = result.data.email
          this.userObject = { email: email, token: token, data: result.data.data }

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
    async checkUserId() {
      try {
        const result = await api.get('/login/userId')

        if (result.status === 200) {
          const userId = result.data
          this.userIdValue = userId

          return userId
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
