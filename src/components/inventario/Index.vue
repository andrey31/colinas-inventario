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
                  <b>{{gramaje.gramaje}} cantidad: {{gramaje.count}}</b>
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
        <template slot="acciones" slot-scope="row">
          <a class="btn btn-primary mr-2" href="" @click.stop.prevent="modalShowEdit(row.item)">
            <v-icon name="edit"></v-icon>
          </a>
          <a class="btn btn-danger" href="" @click.stop.prevent="modalDeleteShowEdit(row.item.key)">
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

        <b-form-group class="col-4" id="idBodega" label="Bodega" label-for="input-bodega">
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

        <b-form-group class="col-4" id="idMeters" label="Metros" label-for="input-meters">
          <b-form-input
            id="input-meters"
            type="text"
            v-model="modalRow.meters"
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
      <b-button variant="danger" class="mr-2">Cancelar</b-button>
      <b-button variant="primary" @click="editar">Guardar</b-button>
    </div>
  </b-modal>

  <b-modal v-model="modalDeleteShow"
           hide-header
           hide-footer
           >
    <b-container  class="text-center">
      <b-row>
        <b-col>
          <h3>¿Esta seguro de eliminar el registro?</h3>
        </b-col>
      </b-row>
      <b-row class="pt-4">

        <b-col>
          <b-button block variant="danger" class="mr-2">No</b-button>
          <b-button block variant="primary" class="mr-2">Si</b-button>
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
            el.idNumber.indexOf(this.filterNumberRoll) > -1

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
      isUndefinedComment: false
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

      if (this.actualTab === 0){
      }

      this.modalRow = Object.assign({}, row)
      this.modalShow = true
    },
    modalDeleteShowEdit: function(key){
      this.keyRoll = key
      this.modalDeleteShow = true
    },
    editar: function(){
      if (this.actualTab === 0){
        console.log(this.modalRow)
        let key = this.modalRow.key
        let objEdit = {

        }
        // console.log(this.modalRow)
        // console.log(this.modalRow.idNumber)
        // this.db.ref('inventario').set(this.modalRow).then( (data) => {
        //   console.log('agregado')
        // }).catch( error => {
        //   console.log(error)
        // })
        // console.log(key)
      }else if(this.actualTab === 1) {

      }else if(this.actualTab === 2){

      }



      console.log('hola')

      // this.db.ref(key).set
      // console.log(this.modalRow)
    }
  }

}
</script>
