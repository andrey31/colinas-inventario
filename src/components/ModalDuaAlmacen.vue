<template>
<b-modal v-model="modalDuaAlmacenC.show" header-bg-variant="primary">
  <template slot="modal-title">
    DUA para el rollo: <b>{{modalDuaAlmacenC.roll.idNumber}}</b>
  </template>
  <b-form-input  placeholder="Ingrese DUA" v-model="dua"></b-form-input>
  <div slot="modal-footer" class="">
    <b-button variant="danger" class="mr-2" @click="hideModal">Cancelar</b-button>
    <b-button variant="primary" @click="sendDUA()">Agregar</b-button>
  </div>
</b-modal>
</template>

<script>
import firebase from 'firebase/app'
import {mapState, mapMutations} from 'vuex'

export default {
    computed: {
        ...mapState(['modalDuaAlmacen']),
        modalDuaAlmacenC: {
            get: function () {
                return this.modalDuaAlmacen
            },
            set: function (v) {
                this.setModalDuaAlmacen(v)
            }
        }
    },
    data () {
        return {
            db: firebase.database(),
            dua: ''
        }
    },
    methods: {
        ...mapMutations(['setModalDuaAlmacen']),
        hideModal: function(){
            this.setModalDuaAlmacen({
                show: false, roll: ''
            })
            this.dua = ''
        },
        sendDUA: function(){
            let almacen = this.modalDuaAlmacenC.roll.almacen
            let idNumber = this.modalDuaAlmacenC.roll.idNumber
            console.log(almacen)
            this.db.ref(almacen).child(idNumber).update(
                 {
                     dua: this.dua
                 }
             ).then((data) => {
                 console.log('agregado'),
                 this.hideModal()
             })
            this.dua = ''
        }
    }
}
</script>
