<template>
  <b-container >
    <b-row class="mb-2">
      <b-col>
        <b-input-group>
          <b-input-group-text slot="prepend" >Fecha Inicial</b-input-group-text>
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
      <b-col cols="12" class="my-2">
        <b-card bg-variant="light" text-variant="dark" title="Información">
          <b-card-text>
            <b-row>
                <b-col>
                  Cantidad Total (Kgs): <b>{{(getTotalCantidad.kg)}}</b>
                </b-col>

            </b-row>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>
  <b-table
    :fields="fields"
    :items="getItems"
    head-variant="dark"
    responsive
    >
    <template slot="fecha" slot-scope="row">
      {{getDate(row.item.fecha)}}
    </template>

    <template slot="detalles" slot-scope="row">
      <b-button variant="primary" @click="row.toggleDetails">Detalles</b-button>
    </template>
    <template slot="row-details" slot-scope="row">
      <b-container class="bg-secondary p-4">
        <b-row>
          <b-col>
            <b-list-group >
              <b-list-group-item class="bg-gray-custom" v-if="row.item.centro >= 0"><b>Centro: {{row.item.centro}} kgs.</b></b-list-group-item>
              <b-list-group-item class="bg-gray-custom" v-if="row.item.fallaMecanica >= 0"><b>Falla mécanica: {{row.item.fallaMecanica}} kgs.</b></b-list-group-item>
              <b-list-group-item class="bg-gray-custom" v-if="row.item.golpes >= 0"><b>Golpes: {{row.item.golpes}} kgs.</b></b-list-group-item>
              <b-list-group-item class="bg-gray-custom" v-if="row.item.superficie >= 0"><b>Superficie: {{row.item.superficie}} kgs.</b></b-list-group-item>
            </b-list-group>
            <h3 v-if="row.item.desperdicioPorRollo.length > 0" class="pt-4 pb-2"><b>Desperdicios por rollo</b></h3>
            <h3 v-else><b>No hay rollos registrados</b></h3>
            <b-table class="bg-secondary text-white" head-variant="dark" :items="row.item.desperdicioPorRollo"></b-table>
          </b-col>
        </b-row>
      </b-container>
    </template>
  </b-table>
  </b-container>
</template>
<script>
export default{
  props: ['items', 'fields'],
  computed: {
    getItems(){
      let it = []
      it = this.items.filter( el => {
        return el.fecha >= new Date(this.dateFilterBegin + 'T00:00:00-06:00') &&
          el.fecha <= new Date(this.dateFilterFinish + 'T00:00:00-06:00')
      })
      return it
    },

    getTotalCantidad(){
      let kgsM = {}
      let kg = 0
      this.getItems.forEach( roll => {
        kg += parseFloat(roll.cantidad)
      })
      kgsM.kg = kg.toLocaleString('en-us')
      return kgsM
    }


  },

  data(){
    return {
      dateFilterBegin: new Date().toISOString().slice(0, 10).toString(),
      dateFilterFinish: new Date().toISOString().slice(0, 10).toString()
    }
  },
  methods: {

    getDate(date){
      return date.toLocaleDateString()
    }
  }

}
</script>
