<template>
<b-container fluid>
  <h2>Traslados</h2>

  <b-row class="mb-2">
    <b-col cols="4">
      <b-input-group>
        <b-input-group-text slot="prepend">Numero Rollo</b-input-group-text>
        <b-form-input v-model="filterRoll"></b-form-input>
      </b-input-group>
    </b-col>
    <b-col cols="4">
      <b-input-group>
        <b-input-group-text slot="prepend" >Fecha Inicio</b-input-group-text>
        <b-form-input v-model="filterDateBegin" type="date"></b-form-input>
      </b-input-group>
    </b-col>
    <b-col>
      <b-input-group>
        <b-input-group-text slot="prepend" >Fecha Final</b-input-group-text>
        <b-form-input v-model="filterDateFinish" type="date"></b-form-input>
      </b-input-group>
    </b-col>
  </b-row>

  <b-row class="pt-2">
    <b-col cols="4" offset="2">
      <b-input-group>
        <b-input-group-text slot="prepend">Partida</b-input-group-text>
        <b-form-select v-model="filterStart" :options="options">
        </b-form-select>
      </b-input-group>
    </b-col>
    <b-col cols="4">
      <b-input-group>
        <b-input-group-text slot="prepend">Llegada</b-input-group-text>
        <b-form-select v-model="filterEnd" :options="options"></b-form-select>
      </b-input-group>
    </b-col>
  </b-row>
  <b-row class="pt-2">
    <b-col cols="4" offset="2">
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
  <b-row class="pt-4">
    <b-col cols="12">
      <b-pagination
        v-model="currentPage"
        :total-rows="rows"
        :per-page="perPage"
        align="center">
      </b-pagination>
    </b-col>
  </b-row>

  <b-table
    :items="trasladosFilter"
    :fields="fields"
    :per-page="perPage"
    :current-page="currentPage"
    head-variant="dark"
    >
    <template slot="fecha" slot-scope="row">
      {{row.item.fecha.toISOString().slice(0, 10)}}
    </template>

  </b-table>
</b-container>
</template>

<script>
import firebase from 'firebase/app'
export default {
  computed: {
    rows: function () {
      return this.trasladosFilter.length
    },
    trasladosFilter: function () {
      let filter = this.traslados.filter ( el => {
        return el.partida.indexOf(this.filterStart) > -1 &&
          el.llegada.indexOf(this.filterEnd) > -1 &&
          el.numRollo.toString().indexOf(this.filterRoll) > -1 &&
          el.gramaje.toString().indexOf(this.filterGramaje) > -1 &&
          el.width.toString().indexOf(this.filterWidth) > -1 &&
          el.fecha >= new Date(this.filterDateBegin + 'T00:00:00-06:00') &&
          el.fecha <= new Date(this.filterDateFinish + 'T00:00:00-06:00')
      })
      return filter
    }
  },
  mounted: function(){
    this.db.ref('/Traslados')
      .on('value', snapshot => {
        this.traslados = []
        this.loadData(snapshot.val())
      })
  },
  data: function() {
    return {
      db: firebase.database(),
      fields: ['numRollo', 'gramaje',
               {key: 'width', label: 'Ancho'},
               'fecha', 'hora', 'partida', 'llegada'
              ],
      traslados: [],
      perPage: 100,
      currentPage: 1,
      filterRoll: '',
      filterDateBegin: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10).toString(),
      filterDateFinish: new Date().toISOString().slice(0, 10).toString(),
      filterStart: '',
      filterEnd: '',
      filterGramaje: '',
      filterWidth: '',
      options: [
        {value: '', text: 'Todos'},
        {value: 'En transito', text: 'En transito'},
        {value: 'Telisa', text: 'Telisa'},
        {value: 'Sislocar', text: 'Sislocar'},
        {value: 'Planta', text: 'Planta'},
        {value: 'Bodega', text: 'Bodega 1'},
      ]
    }
  },
  methods: {
    loadData: function (snap) {
      for (let key in snap) {
        let fe = snap[key].fecha
        let fechaArray = fe.split('-')
        let day = fechaArray[0]
        let month = fechaArray[1] - 1
        let year = fechaArray[2]
        let fecha = new Date(year, month, day)
        snap[key].fecha = fecha

        let gramaje = snap[key].gramaje
        let width = snap[key].width
        if (typeof gramaje === 'undefined') snap[key].gramaje = 'No definido'
        if (typeof width === 'undefined') snap[key].width = 'No definido'
        this.traslados.push(snap[key])
      }

    }
  }
}
</script>
