<template>
<b-container fluid>
  <b-row>
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
          <option value="WHITE TOP">WHITE TOP</option>
        </b-form-select>
      </b-input-group>
    </b-col>
    <b-col cols="4">
      <b-input-group>
        <b-input-group-text slot="prepend">Ancho</b-input-group-text>
        <b-form-input v-model="filterWidth"></b-form-input>
      </b-input-group>
    </b-col>
  </b-row>
  <b-row class="pt-2">
    <b-col cols="4">
      <b-input-group>
        <b-input-group-text slot="prepend" >Numero rollo</b-input-group-text>
        <b-form-input v-model="filterIdNumber"></b-form-input>
      </b-input-group>
    </b-col>
    <b-col cols="4">
      <b-input-group>
        <b-input-group-text slot="prepend" >Fecha Inicio</b-input-group-text>
        <b-form-input v-model="filterDateBegin" type="date"></b-form-input>
      </b-input-group>
    </b-col>
    <b-col cols="4">
      <b-input-group>
        <b-input-group-text slot="prepend" >Fecha Final</b-input-group-text>
        <b-form-input v-model="filterDateFinish" type="date"></b-form-input>
      </b-input-group>
    </b-col>
  </b-row>
  <b-row class="pt-4">
    <b-col cols="8" class="my-2">
      <b-card bg-variant="light" text-variant="dark" title="Rollos información">
        <b-card-text>
          <b-row>
            <div v-for="(gramaje, index) in totalRolls.rollsByGramaje" :key="index">

              <b-col>
                <b>
                  <label for="" class="px-2">{{gramaje.gramaje}}</label>
                  cantidad: {{gramaje.count}}
                </b>
              </b-col>
            </div>
            <b-col>
              Total de rollos: <b>{{totalRolls.length}}</b>
            </b-col>
          </b-row>
        </b-card-text>
      </b-card>
    </b-col>
    <b-col cols="4">
      <b-button variant="primary" class="mt-4"
                 v-if="dataXLS.length > 0" @click="exportXLS">
        Exportar datos a excel
      </b-button>
    </b-col>
  </b-row>
  <b-row class="pt-4">
    <b-table
      :fields="fields"
      :items="getRolls"
      >
      <template v-if="row.item.fecha" slot="fecha" slot-scope="row">
        {{row.item.fecha.toLocaleDateString()}}
      </template>
      <template slot="kgs" slot-scope="row">
        <b>{{(row.item.kgs).toLocaleString('en-us')}}</b>
      </template>
      <template slot="meters" slot-scope="row">
        <b>{{(row.item.meters).toLocaleString('en-us')}}</b>
      </template>
    </b-table>
  </b-row>
</b-container>
</template>

<script>
export default {
  name: 'ajuste-salida',
  props: ['items'],
  computed: {
    dataXLS () {
      let data = this.getRolls.slice()

      let fin = []

      for (let key in data) {
        let obj = {
          'Numero rollo': (data[key].numRollo).toString(),
          'Fecha': data[key].fecha,
          'Hora': data[key].hora,
          'Llegada': data[key].llegada,
          'Kgs': data[key].kgs,
          'Metros': data[key].meters,
          'Gramaje': data[key].gramaje,
          'Ancho': data[key].ancho,
          'Tipo papel': data[key].typePaper,
          'Dua': data[key].dua,
          'Boleta': data[key].boleta,
          'Comentario': data[key].comments
        }
        fin.push(obj)
      }
      return fin
    },
    totalRolls () {
      let total = {}
      total.length = this.getRolls.length

      let rollsByGramaje = {}

      this.getRolls.forEach( roll => {
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
    getRolls: function () {
      let filter = this.items.filter( el => {
        return (el.numRollo).toString().indexOf(this.filterIdNumber.toString()) > -1 &&
          (el.typePaper).toString().indexOf(this.filterType) > -1  && (el.gramaje).toString().indexOf(this.filterGramaje) > -1 &&
          (el.ancho).toString().indexOf(this.filterWidth) > -1 &&
          (el.fecha) >= new Date(this.filterDateBegin + 'T00:00:00-06:00') &&
          (el.fecha) <= new Date(this.filterDateFinish + 'T00:00:00-06:00')

      })
      return filter
    }
  },
  data () {
    return {
      filterGramaje: '',
      filterType: '',
      filterWidth: '',
      filterIdNumber: '',
      filterDateBegin: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10).toString(),
      filterDateFinish: new Date().toISOString().slice(0, 10).toString(),
      showFilterDate: false,
      fields: [
        'numRollo',
        'fecha',
        'hora',
        'llegada',
        'kgs',
        {key: 'meters', label: 'Metros'},'gramaje', 'ancho',
        {key: 'typePaper', label: 'Tipo papel'}, 'dua', 'boleta', 'comentario'
      ]
    }
  },
  methods: {
    exportXLS: function(){

      let sheet = XLSX.utils.json_to_sheet(this.dataXLS)

      let wb = XLSX.utils.book_new()

      XLSX.utils.book_append_sheet(wb, sheet, 'datos')
      XLSX.writeFile(wb, 'ajusteSalida.xlsx')

    },
  }

}
</script>
