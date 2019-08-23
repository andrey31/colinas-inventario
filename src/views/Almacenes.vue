<template>
<b-container fluid>
  <h2>Almacenes</h2>
  <template>
    <b-row class="mb-2">
      <b-col cols="4">
        <b-input-group>
          <b-input-group-text slot="prepend">Almacen</b-input-group-text>
          <b-form-select v-model="filterAlmacen">
            <option value="">Todos</option>
            <option value="telisa">Telisa</option>
            <option value="sislocar">Sislocar</option>
          </b-form-select>
        </b-input-group>
      </b-col>
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
    </b-row>
    <b-row>
      <b-col cols="4">
        <b-input-group>
          <b-input-group-text slot="prepend">Ancho</b-input-group-text>
          <b-form-input v-model="filterWidth"></b-form-input>
        </b-input-group>
      </b-col>
      <b-col cols="4">
        <b-input-group>
          <b-input-group-text slot="prepend" >Fecha Inicio</b-input-group-text>
          <b-form-input v-model="dateFilterBegin" type="date"></b-form-input>
        </b-input-group>
      </b-col>
      <b-col>
        <b-input-group>
          <b-input-group-text slot="prepend" >Fecha Final</b-input-group-text>
          <b-form-input v-model="dateFilterFinish" type="date"></b-form-input>
        </b-input-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="4">
        <b-input-group class="pt-2">
          <b-input-group-text slot="prepend">Numero rollo</b-input-group-text>
          <b-form-input v-model="filterNumberRoll"></b-form-input>
        </b-input-group>
        <download-excel
          class="btn btn-primary mt-4"
          :data="rollsFilter"
          name="datos.xls" v-if="rollsFilter.length != 0">
          Exportar datos a excel
        </download-excel>
      </b-col>
      <b-col cols="8">
        <b-card bg-variant="light" text-varbiant="dark" title="Rollos información">
          <b-card-text>
            <b-row>
              <div v-for="gramaje, index in totalRolls.rollsByGramaje">

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
                Total de kilos <b>{{(getTotalKgsMeters.kg).toLocaleString('en-us')}}</b>
              </b-col>
              <b-col v-if="getTotalKgsMeters.tons > 0">
                Total de toneladas <b>{{(getTotalKgsMeters.tons).toLocaleString('en-us')}}</b>
              </b-col>
              <b-col v-if="getTotalKgsMeters.meters > 0">
                Total de metros <b>{{(getTotalKgsMeters.meters).toLocaleString('en-us')}}</b>
              </b-col>
            </b-row>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>
  </template>
  <b-row class="pt-4">
    <b-col cols="4">
      <b-button>Ingresar rollo manual</b-button>
    </b-col>
    <b-col cols="4">
      <b-pagination
        v-model="currentPage"
        :total-rows="rows"
        :per-page="perPage"
        align="center">
      </b-pagination>
    </b-col>
  </b-row>
  <b-tabs class="bg-light">
    <b-table
      :items="rollsFilter"
      :fields="fieldsRolls"
      :per-page="perPage"
      :current-page="currentPage"
      head-variant="dark"
      >
      <template slot="meters" slot-scope="row">
        <b>{{(row.item.meters).toLocaleString('en-us')}}</b>
      </template>
      <template slot="kgs" slot-scope="row">
        <b>{{(row.item.kgs).toLocaleString('en-us')}}</b>
      </template>
      <template slot="fecha" slot-scope="row">
        {{row.item.fecha.toISOString().slice(0, 10)}}
      </template>
      <template slot="dua" slot-scope="row">
        <b-row>
          <b-col cols="6">
            <b-button v-if="!row.item.dua" @click="addDua(row.item)"><v-icon name="file"></v-icon></b-button>
            <label v-else @click="addDua(row.item)">{{row.item.dua}}</label>
          </b-col>
        </b-row>
      </template>
      <template slot="acciones" slot-scope="row">
        <b-row>
          <b-col cols="6" class="mx-0 px-0">
            <a class="btn btn-primary mr-2" href="" @click.stop.prevent="edit(row.item)">
              <v-icon name="edit"></v-icon>
            </a>
          </b-col>
          <b-col cols="6" class="mx-0 px-0">
            <a class="btn btn-danger" href="" @click.stop.prevent="deleteRoll(row.item.idNumber, row.item.almacen)">
              <v-icon name="trash-alt"></v-icon>
            </a>
          </b-col>
        </b-row>
      </template>
    </b-table>
  </b-tabs>
  <modal-almacenes :modalRow="modalRow"></modal-almacenes>
  <modal-delete-almacen :idNumber="idNumberDelete" :almacen="almacenDelete"></modal-delete-almacen>
  <modal-dua-almacen></modal-dua-almacen>
</b-container>
</template>

<script>
import firebase from 'firebase/app'
import ModalAlmacenes from '@/components/ModalAlmacenes.vue'
import ModalDeleteAlmacen from '@/components/ModalDeleteAlmacen.vue'
import ModalDuaAlmacen from '@/components/ModalDuaAlmacen.vue'

import { mapMutations } from 'vuex'

export default{
  name: 'almacenes',
  components: {
    ModalAlmacenes,
    ModalDeleteAlmacen,
    ModalDuaAlmacen
  },
  mounted(){
    this.db.ref('/sislocar')
      .on('value', snapshot => {
        this.sislocarRolls = []
        this.loadRolls(snapshot.val(), 'sislocar')
      })

    this.db.ref('/telisa')
      .on('value', snapshot => {
        this.telisaRolls = []
        this.loadRolls(snapshot.val(), 'telisa')
      })

    this.db.ref('/otro')
      .on('value', snapshot => {
        this.otherRolls = []
        this.loadRolls(snapshot.val(), 'otro')
      })
  },
  computed: {
    disableActions: function(){
      if (this.currentUser.email === 'omar.duran@corrugadosaltavista.com' ||
          this.currentUser.email === 'admin@corrugadosaltavista.com' ||
          this.currentUser.email === 'guillermo.hernandez@corrugadosaltavista.com' ||
          this.currentUser.email === 'jose.rodriguez@corrugadosaltavista.com') {
        return false
      }
      else return true
    },
    fieldsRolls: function() {
      return [
        {key: 'idNumber', label: 'Numero de rollo'},
        'almacen',
        {key: 'meters', label: 'Metros lineales'},
        'gramaje',
        {key: 'width', label: 'Ancho'},
        {key: 'typePaper', label: 'Tipo de papel'},
        {key: 'kgs', label: 'Kilogramos'},
        {key: 'comments', label: 'Comentario'},
        {key: 'fecha', label: 'Fecha'},
        'dua',
        this.disableActions ? null : 'acciones'
      ]

    },
    allRolls: function(){
      return this.sislocarRolls.concat(this.telisaRolls, this.otherRolls)
    },
    getTotalKgsMeters: function(){
      let kgsM = {}
      let kg = 0
      let meters = 0
      this.rollsFilter.forEach( roll => {
        kg += parseFloat(roll.kgs)
        if (roll.meters) meters += parseFloat(roll.meters)
      })

      kgsM.kg = kg
      kgsM.meters = meters
      kgsM.tons = kg / 1000

      return kgsM
    },
    disableButtonDelete: function(){
      if (this.currentUser.email === 'omar.duran@corrugadosaltavista.com') return false
      else return true

    },
    rollsFilter: function(){

      let filter = this.allRolls.filter( el => {
        return el.almacen.indexOf(this.filterAlmacen.toLowerCase()) > -1 &&
          el.gramaje.toString().indexOf(this.filterGramaje) > -1 &&
          el.typePaper.toLowerCase().indexOf(this.filterType.toLowerCase()) > -1 &&
          el.width.toString().indexOf(this.filterWidth) > -1 &&
          el.idNumber.toString().toLowerCase().indexOf(this.filterNumberRoll.toLowerCase()) > -1 &&
          el.fecha >= new Date(this.dateFilterBegin + 'T00:00:00-06:00') &&
          el.fecha <= new Date(this.dateFilterFinish + 'T00:00:00-06:00')
      })
      return filter
    },
    totalRolls: function(){
      let total = {}
      total.length = this.rollsFilter.length

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
    },
    rows() {
      return this.rollsFilter.length
    }
  },

  data() {
    return {
      db: firebase.database(),
      currentUser: firebase.auth().currentUser,
      telisaRolls: [],
      sislocarRolls: [],
      otherRolls: [],
      filterAlmacen: '',
      filterGramaje: '',
      filterType: '',
      filterWidth: '',
      filterNumberRoll: '',
      modalRow: {},
      idNumberDelete: '',
      almacenDelete: '',
      perPage: 100,
      currentPage: 1,
      dateFilterBegin: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10).toString(),
      dateFilterFinish: new Date().toISOString().slice(0, 10).toString(),
    }
  },
  methods: {

    ...mapMutations(['setModalShowAlmacen', 'setModalDeleteAlmacen', 'setModalDuaAlmacen']),
    pushAllRoll: function(idNumber, almacen, meters, gramaje, width, typePaper, kgs, comments, fecha, dua){

      if (almacen === 'telisa') {
        this.telisaRolls.push({
          idNumber, almacen, meters, gramaje, width, typePaper, kgs, comments, fecha, dua
        })
      }else if (almacen === 'sislocar') {
        this.sislocarRolls.push({
          idNumber, almacen, meters, gramaje, width, typePaper, kgs, comments, fecha, dua
        })
      }else if (almacen === 'otro') {
        this.otherRolls.push ({
          idNumber, almacen, meters, gramaje, width, typePaper, kgs, comments, fecha, dua
        })
      }
    },
    // Recibe rollos por almacen y nombre del almacen
    loadRolls: function(almacenRolls, almacen) {



      for (let key in almacenRolls) {

        if (almacenRolls[key].fecha){
          let fe = almacenRolls[key].fecha

          let fechaArray = fe.split('-')
          let day = fechaArray[0]
          let month = fechaArray[1] - 1
          let year = fechaArray[2]
          let fecha = new Date(year, month, day)

          this.pushAllRoll(
            almacenRolls[key].idNumber,
            almacen,
            almacenRolls[key].meters,
            almacenRolls[key].gramaje,
            almacenRolls[key].width,
            almacenRolls[key].typePaper,
            almacenRolls[key].kgs,
            almacenRolls[key].comments,
            fecha,
            almacenRolls[key].dua
          )
        }
      }
    },
    edit: function(row){
      this.modalRow = {
        idNumber: row.idNumber,
        almacen: row.almacen,
        meters: row.meters,
        gramaje: row.gramaje,
        width: row.width,
        typePaper: row.typePaper,
        kgs: row.kgs,
        comments: row.comments
      }
      this.setModalShowAlmacen(true)

    },
    deleteRoll: function(idNumber, almacen){
      this.idNumberDelete = idNumber
      this.almacenDelete = almacen
      this.setModalDeleteAlmacen(true)
    },
    addDua: function(roll) {
      this.setModalDuaAlmacen({
        show: true,
        roll
      })
    }
  }

}
</script>
