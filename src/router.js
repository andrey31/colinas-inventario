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
import Traslados from './views/Traslados.vue'
import Reportes from './views/Reportes'

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
        permissionAdmin: true,
        permissionCol: true,
        permissionSuperAdmin: true
      }
    },
    {
      path: '/packing-list',
      name: 'packingList',
      component: PackingList,
      meta: {
        requiresAuth: true,
        permissionAdmin: true
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
        requiresAuth: true,
        permissionCol: true
      }
    },
    {
      path: '/traslados',
      name: 'traslados',
      component: Traslados,
      meta: {
        requiresAuth: true,
        permissionCol: true
      }
    },
    {
      path: '/registro-cambios',
      name: 'registroCambios',
      component: RegistroCambios,
      meta: {
        requiresAuth: true,
        permissionCol: true
      }
    },
    {
      path: '/reportes',
      name: 'reportes',
      component: Reportes,
      meta: {
        requiresAuth: true,
        permissionCol: true
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
  const permissionCol = to.matched.some(record => record.meta.permissionCol)
  const permissionSuperAdmin = to.matched.some(record => record.meta.permissionSuperAdmin)

  if (requiresAuth && permissionSuperAdmin) {

    if(currentUser){
      if(checkEmail(currentUser).superAdmin){
        next()
      }else if(checkEmail(currentUser)) {
        next( { path: 'packing-list'})
      }else {
        next('login')
      }
    }else {
      next('login')
    }

  }else if (requiresAuth && permissionAdmin && permissionCol){
    if (currentUser){
      if (checkEmail(currentUser).admin && checkEmail(currentUser).col) {
        next()
      }else if( checkEmail(currentUser)){
        next( { path: 'packing-list'})
      }else {
        next('login')
      }
    }
  }else if (requiresAuth && permissionAdmin){
    if (currentUser){
      if (checkEmail(currentUser).admin) {
        next()
      }else if( checkEmail(currentUser)){
        next( { path: 'almacenes'})
      }else {
        next('login')
      }
    }
  }else if (requiresAuth && permissionCol){

    if(currentUser){
      if(checkEmail(currentUser).access && checkEmail(currentUser).col){
        next()
      }else if (checkEmail(currentUser)){
        next( {path: 'almacenes'} )
      }else {
        next('login')
      }
    }else {
      next('login')
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
    'admin@corrugadosaltavista.com',
    'guillermo.hernandez@corrugadosaltavista.com',
    'jose.rodriguez@corrugadosaltavista.com',
    'contabilidad@corrugadosaltavista.com',
    'jose.mora@corrugadosaltavista.com',
    'jennifer@corrugadosaltavista.com',
    'ronny@corrugadosaltavista.com',
    /* 'eduardo@corrugadosaltavista.com',
    'rigo@corrugadosaltavista.com', */
    'alexander@corrugadosaltavista.com',
    'jackson@corrugadosaltavista.com',
    'josue@corrugadosaltavista.com',
    'sandro@corrugadosaltavista.com'
  ]

  for(let email in emails){
    if (emails[email] === currentUser.email && emails[email] === emails[0]) return { 'access': true, 'admin': true, 'col': true, superAdmin: true}
    else if( emails[email] === currentUser.email && emails[email] === emails[1]) return { 'access': true, 'admin': true, 'col': true, superAdmin: true}
    else if( emails[email] === currentUser.email && emails[email] === emails[2]) return { 'access': true, 'admin': true, 'col': true, superAdmin: false}
    else if( emails[email] === currentUser.email && emails[email] === emails[3]) return { 'access': true, 'admin': true, 'col': true, superAdmin: false}
    else if( emails[email] === currentUser.email && emails[email] === emails[6]) return { 'access': true, 'admin': true, 'col': false, superAdmin: false}
    else if(emails[email] === currentUser.email) return {'access': true, 'admin': false, 'col': true, superAdmin: false}
    else if( email === (emails.length - 1) ) return {'access': false, 'admin': false, superAdmin: false}
  }

}
export default router
