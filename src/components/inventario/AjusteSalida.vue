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
          <option value="LINER R">LINER R</option>
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
    <b-col cols="12">
      <b-card bg-variant="light" text-variant="dark" title="Rollos información">
      </b-card>
    </b-col>
  </b-row>
  <b-row class="pt-4">
    <b-table
      :fields="fields"
      :items="items"
      >
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
        {key: 'typePaper', label: 'Tipo papel'}, 'dua', 'boleta', 'comments'
      ]
    }
  }

}
</script>
