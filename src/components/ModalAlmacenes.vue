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
        <b-col cols="12">

          <b-row>
            <b-form-input id="input-id" type="text" v-model="modalRowCopyC.idNumber"
                          @focus.native="existFocus" @blur.native="exist" autofocus required>
            </b-form-input>
          </b-row>
          <b-row>
            <b-col class="text-primary text-center" v-if="spinnerExist">
              <b-spinner small label="Small Spinner" variant="primary"></b-spinner>
              Verificando rollo...
            </b-col>
            <b-col class="text-danger text-center" v-else-if="rollExist === 1 && !modalRow.editar">
              <v-icon name="times-circle"></v-icon>
              Este rollo ya existe
            </b-col>
            <b-col class="text-primary" v-else-if="rollExist === -1">
              <v-icon name="check-circle"></v-icon>
            </b-col>
          </b-row>
        </b-col>

      </b-form-group>

      <b-form-group class="col-4" id="idNumber" label="Almacen" label-for="input-almacen">
        <b-form-select v-model="modalRowCopyC.almacen">
          <option value="telisa">Telisa</option>
          <option value="sislocar">Sislocar</option>
        </b-form-select>
      </b-form-group>

      <b-form-group class="col-4" id="idMeters" label="Metros" label-for="input-meters">
        <b-form-input id="input-meters" type="text" v-model="modalRowCopyC.meters" required></b-form-input>
      </b-form-group>

      <b-form-group class="col-4" id="idGramaje" label="Gramaje" label-for="input-gramaje">
        <b-form-input id="input-gramaje" type="text" v-model="modalRowCopyC.gramaje" required>
        </b-form-input>
      </b-form-group>

      <b-form-group class="col-4" id="idWidth" label="Ancho" label-for="input-width">
        <b-form-input id="input-width" type="text" v-model="modalRowCopyC.width" required></b-form-input>
      </b-form-group>

      <b-form-group class="col-4" id="idTypePaper" label="Tipo de papel" label-for="input-typePaper">
        <b-form-select v-model="modalRowCopyC.typePaper">
          <option value="MEDIUM">MEDIUM</option>
          <option value="LINER">LINER</option>
          <option value="LINER R">LINER R</option>
          <option value="WHITE TOP">WHITE TOP</option>
        </b-form-select>
      </b-form-group>

      <b-form-group class="col-4" id="idKg" label="Kilogramos" label-for="input-kg">
        <b-form-input id="input-kg" type="text" v-model="modalRowCopyC.kgs" required></b-form-input>
        </b-form-group>

        <b-form-group class="col-12" id="idComment" label="Comentario" label-for="input-comment">
          <b-form-textarea id="input-comment" type="text" v-model="modalRowCopyC.comments" rows="3" max-rows="6" required>
          </b-form-textarea>
        </b-form-group>
      </b-form>
    </b-container>
    <div slot="modal-footer" class="">
      <b-button variant="danger" class="mr-2" @click="setModalShowAlmacen(false)">Cancelar</b-button>
      <b-button variant="primary" @click="saveAlmacen" :disabled="disableSave">Guardar</b-button>
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
    ...mapState(['modalShowAlmacen']),
    modalRowCopyC: {
      get: function(){
        // let cp = assign({}, this.modalRow);
        this.modalRowCopy = Object.assign({}, this.modalRow)
        return this.modalRowCopy
      },
      set: function(v) {
        this.modalRowCopy = v
      }
    },
    disableSave: function(){
      let disable = false
      for (let key in this.modalRowCopy){
        if (this.modalRowCopy[key] === '' || typeof this.modalRowCopy[key] === 'undefined') {
          disable = true
        }
      }
      if (this.modalRow.editar) return disable
      else return (disable || Number(this.rollExist) >= 0)
    },
  },
  data(){
    return {
      db: firebase.database(),
      currentUser: firebase.auth().currentUser,
      modalRowCopy: {},
      rollExist: 0,
      spinnerExist: false
    }
  },
  methods: {
    ...mapMutations(['setModalShowAlmacen']),
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
    registerChange: function(change, ubication, nota, roll){
      let formatDate = this.getFormatDate()

      let changeObj = {

        cambioRealizado: change,
        fecha: formatDate.date,
        hora: formatDate.hour,
        nota: nota,
        numRollo: roll.idNumber,
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
    saveAlmacen: function(){
      let almacen = this.modalRowCopy.almacen
      let key = this.modalRow.idNumber
      let editar = this.modalRowCopy.editar

      let obj = {
        comments: this.modalRowCopy.comments,
        gramaje: this.modalRowCopy.gramaje,
        idNumber: this.modalRowCopy.idNumber,
        kgs: Number(this.modalRowCopy.kgs),
        meters: Number(this.modalRowCopy.meters),
        typePaper: this.modalRowCopy.typePaper,
        width: Number(this.modalRowCopy.width)
      }
      if (editar){
        let fecha = this.modalRow.fecha
        let almacenSis = 'sislocar'
        let almacenTeli = 'telisa'
        if (this.modalRow.inAlmacenes){

          let month = ''+ (fecha.getMonth() + 1)
          let day = '' + fecha.getDate()
          let year = fecha.getFullYear()
          obj.fecha = day + '-' + month + '-' + year
        }else{
          obj.fecha = fecha
          almacenSis = almacenSis+'EnTransito'
          almacenTeli = almacenTeli+'EnTransito'
          almacen = almacen+'EnTransito'
          console.log(almacenTeli)
          obj.weight = this.modalRow.weight
          console.log(key)
        }

        this.db.ref(almacenSis).child(key).set(null).then( data => {
          this.db.ref(almacenTeli).child(key).set(null).then( data => {
            this.db.ref(almacen).child(obj.idNumber).set(obj).then( data => {
              Object.keys(this.modalRow).forEach( key => {
                console.log(key)
                if (this.modalRow[key] !== this.modalRowCopy[key]){
                  let customKey = key

                  if (customKey === 'idNumber') customKey = 'número de rollo'
                  if (customKey === 'meters') customKey = 'metros'
                  if (customKey === 'comments') customKey = 'comentario'
                  if (customKey === 'width') customKey = 'ancho'

                  // change, ubication, nota, roll
                  let change = `Se cambio ${customKey}: ${this.modalRow[key]} a ${this.modalRowCopy[key]}`
                  this.registerChange(change, 'Almacenes', '', this.modalRow)

                }
              })
              this.setModalShowAlmacen(false)
            }).catch( error => {
              console.log(error)
            })
          }).catch( error => {
            console.log('error al borrar de '+almacenTeli)
          })
        }).catch( error => {
          console.log('error al borrar de '+almacenSis)
        })


      }else {
        let d = new Date()
        let month = '' + (d.getMonth() + 1)
        let day = '' + d.getDate()
        let year = d.getFullYear()
        obj.fecha = day + '-' + month + '-' + year

        this.db.ref(almacen).child(obj.idNumber).set(obj).then( data => {
          let change = `Rollo registrado directo en almacen ${almacen}`
          this.registerChange(change, 'Almacenes', obj.comments, obj)
          this.setModalShowAlmacen(false)
        }).catch( error=> {
          console.log(error)
        })
      }

    },
    existFocus: function(){
      this.rollExist = 0
    },
    exist: function(){

      if (this.modalRowCopyC.idNumber){
        this.spinnerExist = true

        let almacenes = ['sislocar', 'telisa', 'Inventario', 'InventarioSobrantes', 'HistorialInventario',
                         'sislocarEnTransito', 'telisaEnTransito', 'otroEnTransito']
        for (let almacen in almacenes){
          if (almacen == 0 || almacen == 1 || Number(almacen) >= 5){
            this.db.ref(almacenes[almacen]).child(this.modalRowCopyC.idNumber).once('value').then( snap => {
              if (snap.val()) {
                console.log('si existe en '+almacenes[almacen])
                this.rollExist = 1
                this.spinnerExist = false
              }else if ((Number(almacen) === (almacenes.length) - 1) && this.rollExist !== 1){
                this.rollExist = -1//No existe
                this.spinnerExist = false
              }
            })
          }else if ( almacen == 2 || almacen == 3 || almacen == 4) {
            this.db.ref(almacenes[almacen]).orderByChild('idNumber')
              .equalTo(this.modalRowCopyC.idNumber).once('value').then( snap => {
              if (snap.val()) {
                console.log('si existe en'+almacenes[almacen])
                this.spinnerExist = false
                this.rollExist = 1
              }else if ((Number(almacen) === (almacenes.length) - 1) && this.rollExist !== 1){
                this.spinnerExist = false
                this.rollExist = -1//No existe
              }
            })
          }


        }
      }

    }

  }

}
</script>
