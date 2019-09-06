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
      currentUser: firebase.auth().currentUser,
    }
  },
  methods: {
    ...mapMutations(['setModalDeleteAlmacen']),
    hideModal: function(){
      this.setModalDeleteAlmacen(false)
    },
    deleteRoll: function(){
      this.db.ref(this.almacen).child(this.idNumber).remove().then( () => {
        this.registerChange( 'Rollo eliminado', 'Almacenes', '', this.idNumber)
      })
      this.setModalDeleteAlmacen(false)
    },
    getFormatDate: function () {
      let d = new Date()
      let month = '' + (d.getMonth() + 1)
      let day = '' + d.getDate()
      let year = d.getFullYear()

      let hour = d.getHours()
      let minutes = d.getMinutes()
      let seconds = d.getSeconds()
      let tz = hour < 12 ? ' am.' : ' pm.'

      return {
        date: day + '-' + month + '-' + year,
        hour: hour + ':' + minutes + ':' + seconds + tz
      }
    },
    registerChange: function(change, ubication, nota, idNumber){
      let formatDate = this.getFormatDate()

      let changeObj = {

        cambioRealizado: change,
        fecha: formatDate.date,
        hora: formatDate.hour,
        nota: nota,
        numRollo: idNumber,
        ubicacion: ubication,
        usuario: this.currentUser.email

      }
      let key = this.db.ref('CambiosRealizados').push().key

      this.db.ref('CambiosRealizados').child(key).set(changeObj).then(data => {
        console.log('cambio realizado')
      }).catch( error => {
        console.log(error + ' error al cambiar')
      })

    },
  }
}
</script>
