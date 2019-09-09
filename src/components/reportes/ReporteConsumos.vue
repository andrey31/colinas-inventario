<template>
<b-container>
  <b-row>
    <b-col cols="6">
      <b-input-group>
        <b-input-group-text slot="prepend" >Fecha Inicio</b-input-group-text>
        <b-form-input type="date"></b-form-input>
      </b-input-group>
    </b-col>
    <b-col cols="6">
      <b-input-group>
        <b-input-group-text slot="prepend" >Fecha Final</b-input-group-text>
        <b-form-input type="date"></b-form-input>
      </b-input-group>
    </b-col>

    <!-- <b-col cols="12" class="pt-2"> -->
    <!--   <b-form-group label=""> -->
    <!--     <h6 slot="label"><b>Agrupar por:</b></h6> -->
    <!--     <b-form-radio-group v-model="groupBy" :options="groupByOptions" name="radios-stacked"> -->
    <!--     </b-form-radio-group> -->
    <!--   </b-form-group> -->
    <!-- </b-col> -->
    <b-col class="pt-4" cols="12">

        <b-button variant="success" size="lg" class="mr-2 p-2"
                  @click="exportReport('xls')">
          <!-- <b-spinner label="Spinning" v-if="exportExcel"></b-spinner> -->
          EXCEL
          <v-icon class="ml-2" name="file-excel" scale="2"></v-icon>
        </b-button>
        <b-button variant="danger" size="lg"
                   @click="exportReport('pdf')">
          <!-- <b-spinner label="Spinning" v-if="exportPDF"></b-spinner> -->
          PDF
          <v-icon class="ml-2"name="file-pdf" scale="2"></v-icon>
        </b-button>
        <!-- <b-button variant="primary" @click="exportReport" block >Generar reporte</b-button> -->
    </b-col>
  </b-row>
</b-container>
</template>
<script>
import firebase from 'firebase/app'
export default{
  data () {
    return {
      groupBy: 1,
      groupByOptions: [
        { text: 'Tipo papel', value: 1},
        { text: 'Totales', value: 2},
      ],
      db: firebase.database(),
      rolls: []
    }
  },
  methods: {
    exportReport: function(format){
      let sobrantes = []
      this.db.ref('/InventarioSobrantes').once('value').then( snap => {
        sobrantes = snap.val()

        for (let i in sobrantes) {
          // sobrantes[i]['meters'] = Math.round(inventario[i]['meters'])
          sobrantes[i]['kgs'] = Math.round(sobrantes[i]['kgs'])
          sobrantes[i]['kgsConsumidos'] = Math.round(sobrantes[i]['kgsConsumidos'])
          this.rolls.push(sobrantes[i])
        }
        this.sendXLS()
      })
    },
    sendXLS: function(){
      let groupByTypePaper = this.groupByTypePaper()
      console.log(groupByTypePaper)
    },
    groupByTypePaper: function () {
      let totalRolls = this.totalRolls()

      let filter = {}
      let wt = []
      let liner = []
      let medium = []

      totalRolls.rollsByGramaje.forEach( el => {
        let typePaper = (el.tipo).split('-')
        if(typePaper[1].includes('WHITE TOP')) {
          el['Gramaje-Ancho'] = typePaper[0]
          el['Tipo papel'] = 'WHITE TOP'
          wt.push(el)
        }else if(typePaper[1].includes('LINER')) {
          el['Gramaje-Ancho'] = typePaper[0]
          el['Tipo papel'] = 'LINER'
          liner.push(el)
        }else if(typePaper[1].includes('MEDIUM')) {
          el['Gramaje-Ancho'] = typePaper[0]
          el['Tipo papel'] = 'MEDIUM'
          medium.push(el)
        }
        delete el.tipo
      })

      filter['wt'] = wt
      filter['liner'] = liner
      filter['medium'] = medium
      return filter
    },
    totalRolls: function (){
      let total = {}
      total.length = this.rolls.length
      let rollsByGramaje = {}

      this.rolls.forEach( roll => {

        //Borrar espacios en el tipo de papel para evitar problemas en los filtros
        let typePaper = roll.typePaper
        if (typePaper.includes('WHITE TOP')) {
          roll.typePaper = 'WHITE TOP'
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
          let keyGramajeType = `${key} en ${roll.width}-${roll.typePaper}`
          rollsByGramajeType[keyGramajeType] = rollsByGramajeType[keyGramajeType] || []
          rollsByGramajeType[keyGramajeType].push({kgs: roll.kgs, kgsConsumidos: roll.kgsConsumidos})
        })
      })

      Object.keys(rollsByGramajeType).forEach( key => {

        gramajes.push({
          'tipo': key,
          'Cantidad de rollos': rollsByGramajeType[key].length,
          'roll': rollsByGramajeType[key]
        })
      })

      let gramajesAlt = []
      gramajes.forEach( el => {
        let peso = 0
        let consumido = 0
        for (let i in el.roll){
          peso += el.roll[i].kgs
          consumido += el.roll[i].kgsConsumidos
        }
        el['Peso total (Kgs)'] = Math.round(peso)
        el['Kgs consumidos'] = Math.round(consumido)
        delete el.roll
        gramajesAlt.push(el)
      })

      total.rollsByGramaje = gramajesAlt

      return total
    },
  }
}
</script>
