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
  },

  data(){
    return {
      dateFilterBegin: new Date().toISOString().slice(0, 10).toString(),
      dateFilterFinish: new Date().toISOString().slice(0, 10).toString()
    }
  },
  methods: {

    getDate(date){
      return date.toISOString().slice(0, 10)
    }
  }

}
</script>
