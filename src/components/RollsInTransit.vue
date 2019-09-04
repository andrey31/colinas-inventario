<template>
<div>
  <b-row class="my-2">
    <b-col cols="4">
      <b-input-group>
        <b-input-group-text slot="prepend">Numero de rollo</b-input-group-text>
        <b-form-input v-model="filterIdNumber"></b-form-input>
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
        <b-input-group-text slot="prepend">Ancho</b-input-group-text>
        <b-form-input v-model="filterWidth"></b-form-input>
      </b-input-group>
    </b-col>
  </b-row>
  <b-row class="my-2">
    <b-col cols="4" offset="4">
      <b-input-group>
        <b-input-group-text slot="prepend">Almacen</b-input-group-text>
        <b-form-select v-model="filterAlmacen">
          <option value="">Todos</option>
          <option value="telisa">Telisa</option>
          <option value="sislocar">Sislocar</option>
        </b-form-select>
      </b-input-group>
    </b-col>
  </b-row>
  <b-row >
    <b-col cols="12">
      <b-pagination
        v-model="currentPage"
        :total-rows="rollosEnTransitoFilter.length"
        :per-page="perPage"
        align="center">
      </b-pagination>
    </b-col>
  </b-row>
  <b-row class="my-2">
    <b-col cols="12">
      <b-button variant="primary"
                :disabled="(countSelectRolls <= 0)"
                @click="showModalSendRolls = true">
        Registrar rollos
      </b-button>
    </b-col>
  </b-row>

  <b-row class="">
    <b-col cols="12">
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
          <b-row>
            <b-col cols="12">
              <download-excel
                class="btn btn-primary mt-4"
                :data="dataXLS"
                name="datos.xls" v-if="dataXLS.length != 0">
                Exportar datos a excel
              </download-excel>
            </b-col>
          </b-row>
        </b-card-text>
      </b-card>
    </b-col>
  </b-row>

  <b-table :items="rollosEnTransitoFilter" :fields="fieldsRolls" :per-page="perPage"
           :current-page="currentPage">
    <template slot="kgs" slot-scope="row">
      {{Math.round(Number(row.item.kgs)).toLocaleString('en-us')}}
    </template>
    <template slot="meters" slot-scope="row">
      {{Math.round(Number(row.item.meters)).toLocaleString('en-us')}}
    </template>
    <template slot="enTransito" slot-scope="row">
      <label v-if="row.item.enTransito">Sí</label>
      <label v-else>No</label>
    </template>
    <template slot="enAlmacen" slot-scope="row">
      <b-form-checkbox v-if="row.item.enTransito" v-model="rollsCheck" :value="row.item"
                       :disabled="rollsNotCheck.includes(row.item)" v-b-tooltip.hover :title="row.item.idNumber">
      </b-form-checkbox>
    </template>
    <template slot="noLlego" slot-scope="row">
      <b-form-checkbox v-if="row.item.enTransito && !row.item.comentarioNoLlego" v-model="rollsNotCheck" :value="row.item"
                       :disabled="rollsCheck.includes(row.item)" v-b-tooltip.hover :title="row.item.idNumber">
      </b-form-checkbox>
      <label for="" v-if="row.item.enTransito && row.item.comentarioNoLlego">{{row.item.comentarioNoLlego}}</label>
    </template>
  </b-table>
  <b-modal v-model="showModalSendRolls"
           header-bg-variant="primary"
           no-close-on-backdrop
           size="lg"
           >
    <template slot="modal-title">
      Registrar
    </template>
    <div class="text-center" v-if="rollsCheck.length > 0">
      <b>Se registrarán los siguientes rollos en el almacen:</b>
      <ul>
        <li v-for="roll in rollsCheck">
          <b-row class="pt-2">
            <b-col>{{roll.idNumber}}</b-col>
            <b-col><b-form-radio v-model="roll.almacen" :name="roll.idNumber" value="telisa">Telisa</b-form-radio></b-col>
            <b-col><b-form-radio v-model="roll.almacen" :name="roll.idNumber" value="sislocar">Sislocar</b-form-radio></b-col>
            <!-- <b-col><b-form-radio v-model="roll.almacen" :name="roll.idNumber" value="otro">Otro</b-form-radio></b-col> -->
          </b-row>
        </li>
      </ul>
    </div>
    <div class="text-center pt-2" v-if="rollsNotCheck.length > 0">
      <b>Por favor, ingrese un comentario de porque el rollo no llegó:</b>
      <ul>
        <li v-for="roll in rollsNotCheck">
          <b-row class="pt-2">
            <b-col cols="2" class="pt-1" offset="1">{{roll.idNumber}}</b-col>
            <b-col cols="8">
              <b-form-input v-model="roll.comentarioNoLlego" placeholder="Ingrese comentario"></b-form-input>
            </b-col>
          </b-row>
        </li>

      </ul>
    </div>
    <div slot="modal-footer" class="">
      <b-button variant="danger" class="mr-2" @click="showModalSendRolls = false">Cancelar</b-button>
      <b-button variant="primary" @click="sendRollsToAlmacen">Enviar</b-button>
      </div>
    </b-modal>
  </div>
</template>
<script>
import firebase from 'firebase/app'
export default {
  props: ['rollosEnTransito'],
  computed: {
    dataXLS: function(){
      let data = this.rollosEnTransitoFilter.slice()
      let arr = []

      for( let key in data){
        let obj = {
          'Numero de rollo': (data[key].idNumber).toString(),
          'Kilos': (data[key].kgs),
          'Metros': (data[key].meters),
          'Fecha': (data[key].fecha),
          'Gramaje': (data[key].gramaje).toString(),
          'Ancho': (data[key].width).toString(),
          'Tipo papel': (data[key].typePaper),
          'Comentario': (data[key].comments),
          'Almacen': (data[key].almacen)
        }
        arr.push(obj)
      }
      return arr
    },
    rollosEnTransitoFilter: function(){
      let idNumberArray = this.filterIdNumber.split(' ')
      let filterGlobal = []

      if (idNumberArray.length > 1) {

        for (let i in idNumberArray){

          let filter = this.rollosEnTransito.filter( el => {

            return el.enTransito === true && (el.idNumber.toString()).toLowerCase() === idNumberArray[i].toLowerCase() &&
              el.gramaje.toString().indexOf(this.filterGramaje) > -1 &&
              el.width.toString().indexOf(this.filterWidth) > -1 &&
              el.almacen.indexOf(this.filterAlmacen) > -1
          })

          filter.forEach( f => {
            filterGlobal.push(f)
          })
        }


      }else{

        filterGlobal = this.rollosEnTransito.filter( el => {

          return el.enTransito === true && el.idNumber.toString().indexOf(this.filterIdNumber) > -1 &&
            el.gramaje.toString().indexOf(this.filterGramaje) > -1 &&
            el.width.toString().indexOf(this.filterWidth) > -1 &&
            el.almacen.indexOf(this.filterAlmacen) > -1
        })
      }

      return filterGlobal
    },
    countSelectRolls: function(){
      return this.rollsCheck.length + this.rollsNotCheck.length
    },
    totalRolls: function() {
      let total = {}
      total.length = this.rollosEnTransitoFilter.length

      let rollsByGramaje = {}
      this.rollosEnTransitoFilter.forEach( roll => {
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
    getTotalKgsMeters: function(){
      let kgsM = {}
      let kg = 0
      let meters = 0
      this.rollosEnTransitoFilter.forEach( roll => {
        kg += parseFloat(roll.kgs)
        if (roll.meters) meters += parseFloat(roll.meters)
      })

      kgsM.kg = kg
      kgsM.meters = meters
      kgsM.tons = kg / 1000

      return kgsM
    },

  },
  data(){
    return {
      db: firebase.database(),
      fieldsRolls: [
        {key: 'typePaper', label: 'Tipo de papel'},
        {key: 'idNumber', label: 'Numero de rollo'},
        'fecha',
        'gramaje',
        {key: 'width', label: 'Ancho'},
        {key: 'kgs', label: 'Kilogramos'},
        {key: 'meters', label: 'Metros lineales'},
        'enTransito',
        'enAlmacen',
        {key: 'noLlego', label: 'No llegó'},
        {key: 'comments', label: 'Comentario'},
      ],
      rollsCheck: [],
      rollsNotCheck: [],
      showModalSendRolls: false,
      filterIdNumber: '',
      filterGramaje: '',
      filterWidth: '',
      filterAlmacen: '',
      perPage: 25,
      currentPage: 1
    }
  },
  methods: {
    sendRollsToAlmacen: function(){
      this.rollsNotCheck.forEach( roll => {
        this.db.ref(roll.almacen+'EnTransito').child(roll.idNumber).update(
          {
            comentarioNoLlego: roll.comentarioNoLlego,
            enTransito: false
          }
        ).then( (data) => {
          roll.enTransito = false
          roll._rowVariant = 'danger'
        })
      })

      this.rollsCheck.forEach( (roll, index, arr) => {

        let r = {
          comments: roll.comments,
          fecha: roll.fecha,
          gramaje: roll.gramaje,
          idNumber: roll.idNumber,
          kgs: roll.kgs,
          meters: roll.meters,
          typePaper: roll.typePaper,
          width: roll.width,
          dua: ''
        }
        this.db.ref(roll.almacen).child(r.idNumber).set(r).then((data) => {
          let rollId = r.idNumber
          this.db.ref((roll.almacen)+'EnTransito').child(rollId).update(
            {
              enTransito: false
            }
          ).then( (data) => {
            roll.enTransito = false
            roll._rowVariant = 'danger'
            console.log('en transito actualizado')

            let d = new Date()
            let month = '' + (d.getMonth() + 1)
            let day = '' + d.getDate()
            let year = d.getFullYear()
            let hour = d.getHours()
            let minutes = d.getMinutes()
            let seconds = d.getSeconds()
            let tz = hour < 12 ? ' am.' : ' pm.'
            let traslado = {
              fecha: day + '-' + month + '-' + year,
              hora: hour + ':' + minutes + ':' + seconds + tz,
              llegada: (roll.almacen).replace(/\b\w/g, l => l.toUpperCase()),
              numRollo: rollId,
              partida: 'En transito',
              gramaje: r.gramaje,
              width: r.width
            }

            let keyTraslado = this.db.ref('Traslados').push().key

            this.db.ref('Traslados').child(keyTraslado).set(traslado).then(data => {
              console.log('traslado agregado')
            }).catch( error => {
              console.log(error + ' en traslado')
            })
          }).catch( error => {
            console.log('error')
          })

          if (index === arr.length - 1 ) this.showModalSendRolls = false
        }).catch( error => {
          console.log('error transito no actualizado ' +error)
        })
      })
      this.rollsCheck = []
      this.rollsNotCheck = []
    },
  }
}
</script>
