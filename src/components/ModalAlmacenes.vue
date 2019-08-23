<template>

<b-modal v-model="modalShowAlmacen"
         header-bg-variant="primary"
         no-close-on-backdrop
         size="lg">

  <template slot="modal-header">
    <!-- Emulate built in modal header close button action -->
    <h5>Editar</h5>
    <button class="close" @click="setModalShowAlmacen(false)">
      ×
    </button>


  </template>
  <template slot="modal-title">
    Editar
  </template>
  <b-container fluid>
    <b-form class="row">
      <b-form-group class="col-4" id="idNumber" label="Numero de rollo" label-for="input-id">
        <b-form-input id="input-id" type="text" v-model="modalRow.idNumber" required></b-form-input>
      </b-form-group>

      <b-form-group class="col-4" id="idNumber" label="Almacen" label-for="input-almacen">
        <b-form-select v-model="modalRow.almacen">
          <option value="telisa">Telisa</option>
          <option value="sislocar">Sislocar</option>
        </b-form-select>
      </b-form-group>

      <b-form-group class="col-4" id="idMeters" label="Metros" label-for="input-meters">
        <b-form-input id="input-meters" type="text" v-model="modalRow.meters" required></b-form-input>
      </b-form-group>

      <b-form-group class="col-4" id="idGramaje" label="Gramaje" label-for="input-gramaje">
        <b-form-input id="input-gramaje" type="text" v-model="modalRow.gramaje" required>
        </b-form-input>
      </b-form-group>

      <b-form-group class="col-4" id="idWidth" label="Ancho" label-for="input-width">
        <b-form-input id="input-width" type="text" v-model="modalRow.width" required></b-form-input>
      </b-form-group>

      <b-form-group class="col-4" id="idTypePaper" label="Tipo de papel" label-for="input-typePaper">
        <b-form-select v-model="modalRow.typePaper">
          <option value="MEDIUM">MEDIUM</option>
          <option value="LINER">LINER</option>
          <option value="LINER R">LINER R</option>
          <option value="WHITE TOP">WHITE TOP</option>
        </b-form-select>
      </b-form-group>

        <b-form-group class="col-4" id="idKg" label="Kilogramos" label-for="input-kg">
          <b-form-input id="input-kg" type="text" v-model="modalRow.kgs" required></b-form-input>
        </b-form-group

        <b-form-group class="col-12" id="idComment" label="Comentario" label-for="input-comment">
          <b-form-textarea id="input-comment" type="text" v-model="modalRow.comments" rows="3" max-rows="6" required>
          </b-form-textarea>
        </b-form-group>
      </b-form>
    </b-container>

    <div slot="modal-footer" class="">
      <b-button variant="danger" class="mr-2" @click="setModalShowAlmacen(false)">Cancelar</b-button>
      <b-button variant="primary" @click="saveAlmacen">Guardar</b-button>
    </div>
  </b-modal>
</template>

<script>
import {mapState, mapMutations} from 'vuex'
import firebase from 'firebase/app'

export default{
    name: 'modal-almacenes',
    props: ['modalRow'],
    computed: {
        ...mapState(['modalShowAlmacen'])
    },
    data(){
        return {
            db: firebase.database(),
        }
    },
    methods: {
        ...mapMutations(['setModalShowAlmacen']),
        saveAlmacen: function(){
            let almacen = this.modalRow.almacen
            let key = this.modalRow.idNumber
            let obj = {
                comments: this.modalRow.comments,
                gramaje: this.modalRow.gramaje,
                idNumber: this.modalRow.idNumber,
                kgs: Number(this.modalRow.kgs),
                meters: Number(this.modalRow.meters),
                typePaper: this.modalRow.typePaper,
                width: Number(this.modalRow.width)
            }
            this.db.ref(almacen).child(key).update(obj).then( data => {
                this.setModalShowAlmacen(false)
            }).catch( error => {
                console.log(error)
            })
        }

    }

}
</script>
