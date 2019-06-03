import Vue from 'vue'
import firebase from 'firebase/app'
import Router from 'vue-router'
// import Home from './views/Home.vue'
import Login from './views/Login.vue'
import PackingList from './views/PackingList.vue'
import ReadExcel from './views/ReadExcel.vue'
import Inventario from './views/Inventario.vue'

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
      path: '/hometo',
      component: ReadExcel,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/home',
      name: 'home',
      component: ReadExcel,
      redirect: to => {
        const currentUser = firebase.auth().currentUser;
        if ( currentUser.email !== 'omar.duran@corrugadosaltavista.com') return { path: '/packing-list'}
        else return {path: '/hometo'}
      },
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
      path: '/inventario',
      name: 'inventario',
      component: Inventario,
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
  let emails = [
        'omar.duran@corrugadosaltavista.com',
        'guillermo.hernandez@corrugadosaltavista.com',
        'jose.rodriguez@corrugadosaltavista.com',
        'contabilidad@corrugadosaltavista.com'
  ]
  if(requiresAuth) {
    if (currentUser){
      if(currentUser.email === emails[0]) next()
      else if(currentUser.email === emails[1]) next()
      else if(currentUser.email === emails[2]) next()
      else if(currentUser.email === emails[3]) next()
      else next('login')

    }
    else next('login')

  }
  else next()
})

export default router
