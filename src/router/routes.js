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
        path: 'devices',
        component: () => import('src/pages/DevicesPage.vue'),
        name: 'devices',
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
      {
        path: 'admin',
        component: () => import('pages/AdminPanel.vue'),
        name: 'admin',
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
