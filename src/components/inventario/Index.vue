<template>

<b-container fluid>
  <template>
    <b-row class="mb-2">
      <!-- <b-col cols="4"> -->
      <!--   <b-input-group> -->
      <!--     <b-input-group-text slot="prepend">Almacen</b-input-group-text> -->
      <!--     <b-form-input v-model="filterAlmacen"></b-form-input> -->
      <!--   </b-input-group> -->
      <!-- </b-col> -->
      <b-col cols="4">
        <b-input-group>
          <b-input-group-text slot="prepend">Gramaje</b-input-group-text>
          <b-form-input v-model="filterGramaje"></b-form-input>
        </b-input-group>
      </b-col>
      <b-col cols="4">
        <b-input-group>
          <b-input-group-text slot="prepend">Tipo papel</b-input-group-text>
          <b-form-input v-model="filterType"></b-form-input>
        </b-input-group>
      </b-col>
      <!-- <b-col cols="12" md="4" offset-md="7"> -->
      <!--   <b-input-group> -->
      <!--     <b-input-group-prepend is-text> -->
      <!--       <v-icon name="search"></v-icon> -->
      <!--     </b-input-group-prepend> -->
      <!--     <b-form-input v-model="filter" placeholder="Busqueda"> -->
      <!--     </b-form-input> -->
      <!--   </b-input-group> -->
      <!-- </b-col> -->
      <b-col cols="4">
        <b-input-group>
          <b-input-group-text slot="prepend">Ancho</b-input-group-text>
          <b-form-input v-model="filterWidth"></b-form-input>
        </b-input-group>

      </b-col>
    </b-row>
    <b-row>
      <template v-if="fields.length > 0">
        <b-col cols="4" v-if="fields[1].key === 'bodega'">
          <b-input-group>
            <b-input-group-text slot="prepend" >Bodega</b-input-group-text>
            <b-form-input v-model="filterBodega" :disabled="disabledBodega"></b-form-input>
          </b-input-group>
          <!-- <b-button class="mt-4">Exportar</b-button> -->
        </b-col>
      </template>

      <b-col cols="4">
        <b-input-group>
          <b-input-group-text slot="prepend" >Numero rollo</b-input-group-text>
          <b-form-input v-model="filterNumberRoll"></b-form-input>
        </b-input-group>
      </b-col>
      <b-col cols="4" v-if="showFilterDate">
        <b-input-group>
          <b-input-group-text slot="prepend" >Fecha Inicio</b-input-group-text>
          <b-form-input v-model="dateFilterBegin" type="date"></b-form-input>
        </b-input-group>


        <!-- <b-input-group> -->
        <!--   <b-input-group-text slot="prepend" >Hora</b-input-group-text> -->
        <!--   <b-form-input type="time" :disabled="disabledBodega"></b-form-input> -->
        <!-- </b-input-group> -->
      </b-col>
      <b-col>
        <b-input-group v-if="showFilterDate">
          <b-input-group-text slot="prepend" >Fecha Final</b-input-group-text>
          <b-form-input v-model="dateFilterFinish" type="date"></b-form-input>
        </b-input-group>
      </b-col>
    </b-row>
    <b-row class="">
      <b-col cols="8" class="my-2">
        <b-card bg-variant="light" text-variant="dark" title="Rollos información">
          <b-card-text>
            <b-row>
              <div v-for="gramaje, index in totalRolls.rollsByGramaje" :key="index">

                <b-col >
                  <b>
                    <label :class="[(gramaje.gramaje).includes('LINER R') ? 'color-red' : '']" class="px-2">
                      {{gramaje.gramaje}}
                    </label> cantidad: {{gramaje.count}}
                  </b>
                  <br/>
                </b-col>

              </div>
              <b-col>
                Total de rollos: <b>{{totalRolls.length}}</b>
              </b-col>
            </b-row>
            <b-row class="pt-4">
              <b-col v-if="getTotalKgsMeters.kg > 0">
                Total de kilos <b>{{getTotalKgsMeters.kg}}</b>
              </b-col>
              <b-col v-if="getTotalKgsMeters.meters > 0">
                Total de metros <b>{{getTotalKgsMeters.meters}}</b>
              </b-col>
              <b-col v-if="getTotalKgsMeters.desperdicio > 0">
                Total de desperdicio <b>{{getTotalKgsMeters.desperdicio}}</b>
              </b-col>
              <b-col v-if="getTotalKgsMeters.diametro > 0">
                Total de diametro <b>{{getTotalKgsMeters.diametro}}</b>
              </b-col>
            </b-row>
          </b-card-text>
        </b-card>
      </b-col>
      <b-col cols="4">
        <download-excel
          class="btn btn-primary mt-4"
          :data="getRolls"
          name="datos.xls" v-if="getRolls.length != 0">
          Exportar datos a excel
        </download-excel>
      </b-col>
    </b-row>

  </template>
  <b-row class="mb-2">


    <b-table
      :fields="fields"
      :items="getRolls"
      head-variant="dark"
      responsive
      >

      <!-- <template slot="enUso" slot-scope="row"> -->
      <!--   <label v-if="row.item.enUso">Sí</label> -->
      <!--   <label v-else>No</label> -->
      <!-- </template> -->
      <template v-if="row.item.fecha" slot="fecha" slot-scope="row">
        {{row.item.fecha.toISOString().slice(0, 10)}}
      </template>
      <template slot="typePaper" slot-scope="row">
        <label for="" :class="[(row.item.typePaper).includes('LINER R') ? 'color-red' : '']" class="px-2">
          {{row.item.typePaper}}
        </label>
      </template>
      <template slot="acciones" slot-scope="row">
        <a class="btn btn-primary mr-2" href="" @click.stop.prevent="modalShowEdit(row.item)">
          <v-icon name="edit"></v-icon>
        </a>
        <a class="btn btn-danger" href="" @click.stop.prevent="modalDeleteShowEdit(row.item)">
          <v-icon name="trash-alt"></v-icon>
        </a>
      </template>
    </b-table>

  </b-row>
  <b-modal v-model="modalShow"
           header-bg-variant="primary"
           size="lg"
           no-close-on-backdrop >
    <template slot="modal-title">
      Editar
    </template>
    <b-container fluid>


      <b-form class="row">
        <b-form-group class="col-4" id="idNumber" label="Numero de rollo" label-for="input-id">
          <b-form-input
            id="input-id"
            type="text"
            v-model="modalRow.idNumber"
            required>
          </b-form-input>
        </b-form-group>

        <b-form-group class="col-4" id="idBodega" label="Bodega" label-for="input-bodega"
                      v-if="actualTab === 0 || actualTab === 1">
          <b-form-input
            id="input-bodega"
            type="text"
            v-model="modalRow.bodega"
            required>
          </b-form-input>
        </b-form-group>

        <b-form-group class="col-4" id="idKg" label="Kilogramos" label-for="input-kg">
          <b-form-input
            id="input-kg"
            type="text"
            v-model="modalRow.kgs"
            required>
          </b-form-input>
        </b-form-group>

        <b-form-group class="col-4" id="idMeters" label="Metros" label-for="input-meters"
                      v-if="actualTab === 0 || actualTab === 2">
          <b-form-input
            id="input-meters"
            type="text"
            v-model="modalRow.meters"
            required>
          </b-form-input>
        </b-form-group>
        <b-form-group class="col-4" id="idGramaje" label="Gramaje" label-for="input-gramaje">
          <b-form-input
            id="input-gramaje"
            type="text"
            v-model="modalRow.gramaje"
            required>
          </b-form-input>
        </b-form-group>
        <b-form-group class="col-4" id="idWidth" label="Ancho" label-for="input-width">
          <b-form-input
            id="input-width"
            type="text"
            v-model="modalRow.width"
            required>
          </b-form-input>
        </b-form-group>

        <b-form-group class="col-4" id="idTypePaper" label="Tipo de papel" label-for="input-typePaper">
          <b-form-input
            id="input-typePaper"
            type="text"
            v-model="modalRow.typePaper"
            required>
          </b-form-input>
        </b-form-group>
        <b-form-group class="col-4" id="idSheet" label="Hojas desperdiciadas" label-for="input-sheet"
                      v-if="actualTab === 1 || actualTab === 2">
          <b-form-input
            id="input-sheet"
            type="text"
            v-model="modalRow.desperdicio"
            required>
          </b-form-input>
        </b-form-group>
        <b-form-group class="col-4" id="idDiametro" label="Diametro" label-for="input-diametro"
                      v-if="actualTab === 1">
          <b-form-input
            id="input-diametro"
            type="text"
            v-model="modalRow.diametro"
            required>
          </b-form-input>
        </b-form-group>
        <b-form-group class="col-12" id="idComment" label="Comentario" label-for="input-comment" v-if="!isUndefinedComment">

          <b-form-textarea
            id="input-comment"
            type="text"
            v-model="modalRow.comments"
            rows="3"
            max-rows="6"
            required>
          </b-form-textarea>
        </b-form-group>
      </b-form>
    </b-container>
    <div slot="modal-footer" class="">
      <b-button variant="danger" class="mr-2" @click="modalShow = false">Cancelar</b-button>
      <b-button variant="primary" @click="editar">Guardar</b-button>
    </div>
  </b-modal>

  <b-modal v-model="modalDeleteShow"
           hide-header
           hide-footer
           >
    <b-container  class="text-center" v-if="!modalChangeAddHistorial">
      <b-row>
        <b-col>
          <h3>¿Esta seguro de eliminar el rollo {{modalRow.idNumber}}?</h3>
        </b-col>
      </b-row>
      <b-row class="pt-4">

        <b-col>
          <b-button block variant="danger" class="mr-2" @click="modalDeleteShow = false">No</b-button>
          <b-button block variant="primary" class="mr-2" @click="deleteItem()">Si</b-button>
        </b-col>
      </b-row>
    </b-container>

    <b-container class="text-center" v-else>
      <b-row>
        <b-col>
          <h3>Seleccione una opción</h3>
        </b-col>
      </b-row>
      <b-row class="pt-4">
        <b-col cols="6">
          <b-form-radio v-model="selectedMoveHistory" name="some-radios" value="true">Mover a historial</b-form-radio>
        </b-col>
        <b-col cols="6">
          <b-form-radio v-model="selectedMoveHistory" name="some-radios" value="false">Eliminar</b-form-radio>
        </b-col>
        <b-col cols="12">
          <b-button block variant="primary" class="mt-4" @click="deleteOrMove"> Enviar</b-button>
        </b-col>
      </b-row>

    </b-container>

    <template slot="modal-footer">

    </template>
  </b-modal>
</b-container>

</template>

<script>
import firebase from 'firebase/app'
export default{
  props: ['items', 'fields', 'actualTab'],
  components: {
  },
  computed: {
    getTotalKgsMeters(){
      let kgsM = {}
      let kg = 0
      let meters = 0
      let desperdicio = 0
      let diametro = 0
      this.rollsFilter.forEach( roll => {
        kg += parseFloat(roll.kgs)
        if (roll.meters) meters += parseFloat(roll.meters)
        if (roll.desperdicio) desperdicio += parseFloat(roll.desperdicio)
        if(roll.diametro) diametro += parseFloat(roll.diametro)
      })
      kgsM.kg = kg.toFixed(2)
      kgsM.meters = meters.toFixed(2)
      kgsM.desperdicio = desperdicio.toFixed(2)
      kgsM.diametro = diametro.toFixed(2)
      return kgsM
    },
    getRolls(){
      this.rollsFilter = this.items.filter( el => {
        let bodega = el.bodega

        typeof bodega === 'undefined' ? this.disabledBodega = true : this.disabledBodega = false

        this.showFilterDate = el.fecha === null ? false : true


        let r = el.gramaje.toString().indexOf(this.filterGramaje) > -1 &&
            el.typePaper.toLowerCase().indexOf(this.filterType.toLowerCase()) > -1 &&
            el.width.indexOf(this.filterWidth) > -1 &&
            el.idNumber.toString().indexOf(this.filterNumberRoll) > -1

        if(el.fecha !== null){
          r = r && el.fecha >= new Date(this.dateFilterBegin + 'T00:00:00-06:00')
            && el.fecha <= new Date(this.dateFilterFinish + 'T00:00:00-06:00')
        }

        if(typeof bodega === 'undefined') return r
        else {
          return r && el.bodega.toString().indexOf(this.filterBodega) > -1
        }

      })
      return this.rollsFilter
    },
    totalRolls(){
      let total = {}
      total.length = this.rollsFilter.length

      // this.rollsFilter.forEach( roll => {
      //     console.log(roll.meters)
      //     total.meters += roll.meters
      // })
      // total.meters = this.rollsFilter.reduce( (a, b) => a + b.meters, 0).toFixed(2)

      let rollsByGramaje = {}
      this.rollsFilter.forEach( roll => {
        rollsByGramaje[roll.gramaje] = rollsByGramaje[roll.gramaje] || []
        rollsByGramaje[roll.gramaje].push(roll)
      })

      let gramajes = []
      let rollsByGramajeType = {}
      Object.keys(rollsByGramaje).forEach( key => {
        rollsByGramaje[key].forEach( roll => {
          let keyGramajeType = `${key} - ${roll.typePaper}`
          rollsByGramajeType[keyGramajeType] = rollsByGramajeType[keyGramajeType] || []
          rollsByGramajeType[keyGramajeType].push('')
        })
      })
      Object.keys(rollsByGramajeType).forEach( key => {
        console.log(rollsByGramajeType[key].length)
        gramajes.push({'gramaje': key, 'count': rollsByGramajeType[key].length})
      })
      total.rollsByGramaje = gramajes
      return total
    }
  },
  data(){
    return {
      filterGramaje: '',
      filterType: '',
      filterWidth: '',
      filterBodega: '',
      filterNumberRoll: '',
      rollsFilter: [],
      dateFilterBegin: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10).toString(),
      dateFilterFinish: new Date().toISOString().slice(0, 10).toString(),
      disabledBodega: false,
      showFilterDate: false,
      modalShow: false,
      modalRow: {},
      modalDeleteShow: false,
      keyRoll: 0,
      db: firebase.database(),
      currentUser: firebase.auth().currentUser,
      isUndefinedComment: false,
      modalChangeAddHistorial: false,
      selectedMoveHistory: 'false'
    }
  },
  methods: {
    modalShowEdit: function(row){

      if(typeof row.comments === 'undefined') {
        this.isUndefinedComment = true
      }
      else {
        this.isUndefinedComment = false
      }

      this.modalRow = Object.assign({}, row)
      let w = (this.modalRow.width).substr(0,2) //Remover comillas de pulgadas
      // if (this.modalRow.fecha) this.modalRow.fecha = (this.formatDate(this.modalRow.fecha))
      if (this.modalRow.fecha) {
        let fecha = this.formatDate(this.modalRow.fecha).split('-')
        console.log(fecha)
        let formatFecha = `${fecha[2]}-${fecha[1]}-${fecha[0]}`
        this.modalRow.fecha = formatFecha
      }
      this.modalRow.width = w
      this.modalShow = true
    },
    modalDeleteShowEdit: function(item){
      this.keyRoll = item.key
      this.modalRow = Object.assign({}, item)
      this.modalChangeAddHistorial = false
      this.modalDeleteShow = true
      // this.db.ref('/order').child(key).remove()
    },
    deleteOrMove: function(){
      if (this.selectedMoveHistory === 'true') {
        let key = this.db.ref('HistorialInventario').push().key;

        let roll = {
          comments: this.modalRow.comments,
          desperdicio: '',
          fecha: '',
          gramaje: this.modalRow.gramaje,
          idNumber: this.modalRow.idNumber,
          kgs: this.modalRow.kgs,
          meters: this.modalRow.meters,
          typePaper: this.modalRow.typePaper,
          width: this.modalRow.width
        }

        this.db.ref('HistorialInventario').child(key).set(roll)
        this.db.ref('Inventario').child(this.keyRoll).remove()
      }
      else if(this.selectedMoveHistory === 'false') {
        this.db.ref('Inventario').child(this.keyRoll).remove()
      }
      this.modalDeleteShow = false

      // this.db.ref('/Inventario').child(this.keyRoll).remove()
    },
    deleteItem: function(){
      if(this.actualTab === 0){
        this.modalChangeAddHistorial = true
      }else if(this.actualTab === 1){
        this.modalDeleteShow = false
        this.db.ref('InventarioSobrantes').child(this.keyRoll).remove()
      }else if(this.actualTab === 2){
        this.modalDeleteShow = false
        this.db.ref('HistorialInventario').child(this.keyRoll).remove()
      }


    },
    formatDate: function (date) {
      var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;

      return [year, month, day].join('-');
    },
    editar: function(){
      let key = this.modalRow.key

      if (this.actualTab === 0){
        let obj = {
          bodega: this.modalRow.bodega,
          comments: this.modalRow.comments,
          enUso: this.modalRow.enUso,
          gramaje: this.modalRow.gramaje,
          idNumber: this.modalRow.idNumber,
          kgs: this.modalRow.kgs,
          meters: this.modalRow.meters,
          typePaper: this.modalRow.typePaper,
          width: this.modalRow.width
        }
        this.db.ref('Inventario').child(key).set(obj).then( (data) => {
          this.modalShow = false
          console.log('agregado')
        }).catch( error => {
          console.log(error)
        })

      }else if(this.actualTab === 1) {

        let obj = {
          bodega: this.modalRow.bodega,
          causaDesperdicio: this.modalRow.causaDesperdicio,
          diametro: this.modalRow.diametro,
          enUso: this.modalRow.enUso,
          fecha: this.modalRow.fecha,
          gramaje: this.modalRow.gramaje,
          hora: this.modalRow.hora,
          idNumber: this.modalRow.idNumber,
          kgs: this.modalRow.kgs,
          typePaper: this.modalRow.typePaper,
          desperdicio: this.modalRow.desperdicio,
          width: this.modalRow.width
        }
        this.db.ref('InventarioSobrantes').child(key).set(obj).then( (data) => {
          this.modalShow = false
        }).catch( error => {
          console.log(error)
        })


      }else if(this.actualTab === 2){
        let obj = {
          causaDesperdicio: this.modalRow.causaDesperdicio,
          comments: this.modalRow.comments,
          desperdicio: this.modalRow.desperdicio,
          fecha: this.modalRow.fecha,
          gramaje: this.modalRow.gramaje,
          idNumber: this.modalRow.idNumber,
          kgs: this.modalRow.kgs,
          meters: this.modalRow.meters,
          typePaper: this.modalRow.typePaper,
          width: this.modalRow.width
        }

        this.db.ref('HistorialInventario').child(key).set(obj).then( data => {
          this.modalShow = false
        }).catch( error => {
          console.log(error)
        })

      }

      // this.db.ref(key).set
      // console.log(this.modalRow)
    }
  }

}
</script>
