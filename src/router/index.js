import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useUserStore } from 'src/stores/user-store'
import { i18n } from 'src/boot/i18n'

function changeLanguage(locale) {
  // Update the i18n locale to match the URL
  if (i18n.global.locale.value !== locale) {
    i18n.global.locale.value = locale
  }
}

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const userStore = useUserStore()

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach(async (to, from) => {
    const auth = await userStore.auth(localStorage.getItem('accesstoken') || '_')

    if (to.name === 'login') {
      if (auth) return from
    }

    let locale = to.params.locale
    const supportedLangs = ['de', 'en']

    const browserLang = navigator.language.split('-')[0]

    if (!locale) {
      locale = supportedLangs.includes(browserLang) ? browserLang : 'en'
    }

    if (!supportedLangs.includes(locale)) {
      locale = supportedLangs.includes(browserLang) ? browserLang : 'en'
      changeLanguage(locale)
      return '/' + locale + to.fullPath
    }

    changeLanguage(locale)
    if (!to.params.locale) {
      if (to.fullPath === '/') {
        return '/' + locale
      }
      return { ...to, params: { locale } }
    }
  })

  return Router
})
