<template>

<b-container fluid>
  <template>
    <b-row class="">
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
          <b-form-select v-model="filterType">
            <option value="">TODOS</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LINER">LINER</option>
            <option value="LINER R">LINER R</option>
            <option value="WHITE TOP">WHITE TOP</option>
          </b-form-select>
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
      <b-col cols="4" v-if="actualTab === 0 || actualTab === 1">
        <b-input-group>
          <b-input-group-text slot="prepend">En Uso</b-input-group-text>
          <b-form-select v-model="filterEnUso">
            <option value="">TODOS</option>
            <option value="si">SI</option>
            <option value="no">NO</option>
          </b-form-select>
        </b-input-group>
      </b-col>

      <b-col cols="6" v-if="showFilterDate">
        <b-input-group>
          <b-input-group-text slot="prepend" >Fecha Inicio</b-input-group-text>
          <b-form-input v-model="dateFilterBegin" type="date"></b-form-input>
        </b-input-group>
      </b-col>
      <!-- <b-input-group> -->
      <!--   <b-input-group-text slot="prepend" >Hora</b-input-group-text> -->
      <!--   <b-form-input type="time" :disabled="disabledBodega"></b-form-input> -->
      <!-- </b-input-group> -->

      <b-col cols="6" v-if="showFilterDate">
        <b-input-group>
          <b-input-group-text slot="prepend" >Fecha Final</b-input-group-text>
          <b-form-input v-model="dateFilterFinish" type="date"></b-form-input>
        </b-input-group>
      </b-col>

      <!-- <b-col cols="6" v-if="actualTab === 0"> -->
      <!--   <b-input-group> -->
      <!--     <b-input-group-text slot="prepend" >Fecha Inicio traslado</b-input-group-text> -->
      <!--     <b-form-input  v-model="dateFilterBeginT" type="date"></b-form-input> -->
      <!--   </b-input-group> -->
      <!-- </b-col> -->

      <!-- <b-col cols="6" v-if="actualTab === 0"> -->
      <!--   <b-input-group> -->
      <!--     <b-input-group-text slot="prepend" >Fecha Final traslado</b-input-group-text> -->
      <!--     <b-form-input v-model="dateFilterFinishT" type="date"></b-form-input> -->
      <!--   </b-input-group> -->
      <!-- </b-col> -->
    </b-row>


    <b-row class="">
      <b-col cols="8" class="my-2">
        <b-card bg-variant="light" text-variant="dark" title="Rollos información">
          <b-card-text>
            <b-row>
              <div v-for="gramaje, index in totalRolls.rollsByGramaje" :key="index">

                <b-col >
                  <b>
                    <label class="px-2">
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
                Total de kilos <b>{{(getTotalKgsMeters.kg).toLocaleString('en-us')}}</b>
              </b-col>
              <b-col v-if="getTotalKgsMeters.tons > 0">
                Total de toneladas <b>{{(getTotalKgsMeters.tons).toLocaleString('en-us')}}</b>
              </b-col>
              <b-col v-if="getTotalKgsMeters.meters > 0">
                Total de metros <b>{{(getTotalKgsMeters.meters).toLocaleString('en-us')}}</b>
              </b-col>
              <b-col v-if="getTotalKgsMeters.desperdicio > 0">
                Total de desperdicio <b>{{(getTotalKgsMeters.desperdicio).toLocaleString('en-us')}}</b>
              </b-col>
              <b-col v-if="getTotalKgsMeters.diametro > 0">
                Total de diametro <b>{{(getTotalKgsMeters.diametro).toLocaleString('en-us')}}</b>
              </b-col>
            </b-row>
          </b-card-text>
        </b-card>
      </b-col>
      <b-col cols="4">
        <b-button variant="primary" class="mt-4" v-if="dataXLS.length > 0" @click="exportXLS">
          Exportar datos a excel
        </b-button>
        <!-- <download-excel -->
        <!--   class="btn btn-primary mt-4" -->
        <!--   :data="dataXLS" -->
        <!--   name="datos.xls" v-if="dataXLS.length != 0"> -->
        <!--   Exportar datos a excel -->
        <!-- </download-excel> -->
      </b-col>
    </b-row>

  </template>

  <b-row class="pt-4">
    <b-col cols="12">
      <b-pagination
        v-model="currentPage"
        :total-rows="getRolls.length"
        :per-page="perPage"
        align="center">
      </b-pagination>
    </b-col>
  </b-row>

  <b-row class="mb-2">
    <b-table
      :fields="fields"
      :items="getRolls"
      :per-page="perPage"
      :current-page="currentPage"
      head-variant="dark"
      responsive
      >

      <!-- <template slot="enUso" slot-scope="row"> -->
      <!--   <label v-if="row.item.enUso">Sí</label> -->
      <!--   <label v-else>No</label> -->
      <!-- </template> -->
      <template v-if="row.item.kgs" slot="kgs" slot-scope="row">
        <b>{{(row.item.kgs).toLocaleString('en-us')}}</b>
      </template>
      <template v-if="row.item.kgsOriginales" slot="kgsOriginales" slot-scope="row">
        <b>{{(row.item.kgsOriginales).toLocaleString('en-us')}}</b>
      </template>
      <template v-if="row.item.kgsActuales" slot="kgsActuales" slot-scope="row">
        <b>{{(row.item.kgsActuales).toLocaleString('en-us')}}</b>
      </template>
      <template slot="kgsConsumidos" slot-scope="row">
        <b v-if="row.item.kgsConsumidos">{{(row.item.kgsConsumidos).toLocaleString('en-us')}}</b>
        <b v-else>0</b>
      </template>
      <template v-if="row.item.meters" slot="meters" slot-scope="row">
        <b>{{(row.item.meters).toLocaleString('en-us')}}</b>
      </template>
      <template v-if="row.item.fecha" slot="fecha" slot-scope="row">
        {{row.item.fecha.toLocaleDateString()}}
      </template>
      <!-- <template slot="fechaTraslado" slot-scope="row"> -->
      <!--   <label for="" v-if="row.item.fechaTraslado">{{row.item.fechaTraslado.toISOString().slice(0, 10)}}</label> -->
      <!--   <label for="" v-else>No definida</label> -->
      <!-- </template> -->
      <template slot="typePaper" slot-scope="row">
        <label class="px-2">
          {{row.item.typePaper}}
        </label>
      </template>
      <template slot="acciones" slot-scope="row">
        <b-row>
          <b-col cols="6" class="mx-0 px-0">
            <a class="btn btn-primary mr-2" href="" @click.stop.prevent="modalShowEdit(row.item)">
              <v-icon name="edit"></v-icon>
            </a>
          </b-col>
          <b-col cols="6" class="mx-0 px-0">
            <a class="btn btn-danger" href="" @click.stop.prevent="modalDeleteShowEdit(row.item)">
              <v-icon name="trash-alt"></v-icon>
            </a>
          </b-col>
        </b-row>
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

        <b-form-group class="col-4" id="idKg" label="Kgs" label-for="input-kg" v-if="actualTab === 0 || actualTab === 2">
          <b-form-input
            id="input-kg"
            type="text"
            v-model="modalRow.kgs"
            required>
          </b-form-input>
        </b-form-group>

        <b-form-group class="col-4" id="idKgOrig" label="Kgs Originales" label-for="input-kgOriginales"
                      v-if="actualTab === 1">
          <b-form-input
            id="input-kgOrig"
            type="number"
            min="0" step="0.001"
            v-model="modalRow.kgsOriginales"
            required>
          </b-form-input>
        </b-form-group>

        <b-form-group class="col-4" id="idKgOrig" label="Kgs Actuales" label-for="input-kgActuales"
                      v-if="actualTab === 1">
          <b-form-input
            id="input-kgAct"
            type="number"
            min="0" step="0.001"
            v-model="modalRow.kgsActuales"
            required>
          </b-form-input>
        </b-form-group>

        <b-form-group class="col-4" id="idKg" label="Kgs Consumidos" label-for="input-kg"
                      v-if="actualTab === 1">
          <b-form-input
            id="input-kgC"
            type="number"
            min="0" step="0.001"
            v-model="modalRow.kgsConsumidos"
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
        <b-form-group class="col-4" id="inUso" label="En uso" label-for="input-inUse"
                      v-if="actualTab === 0 || actualTab === 1">
          <b-form-select
            v-model="modalRow.enUso"
            >
            <option value="si">Si</option>
            <option value="no">No</option>
          </b-form-select>
        </b-form-group>
        <b-form-group class="col-4" id="idTypePaper" label="Tipo de papel" label-for="input-typePaper">
          <b-form-select v-model="modalRow.typePaper">
            <option value="MEDIUM">MEDIUM</option>
            <option value="LINER">LINER</option>
            <option value="LINER R">LINER R</option>
            <option value="WHITE TOP">WHITE TOP</option>
          </b-form-select>
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

        <b-form-group class="col-4" id="idDua" label="DUA" label-for="input-dua"
                      v-if="actualTab === 0 || actualTab === 2">
          <b-form-input
            id="input-dua"
            type="text"
            v-model="modalRow.numeroDUA"
            required>
          </b-form-input>
        </b-form-group>
        <b-form-group class="col-4" id="idBoleta" label="Boleta" label-for="input-boleta"
                      v-if="actualTab === 0 || actualTab === 2">
          <b-form-input
            id="input-boleta"
            type="text"
            v-model="modalRow.numeroBoleta"
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
    dataXLS(){
      let data = this.getRolls.slice()
      let fin = []
      for( let key in data){
        let obj = {
          'Numero rollo': (data[key].idNumber).toString(),
        }
        if (typeof data[key].bodega !== 'undefined'){
          obj['Bodega'] = data[key].bodega
        }

        if (this.actualTab === 0 || this.actualTab === 2){
          obj['Kgs'] = data[key].kgs
        }

        if(this.actualTab === 1){
          obj['Kgs origin.'] = data[key].kgsOriginales
        }

        if(this.actualTab === 1){
          obj['Kgs act.'] = data[key].kgsActuales
        }

        if(this.actualTab === 1){
          obj['Kgs Consumidos'] = data[key].kgsConsumidos
        }

        if(typeof data[key].meters !== 'undefined'){
          obj['Metros'] = data[key].meters
        }

        obj['Gramaje'] = data[key].gramaje
        obj['Ancho'] = data[key].width
        obj['Tipo papel'] = data[key].typePaper

        if(typeof data[key].numeroBoleta !== 'undefined'){
          obj['Boleta'] = data[key].numeroBoleta
        }

        if(typeof data[key].numeroDUA !== 'undefined'){
          obj['DUA']= data[key].numeroDUA
        }

        if(typeof data[key].comments !== 'undefined'){
          obj['Comentario'] = data[key].comments
        }
        if (typeof data[key].fecha !== 'undefined'){
          obj['Fecha'] = this.formatDate(data[key].fecha)
        }
        if (typeof data[key].hora !== 'undefined'){
          obj['Hora'] = data[key].hora
        }
        if (typeof data[key].desperdicio !== 'undefined'){
          obj['Desperdicio'] = data[key].desperdicio
        }
        fin.push(obj)
      }
      return fin

    },
    getTotalKgsMeters(){
      let kgsM = {}
      let kg = 0
      let meters = 0
      let desperdicio = 0
      let diametro = 0
      // let listNumberRoll = []
      this.rollsFilter.forEach( roll=> {
        kg += parseFloat(roll.kgs)
        if (roll.meters ) meters += parseFloat(roll.meters)
        if (roll.desperdicio) desperdicio += parseFloat(roll.desperdicio)
        if(roll.diametro) diametro += parseFloat(roll.diametro)
      })
      kgsM.kg = kg
      kgsM.meters = meters
      kgsM.desperdicio = desperdicio
      kgsM.diametro = diametro
      kgsM.tons = Math.round(kg / 1000)
      return kgsM
    },
    getRolls(){
      this.rollsFilter = this.items.filter( el => {
        let bodega = el.bodega
        el.kgsConsumidos = Math.round(el.kgsConsumidos)
        typeof bodega === 'undefined' ? this.disabledBodega = true : this.disabledBodega = false

        this.showFilterDate = el.fecha === null ? false : true


        let r = el.gramaje.toString().indexOf(this.filterGramaje) > -1 &&
            el.typePaper.toLowerCase().indexOf(this.filterType.toLowerCase()) > -1 &&
            el.width.indexOf(this.filterWidth) > -1 &&
            el.idNumber.toString().indexOf(this.filterNumberRoll) > -1

        if (typeof el.enUso !== 'undefined') {
          r = r && el.enUso.toLowerCase().indexOf(this.filterEnUso) > -1
        }
        if(el.fecha !== null){
          r = r && el.fecha >= new Date(this.dateFilterBegin + 'T00:00:00-06:00')
            && el.fecha <= new Date(this.dateFilterFinish + 'T00:00:00-06:00')
        }

        // if(this.actualTab === 0 && el.fechaTraslado){
        //   r = r && el.fechaTraslado >= new Date(this.dateFilterBeginT + 'T00:00:00-06:00')
        //     && el.fechaTraslado <= new Date(this.dateFilterFinishT + 'T00:00:00-06:00')
        // }

        if(typeof bodega === 'undefined') {
          return r
        }
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

        //Borrar espacios en el tipo de papel para evitar problemas en los filtros
        let typePaper = roll.typePaper
        if (typePaper.includes('WHITE TOP')) {
          roll.typePaper = 'WHITE TOP'
        }
        else if (typePaper.includes('LINER R')){
          roll.typePaper = 'LINER R'
        }else if (typePaper.includes('LINER')){
          roll.typePaper = 'LINER'
        }else if(typePaper.includes('MEDIUM')){
          roll.typePaper = 'MEDIUM'
        }
        // let rollsCustom = roll.typePaper.split(' ').join('')
        // roll.typePaper = rollsCustom
        // if (roll.gramaje.includes('LINER R'))
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
      filterEnUso: '',
      filterBodega: '',
      filterNumberRoll: '',
      rollsFilter: [],
      dateFilterBegin: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10).toString(),
      dateFilterFinish: new Date().toISOString().slice(0, 10).toString(),
      disabledBodega: false,
      showFilterDate: false,
      modalShow: false,
      modalRow: {},
      modalRowCopy: {},
      modalDeleteShow: false,
      keyRoll: 0,
      db: firebase.database(),
      currentUser: firebase.auth().currentUser,
      isUndefinedComment: false,
      modalChangeAddHistorial: false,
      selectedMoveHistory: 'false',
      perPage: 100,
      currentPage: 1
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
      this.modalRowCopy = Object.assign({}, row)
      let w = (this.modalRow.width).substr(0,2) //Remover comillas de pulgadas

      if (this.modalRow.fecha) {
        let fecha = this.formatDate(this.modalRow.fecha).split('-')
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

        this.db.ref('HistorialInventario').child(key).set(roll).then( () => {
          this.db.ref('Inventario').child(this.keyRoll).remove()
          this.registerChange('Movida a comsumo', 'Inventario', '', roll)
        })

      }
      else if(this.selectedMoveHistory === 'false') {

        this.db.ref('Inventario').child(this.keyRoll).remove()

        this.db.ref('/Pre-historial_Inventario').orderByChild('idNumber')
          .equalTo(this.modalRow.idNumber).once('value').then( snap => {
            let key = Object.keys(snap.val())[0]
            this.db.ref('/Pre-historial_Inventario').child(key).remove()

            //Para registrar cambio al borrar

            this.registerChange('Bobina eliminada', 'Inventario', '', this.modalRow)
          })
      }
      this.modalDeleteShow = false

      // this.db.ref('/Inventario').child(this.keyRoll).remove()
    },
    deleteItem: function(){
      if(this.actualTab === 0){
        this.modalChangeAddHistorial = true
      }else if(this.actualTab === 1){
        this.modalDeleteShow = false
        this.db.ref('InventarioSobrantes').child(this.keyRoll).remove().then( () => {
          this.registerChange('Bobina eliminada', 'Sobrantes', '', this.modalRow)
        })
      }else if(this.actualTab === 2){
        this.modalDeleteShow = false
        this.db.ref('HistorialInventario').child(this.keyRoll).remove().then( () => {
          this.registerChange('Bobina eliminada', 'Consumos', '', this.modalRow)
        })
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
          bodega: this.modalRow.bodega.toString(),
          comments: this.modalRow.comments,
          enUso: this.modalRow.enUso,
          gramaje: this.modalRow.gramaje,
          idNumber: this.modalRow.idNumber,
          kgs: Number(this.modalRow.kgs),
          meters: Number(this.modalRow.meters),
          typePaper: this.modalRow.typePaper,
          numeroDUA: this.modalRow.numeroDUA,
          numeroBoleta: this.modalRow.numeroBoleta,
          width: Number(this.modalRow.width)
        }
        this.db.ref('Inventario').child(key).update(obj).then( (data) => {
          // this.modalShow = false
          this.registerChangeByInventario(obj, 'Inventario')
          this.db.ref('/Pre-historial_Inventario').orderByChild('idNumber')
            .equalTo(this.modalRow.idNumber).once('value').then( snap => {
              let key = Object.keys(snap.val())[0]
              delete obj['bodega']
              delete obj['enUso']
              this.db.ref('/Pre-historial_Inventario').child(key).update(obj).then( data => {
                this.modalShow = false
              })
            })

        }).catch( error => {
          console.log(error)
        })

      }else if(this.actualTab === 1) {

        let obj = {
          bodega: this.modalRow.bodega,
          causaDesperdicio: (typeof this.causaDesperdicio !== 'undefined') ? this.causaDesperdicio : null,
          diametro: this.modalRow.diametro,
          enUso: this.modalRow.enUso,
          // fecha: this.modalRow.fecha,
          gramaje: this.modalRow.gramaje,
          // hora: this.modalRow.hora,
          idNumber: this.modalRow.idNumber,
          kgsOriginales: Number(this.modalRow.kgsOriginales),
          kgsActuales: Number(this.modalRow.kgsActuales),
          kgsConsumidos: Number(this.modalRow.kgsConsumidos),
          kgs: Number(this.modalRow.kgsActuales),
          typePaper: this.modalRow.typePaper,
          desperdicio: this.modalRow.desperdicio,
          width: Number(this.modalRow.width)
        }
        this.db.ref('InventarioSobrantes').child(key).update(obj).then( (data) => {
          this.registerChangeByInventario(obj, 'Sobrantes')
          this.modalShow = false
        }).catch( error => {
          console.log(error)
        })


      }else if(this.actualTab === 2){
        let obj = {
          comments: this.modalRow.comments,
          desperdicio: this.modalRow.desperdicio,
          // Fecha: this.modalRow.fecha,
          gramaje: this.modalRow.gramaje,
          idNumber: this.modalRow.idNumber,
          kgs: Number(this.modalRow.kgs),
          meters: Number(this.modalRow.meters),
          typePaper: this.modalRow.typePaper,
          width: Number(this.modalRow.width),
          numeroDUA: this.modalRow.numeroDUA,
          numeroBoleta: this.modalRow.numeroBoleta
        }

        this.db.ref('HistorialInventario').child(key).update(obj).then( data => {
          this.registerChangeByInventario(obj, 'Consumos')
          this.modalShow = false
        }).catch( error => {
          console.log(error)
        })

      }

      // this.db.ref(key).set
      // console.log(this.modalRow)
    },
    exportXLS: function(){

      let sheet = XLSX.utils.json_to_sheet(this.dataXLS)

      let wb = XLSX.utils.book_new()

      XLSX.utils.book_append_sheet(wb, sheet, 'datos')
      XLSX.writeFile(wb, 'datos.xlsx')

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
    registerChangeByInventario: function(obj, site){
      Object.keys(obj).forEach( key => {

        if (this.modalRow[key] !== this.modalRowCopy[key]) {
          let customKey = key

          if (customKey === 'idNumber') customKey = 'número de rollo'
          if (customKey === 'meters') customKey = 'metros'
          if (customKey === 'comments') customKey = 'comentario'
          if (customKey === 'width') customKey = 'ancho'
          if (customKey === 'numeroDUA') {
            customKey = 'número de dua'
            if(this.modalRowCopy[key] === null) this.modalRowCopy[key] = 'sin dato'
          }
          if (customKey === 'numeroBoleta') {
            customKey = 'número de bodega'
            if(this.modalRowCopy[key] === null) this.modalRowCopy[key] = 'sin dato'
          }
          // change, ubication, nota, roll
          let change = `Se cambio ${customKey}: ${this.modalRowCopy[key]} a ${this.modalRow[key]}`
          this.registerChange(change, site, '', this.modalRow)

        }
      })
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
  }

}
 </script>
