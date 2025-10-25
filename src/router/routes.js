const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'dashboard',
        component: () => import('src/pages/DashboardPage.vue'),
        name: 'dashboard',
      },
      {
        path: 'settings',
        component: () => import('src/pages/SettingsPage.vue'),
        name: 'dashboard',
      },
      {
        path: '',
        component: () => import('src/pages/IndexPage.vue'),
        name: 'indexpage',
      },
      {
        path: 'login',
        component: () => import('pages/LoginPage.vue'),
        name: 'login',
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
