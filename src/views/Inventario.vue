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
        :items="itemsSobrantes"
        :fields="fields">
      </IndexInventario>
    </b-tab>

    <b-tab title="Historial"
           @click="loadHistorial"
           >
      <IndexInventario
        :items="itemsHistorial"
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
      itemsSobrantes: [],
      itemsHistorial: []

    }
  },
  methods: {
    loadIndex: function(){
      this.items = []
      this.fields = ['idNumber', 'bodega', 'enUso', 'kgs', 'meters', 'width', 'gramaje', 'typePaper', 'comments']
      this.db.ref('/Inventario')
        .once('value', snapshot => this.loadData( snapshot.val(), this.items))
    },
    loadSobrantes: function(){
      this.itemsSobrantes = []
      this.fields = ['idNumber', 'bodega', 'enUso', 'kgs', 'gramaje', 'typePaper', 'desperdicio', 'causaDesperdicio']
      this.db.ref('/InventarioSobrantes')
        .once('value', snapshot => this.loadData( snapshot.val(), this.itemsSobrantes))
    },
    loadHistorial: function(){
      this.itemsHistorial = []
      this.fields = [
        'idNumber', 'fecha', 'kgs', 'meters', 'gramaje', 'typePaper', 'desperdicio', 'causaDesperdicio', 'width', 'comments'
      ]
      this.db.ref('/HistorialInventario')
        .once('value', snapshot => this.loadData( snapshot.val(), this.itemsHistorial))
    },
    loadData: function(data, items){
      for(let key in data){
        items.push({
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
