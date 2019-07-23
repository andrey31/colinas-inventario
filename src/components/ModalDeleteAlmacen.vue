<template>
<b-modal v-model="modalDeleteAlmacenC"
         hide-header
         hide-footer
         >
  <b-container  class="text-center">
    <b-row>
      <b-col>
        <h3>¿Esta seguro de eliminar el rollo {{idNumber}}?</h3>
      </b-col>
    </b-row>
    <b-row class="pt-4">
      <b-col>
        <b-button block variant="danger" class="mr-2" @click="hideModal">No</b-button>
        <b-button block variant="primary" class="mr-2" @click="deleteRoll">Si</b-button>
      </b-col>
    </b-row>
  </b-container>
</b-modal>
</template>

<script>
import firebase from 'firebase/app'
import { mapState, mapMutations } from 'vuex'
export default {
  name: 'modal-delete-almacen',
  props: ['idNumber', 'almacen'],
  computed: {
    ...mapState(['modalDeleteAlmacen']),
    modalDeleteAlmacenC: {
      get: function () {
        return this.modalDeleteAlmacen
      },
      set: function (v) {
        this.setModalDeleteAlmacen(v)
      }
    }
  },
  data(){
    return {
      db: firebase.database(),
    }
  },
  methods: {
    ...mapMutations(['setModalDeleteAlmacen']),
    hideModal: function(){
      this.setModalDeleteAlmacen(false)
    },
    deleteRoll: function(){
      this.db.ref(this.almacen).child(this.idNumber).remove()
      this.setModalDeleteAlmacen(false)
    }
  }
}
</script>
