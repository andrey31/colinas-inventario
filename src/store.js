import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    modalShowAlmacen: false,
    modalDeleteAlmacen: false,
    modalDuaAlmacen: { show: false, roll: ''}
  },
  mutations: {
    setModalShowAlmacen: (state, e) => state.modalShowAlmacen = e,
    setModalDeleteAlmacen: (state, e) => state.modalDeleteAlmacen = e,
    setModalDuaAlmacen: (state, e) => state.modalDuaAlmacen = e
  },
  actions: {

  }
})
