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
        permissionReadExcel: true,
        requiresAuth: true,
      }
    },
    {
      path: '/packing-list',
      name: 'packingList',
      component: PackingList,
      meta: {
        requiresAuth: true,
        permissionPackingList: true,
      }
    },
    {
      path: '/almacenes',
      name: 'almacenes',
      component: Almacenes,
      meta: {
        requiresAuth: true,
        permissionAlmacenes: true
      }
    },
    {
      path: '/inventario',
      name: 'inventario',
      component: Inventario,
      meta: {
        requiresAuth: true,
        permissionInventario: true
      }
    },
    {
      path: '/traslados',
      name: 'traslados',
      component: Traslados,
      meta: {
        requiresAuth: true,
        permissionTraslado: true
      }
    },
    {
      path: '/registro-cambios',
      name: 'registroCambios',
      component: RegistroCambios,
      meta: {
        requiresAuth: true,
        permissionRegistros: true
      }
    },
    {
      path: '/reportes',
      name: 'reportes',
      component: Reportes,
      meta: {
        requiresAuth: true,
        permissionReportes: true
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
  const permissionReadExcel = to.matched.some( record => record.meta.permissionReadExcel)
  const permissionPackingList = to.matched.some( record => record.meta.permissionPackingList)
  const permissionAlmacenes = to.matched.some( record => record.meta.permissionAlmacenes)
  const permissionInventario = to.matched.some( record => record.meta.permissionInventario)
  const permissionTraslado = to.matched.some( record => record.meta.permissionTraslado)
  const permissionRegistros = to.matched.some( record => record.meta.permissionRegistros)
  const permissionReportes = to.matched.some( record => record.meta.permissionReportes)
  /* const permissionAdmin = to.matched.some(record => record.meta.permissionAdmin)
  const permissionCol = to.matched.some(record => record.meta.permissionCol)
  const permissionSuperAdmin = to.matched.some(record => record.meta.permissionSuperAdmin) */

  if (requiresAuth && permissionReadExcel){
    if ( currentUser ){
      if (checkEmail(currentUser).readExcel) next()
      else if(checkEmail(currentUser)) next( {path: 'packing-list'} )
    }else next('login')

  }else if(requiresAuth && permissionPackingList) {
    if (currentUser){
      if (checkEmail(currentUser).packingList) next()
      else if(checkEmail(currentUser)) next( {path: 'almacenes'} )
    }else next('login')
  }else if (requiresAuth && permissionAlmacenes) {
    if (currentUser) {
      if ( checkEmail(currentUser).almacenes ) next()
      else if (checkEmail(currentUser)) next( {path: 'inventario'} )
    }else next('login')
  }else if (requiresAuth && permissionInventario){
    if (currentUser){
      if (checkEmail(currentUser).inventario) next()
      else if (checkEmail(currentUser)) next( {path: 'traslados'})
    }else next('login')
  }else if (requiresAuth && permissionTraslado){
    if (currentUser){
      if ( checkEmail(currentUser).traslados ) next()
      else if (checkEmail(currentUser)) next({path: 'registro-cambios'})
    }else next('login')
  }else if (requiresAuth && permissionRegistros){
    if (currentUser) {
      if (checkEmail(currentUser).registros) next()
      else if(checkEmail(currentUser)) next({path: 'reportes'})
    }
  }else if (requiresAuth && permissionReportes){
    if (currentUser){
      if(checkEmail(currentUser).reportes) next()
      else if (checkEmail(currentUser)) next({path: 'almacenes'})
    }else next('login')
  } else next()
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
    'alexander@corrugadosaltavista.com',
    'jackson@corrugadosaltavista.com',
    'josue@corrugadosaltavista.com',
    'sandro@corrugadosaltavista.com',
    'wilmar@corrugadosaltavista.com'
  ]

  for(let email in emails){
    if ((emails[email] === currentUser.email && emails[email] === emails[0]) ||
      (emails[email] === currentUser.email && emails[email] === emails[1])){
      return {
        'access': true,
        'readExcel': true,
        'packingList': true,
        'almacenes': true,
        'inventario': true,
        'traslados': true,
        'registros': true,
        'reportes': true
      }
    }else if (emails[email] === currentUser.email &&
      (emails[email] === emails[2] || emails[email] === emails[3])){
        return {
          'access': true,
          'readExcel': false,
          'packingList': true,
          'almacenes': true,
          'inventario': true,
          'traslados': true,
          'registros': true,
          'reportes': true

        }
    }else if (emails[email] === currentUser.email &&
      (emails[email] === emails[2] || emails[email] === emails[6])){
        return {
          'access': true,
          'readExcel': false,
          'packingList': true,
          'almacenes': true,
          'inventario': false,
          'traslados': false,
          'registros': false,
          'reportes': false
        }
    }else if (emails[email] === currentUser.email &&
      (emails[email] === emails[2] || emails[email] === emails[12])){
        return {
          'access': true,
          'readExcel': false,
          'packingList': false,
          'almacenes': false,
          'inventario': true,
          'traslados': false,
          'registros': false,
          'reportes': false
        }
    }else if(emails[email] === currentUser.email){
      return {
        'access': true,
        'readExcel': false,
        'packingList': false,
        'almacenes': true,
        'inventario': true,
        'traslados': true,
        'registros': true,
        'reportes': true
      }
    }else if (email === (emails.length -1)) {
      return {
        'access': false,
        'readExcel': false,
        'packingList': false,
        'almacenes': false,
        'inventario': false,
        'traslados': false,
        'registros': false,
        'reportes': false
      }
    }
  }

}
export default router
