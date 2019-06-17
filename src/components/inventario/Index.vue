<template>

<b-container fluid>
  <template>
    <b-row class="mb-2">
      <!-- <b-col cols="4"> -->
      <!--   <b-input-group> -->
      <!--     <b-input-group-text slot="prepend">Almacen</b-input-group-text> -->
      <!--     <b-form-input v-model="filterAlmacen"></b-form-input> -->
      <!--   </b-input-group> -->
      <!-- </b-col> -->
      <b-col cols="4">
        <b-input-group>
          <b-input-group-text slot="prepend">Gramaje</b-input-group-text>
          <b-form-input v-model="filterGramaje"></b-form-input>
        </b-input-group>
      </b-col>
      <b-col cols="4">
        <b-input-group>
          <b-input-group-text slot="prepend">Tipo papel</b-input-group-text>
          <b-form-input v-model="filterType"></b-form-input>
        </b-input-group>
      </b-col>
      <!-- <b-col cols="12" md="4" offset-md="7"> -->
      <!--   <b-input-group> -->
      <!--     <b-input-group-prepend is-text> -->
      <!--       <v-icon name="search"></v-icon> -->
      <!--     </b-input-group-prepend> -->
      <!--     <b-form-input v-model="filter" placeholder="Busqueda"> -->
      <!--     </b-form-input> -->
      <!--   </b-input-group> -->
      <!-- </b-col> -->
      <b-col cols="4">
        <b-input-group>
          <b-input-group-text slot="prepend">Width</b-input-group-text>
          <b-form-input v-model="filterWidth"></b-form-input>
        </b-input-group>

      </b-col>
    </b-row>
    <b-row>
      <b-col cols="4">
          <b-input-group>
          <b-input-group-text slot="prepend" >Bodega</b-input-group-text>
          <b-form-input v-model="filterBodega" :disabled="disabledBodega"></b-form-input>
          </b-input-group>
                  <b-button class="mt-4">Exportar</b-button>
      </b-col>

      <b-col cols="8">
        <b-card bg-variant="light" text-variant="dark" title="Rollos información">
          <b-card-text>
            <b-row>
              <div v-for="gramaje, index in totalRolls.rollsByGramaje">

                <b-col >
                  <b>{{gramaje.gramaje}} cantidad: {{gramaje.count}}</b>
                  <br/>

                </b-col>

              </div>
              <b-col>
                Total de rollos: <b>{{totalRolls.length}}</b>
              </b-col>
            </b-row>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>

  </template>
  <b-row class="mb-2">
    <b-col cols="12">

      <b-table
        :fields="fields"
        :items="getRolls"
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
  props: ['items', 'fields'],
  computed: {
    getRolls(){


      this.rollsFilter = this.items.filter( el => {
        let bodega = el.bodega

        typeof bodega === 'undefined' ? this.disabledBodega = true : this.disabledBodega = false

        if (typeof bodega === 'undefined'){
          return el.gramaje.toString().indexOf(this.filterGramaje) > -1 &&
            el.typePaper.toLowerCase().indexOf(this.filterType.toLowerCase()) > -1 &&
            el.width.indexOf(this.filterWidth) > -1

        }else {
          return el.gramaje.toString().indexOf(this.filterGramaje) > -1 &&
            el.typePaper.toLowerCase().indexOf(this.filterType.toLowerCase()) > -1 &&
            el.width.indexOf(this.filterWidth) > -1 &&
            el.bodega.toString().indexOf(this.filterBodega) > -1
        }

      })
      return this.rollsFilter
    },
    totalRolls(){
      let total = {}
      total.length = this.rollsFilter.length

      // this.rollsFilter.forEach( roll => {
      //     console.log(roll.meters)
      //     total.meters += roll.meters
      // })
      // total.meters = this.rollsFilter.reduce( (a, b) => a + b.meters, 0).toFixed(2)

      let rollsByGramaje = {}
      this.rollsFilter.forEach( roll => {
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
        console.log(rollsByGramajeType[key].length)
        gramajes.push({'gramaje': key, 'count': rollsByGramajeType[key].length})
      })
      total.rollsByGramaje = gramajes
      return total
    }
  },
  data(){
    return {
      filterGramaje: '',
      filterType: '',
      filterWidth: '',
      filterBodega: '',
      rollsFilter: [],
      disabledBodega: false
    }
  }

}
</script>
