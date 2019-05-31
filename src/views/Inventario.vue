<template>
<div>
  <h2>Inventario</h2>
  <b-tabs class="bg-light" pills card>

    <b-tab title="Inventario"
           @click="loadIndex()"
           active >

      <IndexInventario
        :items="items"
        :fields="fields">
      </IndexInventario>
    </b-tab>

    <b-tab title="Sobrantes"
           @click="loadSobrantes()"
           >
      <IndexInventario
        :items="items"
        :fields="fields">
      </IndexInventario>
    </b-tab>

    <b-tab title="Historial"
           @click="loadHistorial"
           >
      <IndexInventario
        :items="items"
        :fields="fields">
      </IndexInventario>
    </b-tab>

  </b-tabs>
</div>
</template>

<script>
import firebase from 'firebase/app'
import IndexInventario from '../components/inventario/Index.vue'

export default{
  name: 'Inventario',
  components: {
    IndexInventario
  },
  mounted(){
    this.loadIndex()
  },
  data(){
    return {
      db: firebase.database(),
      fields: [],
      items: [],

    }
  },
  methods: {
    loadIndex: function(){
      this.items = []
      this.fields = ['idNumber', 'bodega', 'enUso', 'kgs', 'meters', 'width', 'gramaje', 'typePaper', 'comments']
      this.db.ref('/Inventario')
        .on('value', snapshot => this.loadData( snapshot.val()))
    },
    loadSobrantes: function(){
      this.items = []
      this.fields = ['idNumber', 'bodega', 'enUso', 'kgs', 'gramaje', 'typePaper', 'desperdicio', 'causaDesperdicio']
      this.db.ref('/InventarioSobrantes')
        .on('value', snapshot => this.loadData( snapshot.val()))
    },
    loadHistorial: function(){
      this.items = []
      this.fields = [
        'idNumber', 'fecha', 'kgs', 'meters', 'gramaje', 'typePaper', 'desperdicio', 'causaDesperdicio', 'comments'
      ]
      this.db.ref('/HistorialInventario')
        .on('value', snapshot => this.loadData( snapshot.val()))
    },
    loadData: function(data){
      for(let key in data){
        this.items.push({
          'idNumber': data[key].idNumber,
          'bodega': data[key].bodega,
          'enUso': data[key].enUso,
          'kgs': data[key].kgs,
          'meters': data[key].meters,
          'width': `${data[key].width}"`,
          'gramaje': data[key].gramaje,
          'typePaper': data[key].typePaper,
          'comments': data[key].comments,
          'desperdicio': data[key].desperdicio,
          'causaDesperdicio': data[key].causaDesperdicio,
          'fecha': data[key].fecha

        })
      }
    }
  }
}

</script>
