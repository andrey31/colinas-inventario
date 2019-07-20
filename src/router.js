import Vue from 'vue'
import firebase from 'firebase/app'
import Router from 'vue-router'
// import Home from './views/Home.vue'
import Login from './views/Login.vue'
import PackingList from './views/PackingList.vue'
import ReadExcel from './views/ReadExcel.vue'
import Inventario from './views/Inventario.vue'
import RegistroCambios from './views/RegistroCambios.vue'
import Almacenes from './views/Almacenes.vue'

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
        requiresAuth: true,
        permissionAdmin: true
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
      path: '/almacenes',
      name: 'almacenes',
      component: Almacenes,
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
      path: '/registro-cambios',
      name: 'registroCambios',
      component: RegistroCambios,
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
  const permissionAdmin = to.matched.some(record => record.meta.permissionAdmin)
  if (requiresAuth && permissionAdmin){
    if (currentUser){
      console.log(checkEmail(currentUser))
      if (checkEmail(currentUser).admin) {
        next()
      }else if( checkEmail(currentUser)){
        next( { path: 'packing-list'})
      }else {
        next('login')
      }
    }
  }
  else if(requiresAuth) {
    if (currentUser){
      if (checkEmail(currentUser).access) {
        next()
      }else {
        next('login')
      }
    }
    else next('login')

  }
  else next()
})

function checkEmail( currentUser ){

  let emails = [
    'omar.duran@corrugadosaltavista.com',
    'guillermo.hernandez@corrugadosaltavista.com',
    'jose.rodriguez@corrugadosaltavista.com',
    'contabilidad@corrugadosaltavista.com',
    'jose.mora@corrugadosaltavista.com',
    'montacargas1@corrugadosaltavista.com',
    'montacargas2@corrugadosaltavista.com',
    'operador1@corrugadosaltavista.com',
    'operador2@corrugadosaltavista.com'
  ]

  for(let email in emails){
    if (emails[email] === currentUser.email && emails[email] === emails[0]) return { 'access': true, 'admin': true}
    else if(emails[email] === currentUser.email) return {'access': true, 'admin': false}
    else if( email === emails.length) return {'access': false, 'admin': false}

  }

}
export default router
