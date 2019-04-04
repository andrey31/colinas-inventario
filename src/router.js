import Vue from 'vue'
import firebase from 'firebase/app'
import Router from 'vue-router'
// import Home from './views/Home.vue'
import Login from './views/Login.vue'
import PackingList from './views/PackingList.vue'
import ReadExcel from './views/ReadExcel.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '*',
      redirect: '/login'
    },
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/home',
      name: 'home',
      component: ReadExcel,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/packing-list',
      name: 'packingList',
      component: PackingList,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  const currentUser = firebase.auth().currentUser;
  const requiresAuth = to.matched.some( record => record.meta.requiresAuth)

  if(requiresAuth) {
    if (currentUser){
      if(currentUser.uid === process.env.VUE_APP_USER_UID) next()
      else next('login')
    }
    else next('login')

  }
  else next()
})

export default router
