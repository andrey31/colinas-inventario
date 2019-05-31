<template>

<b-container fluid>
  <b-row class="mb-2">
    <b-col cols="12">

      <b-table
        :fields="fields"
        :items="items"
        head-variant="dark"
        responsive
        >

        <template slot="enUso" slot-scope="row">
          <label v-if="row.item.enUso">Sí</label>
          <label v-else>No</label>
        </template>
      </b-table>

    </b-col>
  </b-row>
</b-container>

</template>

<script>

export default{
  props: ['items', 'fields']

}
</script>
