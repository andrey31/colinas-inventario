import Vue from 'vue'
import Router from 'vue-router'
// import Home from './views/Home.vue'
import PackingList from './views/PackingList.vue'
import ReadExcel from './views/ReadExcel.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: ReadExcel
    },
    {
      path: '/packing-list',
      name: 'packingList',
      component: PackingList
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
