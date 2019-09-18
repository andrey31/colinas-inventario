<template>
<b-container fluid>
  <h2>Registro de cambios</h2>
  <b-row>
    <b-col cols="6">
      <b-input-group>
        <b-input-group-text slot="prepend">Usuario</b-input-group-text>
        <b-form-select v-model="filters.usuario">
          <option value="">Todos</option>
          <option value="omar.duran">Omar</option>
          <option value="guillermo">Guillermo</option>
          <option value="jose.rodriguez">Jose Rodriguez</option>
          <option value="contabilidad">Contabilidad</option>
          <option value="jose.mora">Jose Mora</option>
          <option value="jennifer">Jennifer</option>
          <option value="ronny">Ronny</option>
          <option value="jackson">Jackson</option>
          <option value="josue">Josue</option>
          <option value="sandro">Sandro</option>
        </b-form-select>
      </b-input-group>
    </b-col>

    <b-col cols="6">
      <b-input-group>
        <b-input-group-text slot="prepend">Número rollo</b-input-group-text>
        <b-form-input v-model="filters.idNumber"></b-form-input>
      </b-input-group>
    </b-col>
  </b-row>
  <b-row class="pt-2">
    <b-col cols="6">
      <b-input-group>
        <b-input-group-text slot="prepend" >Fecha inicio</b-input-group-text>
        <b-form-input v-model="filters.fechaInicio" type="date"></b-form-input>
      </b-input-group>
    </b-col>

    <b-col cols="6">
      <b-input-group>
        <b-input-group-text slot="prepend" >Fecha final</b-input-group-text>
        <b-form-input v-model="filters.fechaFinal" type="date"></b-form-input>
      </b-input-group>
    </b-col>
  </b-row>
  <b-row class="pt-4">
    <b-col cols="12">
      <b-pagination
        v-model="currentPage"
        :total-rows="getChangesFilter.length"
        :per-page="perPage"
        align="center">
      </b-pagination>
    </b-col>
  </b-row>
  <b-tabs class="bg-light" pills card>
    <b-table
      :items="getChangesFilter"
      :per-page="perPage"
      :current-page="currentPage"
      head-variant="dark"
      responsive
      >
      <template slot="fecha" slot-scope="row">
        {{row.item.fecha.toLocaleDateString()}}
      </template>

    </b-table>
  </b-tabs>
</b-container>
</template>

<script>
import firebase from 'firebase/app'
export default {
  name: 'registro-cambios',
  computed: {
    getChangesFilter: function(){

      let it = this.changes.filter( el => {
        return el.fecha >= new Date(this.filters.fechaInicio + 'T00:00:00-06:00') &&
          el.fecha <= new Date(this.filters.fechaFinal + 'T00:00:00-06:00') &&
          el.numRollo.toString().indexOf(this.filters.idNumber) > -1 &&
          el.usuario.toLowerCase().indexOf((this.filters.usuario).toLowerCase()) > -1
      })
      return it
    }
  },
  mounted() {
    this.db.ref('/CambiosRealizados')
      .on('value', snapshot => {
        this.changes = []
        this.loadChanges(snapshot.val())
      })
  },
  data(){
    return  {
      db: firebase.database(),
      currentUser: firebase.auth().currentUser,
      changes: [],
      perPage: 100,
      currentPage: 1,
      filters: {
        fechaInicio: new Date().toISOString().slice(0, 10).toString(),
        fechaFinal: new Date().toISOString().slice(0, 10).toString(),
        idNumber: '',
        usuario: ''
      }
    }
  },
  methods: {
    loadChanges: function(data){
      for (let key in data){
        let fechaFormat =  null

        let fechaArray = data[key].fecha.split('-')
        let day = fechaArray[0]
        let month = fechaArray[1] - 1
        let year = fechaArray[2]
        fechaFormat = new Date(year, month, day)

        this.changes.push( {
          cambioRealizado: data[key].cambioRealizado,
          fecha: fechaFormat,
          hora: data[key].hora,
          nota: data[key].nota,
          numRollo: data[key].numRollo,
          ubicacion: data[key].ubicacion,
          usuario: data[key].usuario
        })
      }
    }
  }

}
</script>
