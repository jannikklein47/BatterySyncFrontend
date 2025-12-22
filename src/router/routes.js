const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'dashboard',
        component: () => import('src/pages/NewDashboard.vue'),
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
        path: 'apiusage',
        component: () => import('src/pages/ApiUsagePage.vue'),
        name: 'apiusage',
      },
      {
        path: 'legal',
        component: () => import('src/pages/LegalPage.vue'),
        name: 'legal',
      },
      {
        path: 'issues',
        component: () => import('pages/IssuesPage.vue'),
        name: 'issues',
      },
      {
        path: 'admin',
        component: () => import('pages/SQLSender.vue'),
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
