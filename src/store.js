import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    modalShowAlmacen: false,
    modalDeleteAlmacen: false
  },
  mutations: {
    setModalShowAlmacen: (state, e) => state.modalShowAlmacen = e,
    setModalDeleteAlmacen: (state, e) => state.modalDeleteAlmacen = e
  },
  actions: {

  }
})
